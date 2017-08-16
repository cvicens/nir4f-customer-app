import { ToastController } from 'ionic-angular';

import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/Rx";

import * as Immutable from 'immutable';

// Services
import { SocketService } from './socket.service';
import { FHService } from './fh.service';

// Model
import { Event } from '../model/event';
import { LiveQuiz } from '../model/live-quiz';
import { Question } from '../model/question';
import { Agenda } from '../model/agenda';

import { Analysis } from '../model/analysis';
import { Advisor } from '../model/advisor';

@Injectable()
export class StateService implements OnInit, OnDestroy {
  private _eventsForToday: BehaviorSubject<Array<Event>> = new BehaviorSubject(new Array<Event>());
  public readonly eventsForToday: Observable<Array<Event>> = this._eventsForToday.asObservable();

  private _event: BehaviorSubject<Event> = new BehaviorSubject(null);
  public readonly event: Observable<Event> = this._event.asObservable();

  private _eventAgenda: BehaviorSubject<Agenda> = new BehaviorSubject(null);
  public readonly eventAgenda: Observable<Agenda> = this._eventAgenda.asObservable();

  private _eventHashtag: BehaviorSubject<string> = new BehaviorSubject(null);
  public readonly eventHashtag: Observable<string> = this._eventHashtag.asObservable();

  private _eventId: BehaviorSubject<string> = new BehaviorSubject(null);
  public readonly eventId: Observable<string> = this._eventId.asObservable();

  private _quizId: BehaviorSubject<string> = new BehaviorSubject(null);
  public readonly quizId: Observable<string> = this._quizId.asObservable();

  private _liveQuiz: BehaviorSubject<LiveQuiz> = new BehaviorSubject(new LiveQuiz(-1, null));
  public readonly liveQuiz: Observable<LiveQuiz> = this._liveQuiz.asObservable();

  private _currentQuestionIndex: BehaviorSubject<number> = new BehaviorSubject(-1);
  public readonly currentQuestionIndex: Observable<number> = this._currentQuestionIndex.asObservable();

  private _pastQuestions: BehaviorSubject<Array<Question>> = new BehaviorSubject(new Array<Question>());
  public readonly pastQuestions: Observable<Array<Question>> = this._pastQuestions.asObservable();

  private _currentQuestion: BehaviorSubject<Question> = new BehaviorSubject(new Question());
  public readonly currentQuestion: Observable<Question> = this._currentQuestion.asObservable();

  private _currentAnswer: BehaviorSubject<number> = new BehaviorSubject(-1);
  public readonly currentAnswer: Observable<number> = this._currentAnswer.asObservable();

  private _quizStarted: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly quizStarted: Observable<boolean> = this._quizStarted.asObservable();

  private _quizEnded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly quizEnded: Observable<boolean> = this._quizEnded.asObservable();

  private _quizStopped: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly quizStopped: Observable<boolean> = this._quizStopped.asObservable();

  private _analyses: BehaviorSubject<Array<Analysis>> = new BehaviorSubject(new Array<Analysis>());
  public readonly analyses: Observable<Array<Analysis>> = this._analyses.asObservable();

  private _currentAnalysis: BehaviorSubject<Analysis> = new BehaviorSubject(new Analysis());
  public readonly currentAnalysis: Observable<Analysis> = this._currentAnalysis.asObservable();

  private _advisors: BehaviorSubject<Array<Advisor>> = new BehaviorSubject(new Array<Advisor>());
  public readonly advisors: Observable<Array<Advisor>> = this._advisors.asObservable();

  private _currentAdvisor: BehaviorSubject<Advisor> = new BehaviorSubject(new Advisor());
  public readonly currentAdvisor: Observable<Advisor> = this._currentAdvisor.asObservable();

  // Sockets
  questionsConnection;
  startQuizConnection;
  stopQuizConnection;
  lastQuestionConnection;

  state = Immutable.Map({
    username: null,
    department: null,
    eventId: null,
    quizId: null,
    events: null,
    event: null,
    liveQuiz: null,
    userRoles: null
  });
  
  constructor(public toastCtrl: ToastController, private fhService: FHService, private socketService: SocketService) {
    console.log('New StateService!!!!');
    this.socketService.ready.subscribe(ready => {
      if (ready) {
        this.initSockets();
      }
    });
    this.socketService.reconnected.subscribe(data => {
      if (data) {
        // Let's re-join the live quiz (room) for this event (this is a new socket...)
        let liveQuizId = this._event.getValue().id + this._event.getValue().quizId;
        this.socketService.joinLiveQuiz(liveQuizId);
        this.presentToast('Successfully reconnected');
      }
    });

    // dummy advisors
    const dummyAdvisors: Array<Advisor> = [new Advisor('JOHN', 'SMITH', '+44-555-555-555'), new Advisor('JAMES', 'MORGAN', '+44-555-444-444')];
    this._advisors.next(dummyAdvisors);
  }

  ngOnInit() {
    console.log('StateService->ngOnInit()');
  }

  // Let's subscribe our Observable sockets
  initSockets() {
    console.log('StateService->initSockets()');
    
    // Start quiz message
    this.startQuizConnection = this.socketService.getStartQuizEvent().subscribe((message: any) => {
      // TODO type this message!
      console.log('StateService: start quiz received', message);

      // Let's get some usefull data about the quiz...
      this.fetchLiveQuiz();
      this._quizStarted.next(true);
      this._quizEnded.next(false);

      this.presentToast('Quiz started! Let\'s go down the rabbit hole!');
    });

    // Get questions as they are released
    this.questionsConnection = this.socketService.getQuestions().subscribe((message: any) => {
      // TODO type this message!
      console.log('StateService: new question received', message);
      
      this._pastQuestions.getValue().push(message.question);

      this._pastQuestions.next(this._pastQuestions.getValue());
      this._currentQuestion.next(message.question);
      this._currentQuestionIndex.next(message.currentQuestionIndex);
      this._currentAnswer.next(-1);
    });

    // Stop quiz message
    this.stopQuizConnection = this.socketService.getStopQuizEvent().subscribe((message: any) => {
      // TODO type this message!
      console.log('StateService : stop quiz received', message);
      this._pastQuestions.next(new Array<Question>());
      this._currentQuestion.next(null);
      this._currentQuestionIndex.next(-1);
      this._currentAnswer.next(-1);

      this._quizStarted.next(false);
      this._quizEnded.next(true);
      this._quizStopped.next(true);

      this.presentToast('Quiz ended! Maybe the luck be with you!');
    });

    this.lastQuestionConnection = this.socketService.getLastQuestionEvent().subscribe((message: any) => {
      // TODO type this message!
      console.log('StateService: last-question received', message);
      this._quizEnded.next(true);

      this.presentToast('Last question received!');
    });
  }

  // Let's unsubscribe our Observable
  ngOnDestroy() {
    this.questionsConnection.unsubscribe();
    this.startQuizConnection.unsubscribe();
    this.stopQuizConnection.unsubscribe();
  }

  fetchLiveQuiz() {
    console.log('Before calling getQuizById endpoint');

    this.fhService.getLiveQuizById(this._eventId.getValue(), this._quizId.getValue())
    .then( (liveQuiz) => {
      this._liveQuiz.next(liveQuiz);

      this._currentQuestionIndex.next(liveQuiz.currentQuestionIndex);
      this._pastQuestions.next(liveQuiz.quiz && liveQuiz.quiz.questions ? liveQuiz.quiz.questions.slice(0, this._currentQuestionIndex.getValue() + 1) : []);
      this._currentQuestion.next(liveQuiz.quiz.questions[this._currentQuestionIndex.getValue()]);
    })
    .catch( (err) => {
      console.log(err);
    });
  }

  submitAnswerForCurrentQuestion(answer: number) {
    this.fhService.submitAnswer(
      this._eventId.getValue(), 
      this._quizId.getValue(), 
      this.getUsername(), 
      this.getDepartment(), 
      this._currentQuestionIndex.getValue(), 
      answer)
    .then((response) => {
      console.log('submitAnswer response', response);
      this._currentQuestion.getValue().submittedAnswer = answer;
      this._currentQuestion.next(this._currentQuestion.getValue());
      this._pastQuestions.getValue()[this._currentQuestionIndex.getValue()].submittedAnswer = answer;
      this._pastQuestions.next(this._pastQuestions.getValue());
    })
    .catch( (err) => {
      console.log(err);
    });
  }

  selectEvent(event) {
    if (event) {
      this._event.next(event);
      this._eventHashtag.next(event.hashtag);
      this._eventAgenda.next(event.agenda);
      this._eventId.next(event.id);
      this._quizId.next(event.quizId);

      // Let's join the live quiz (room) for this event
      let liveQuizId = this._event.getValue().id + this._event.getValue().quizId;
      this.socketService.joinLiveQuiz(liveQuizId);
    }
  }

  getEventsForToday() {
    //this.fhService.getEventsAtLocationForToday('SPAIN', 'MADRID')
    this.fhService.getEventsForDate(new Date())
    .then( (events) => {
      this._eventsForToday.next(events);
    })
    .catch( (err) => {
      console.error(err);
      // TODO: core error message and toast
    });
  }

  startQuiz() {
    console.log('Before calling startQuiz');
    this.socketService.startQuiz(this._eventId.getValue(), this._quizId.getValue());
  }

  stopQuiz() {
    console.log('Before calling stopQuiz');
    this.socketService.stopQuiz(this._eventId.getValue(), this._quizId.getValue());
  }

  nextQuestion() {
    console.log('Before calling nextQuestion');
    this.socketService.nextQuestion(this._eventId.getValue(), this._quizId.getValue());
  }

  getUsername() {
    return this.state.get('username');
  }

  getDepartment() {
    return this.state.get('department');
  }

  getUserRoles() {
    return this.state.get('userRoles');
  }

  updateUsername(username: string) {
    this.state = this.state.merge({ username: username });
  }

  updateDepartment(department: string) {
    this.state = this.state.merge({ department: department });
  }

  updateUserRoles(userRoles: string[]) {
    this.state = this.state.merge({ userRoles: userRoles });
  }

  random (min, max) {
    return Math.random() * (max - min) + min;
  }

  randomAnalysis () {
    const date = new Date().toUTCString();
    var newAnalisys = new Analysis(date, this.random(60, 70), this.random(10, 15), 
      this.random(30, 60), this.random(50, 60), this.random(1, 3), 
      this.random(5, 8), this.random(4, 9), this.random(5, 6), 
      this.random(4, 9), this.random(2, 3));

    // Generate some comments... maybe this should come from a BRMS rule in the cloud...
    if (newAnalisys.dm <= 55) {
      newAnalisys.comments.push ('Dry matter below normal levels, consider place forage at a drier location');
    }
    if (newAnalisys.cp <= 12) {
      newAnalisys.comments.push ('Crude protein below minimum level for new borns.');
    }
    if (newAnalisys.dv <= 40) {
      newAnalisys.comments.push ('D Value below 40% indicates poor mix, consider adding XYZ');
    }
    if (newAnalisys.ph <= 5.5) {
      newAnalisys.comments.push ('pH too acid, consider analyzing the water source and look for acid agents like urine or milk');
    }

    return newAnalisys;
  }

  // Method that should use the scanner to get new data... 
  // and run some algorithm to get results, store them and push them to RHMAP
  runScan() {
    // Let's generate a random analysis
    var newAnalysis = this.randomAnalysis();
    this._analyses.getValue().push(newAnalysis);
    this._currentAnalysis.next(newAnalysis);    
  }

  // Sets analysis with provided id as selected
  setAsCurrentAnalysis(id: string) {
    // Let's generate a random analysis
    const analysis = this._analyses.getValue().find((element) => {return element.id === id});
    if (analysis) {
      this._currentAnalysis.next(analysis);    
    }
  }

  // Method to share this analysis with a 
  shareAnalysis(id: string, advisorId: string) {
    var analyses = this._analyses.getValue();
    var analysis = analyses.find((element) => {return element.id === id});
    const advisor = this._advisors.getValue().find((element) => {return element.id === advisorId});
    if (analysis && advisor) {
      analysis.sharedWith.push(advisor.id);
      analyses = analyses.map((element) => {return element.id === id ? analysis : element;});
      this._analyses.next(analyses);    
      // TODO: call a service to efectively share it
      this.presentToast('Analysis shared correctly with ' + advisor.firstName + ' ' + advisor.lastName);
    }
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }
}