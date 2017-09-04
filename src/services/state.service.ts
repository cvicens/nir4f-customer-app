import { ToastController } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/Rx";

// Services
import { SocketService } from './socket.service';
import { FHService } from './fh.service';

// Model
import { Event } from '../model/event';
import { LiveQuiz } from '../model/live-quiz';
import { Question } from '../model/question';
import { Agenda } from '../model/agenda';

import { DatasetItem } from '../model/dataset';
import { Analysis } from '../model/analysis';
import { SharedAnalysis } from '../model/shared-analysis';
import { Advisor } from '../model/advisor';

const CURRENT_ANALISIS_KEY = 'currentAnalysis';
const AVG_ANALISIS_KEY = 'avgAnalysis';
const SCORE_ANALISIS_KEY = 'scoreAnalysis';

const ANALYSES_KEY = 'analyses';
const SHARED_ANALYSES_KEY = 'shared_analyses';

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

  private _loginStatus: BehaviorSubject<string> = new BehaviorSubject(null);
  public readonly loginStatus: Observable<string> = this._loginStatus.asObservable();

  private _userId: BehaviorSubject<string> = new BehaviorSubject(null);
  public readonly userId: Observable<string> = this._userId.asObservable();

  private _userDepartment: BehaviorSubject<string> = new BehaviorSubject(null);
  public readonly userDepartment: Observable<string> = this._userDepartment.asObservable();

  private _userRoles: BehaviorSubject<Array<string>> = new BehaviorSubject(new Array<string>());
  public readonly userRoles: Observable<Array<string>> = this._userRoles.asObservable();

  private _analyses: BehaviorSubject<Array<Analysis>> = new BehaviorSubject(new Array<Analysis>());
  public readonly analyses: Observable<Array<Analysis>> = this._analyses.asObservable();

  private _sharedAnalyses: BehaviorSubject<Array<SharedAnalysis>> = new BehaviorSubject(new Array<SharedAnalysis>());
  public readonly sharedAnalyses: Observable<Array<SharedAnalysis>> = this._sharedAnalyses.asObservable();

  private _currentAnalysis: BehaviorSubject<Analysis> = new BehaviorSubject(null);
  public readonly currentAnalysis: Observable<Analysis> = this._currentAnalysis.asObservable();

  private _avgAnalysis: BehaviorSubject<Analysis> = new BehaviorSubject(null);
  public readonly avgAnalysis: Observable<Analysis> = this._avgAnalysis.asObservable();

  private _scoreAnalysis: BehaviorSubject<Array<{id: string, score: number}>> = new BehaviorSubject(new Array<{id: string, score: number}>());
  public readonly scoreAnalysis: Observable<Array<{id: string, score: number}>> = this._scoreAnalysis.asObservable();

  private _advisors: BehaviorSubject<Array<Advisor>> = new BehaviorSubject(new Array<Advisor>());
  public readonly advisors: Observable<Array<Advisor>> = this._advisors.asObservable();

  private _currentAdvisor: BehaviorSubject<Advisor> = new BehaviorSubject(new Advisor());
  public readonly currentAdvisor: Observable<Advisor> = this._currentAdvisor.asObservable();

  private _online: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly online: Observable<boolean> = this._online.asObservable();

  // Sockets
  questionsConnection;
  startQuizConnection;
  stopQuizConnection;
  lastQuestionConnection;

  constructor(public toastCtrl: ToastController, private storage: Storage, private fhService: FHService, private socketService: SocketService) {
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
    this.fhService.ready.subscribe(ready => {
      if (ready) {
        this.initDatasets();
      }
    });

    // dummy advisors
    const dummyAdvisors: Array<Advisor> = [new Advisor('JOHN', 'SMITH', '+44-555-555-555'), new Advisor('JAMES', 'MORGAN', '+44-555-444-444')];
    this._advisors.next(dummyAdvisors);

    // Init data
    const initAvgAnalysis = new Analysis ('', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    this._avgAnalysis.next(initAvgAnalysis);

    // Get local data... test
    this.storage.get(CURRENT_ANALISIS_KEY)
    .then ((value) => { 
      if (value) {
        console.log('🗄 ', CURRENT_ANALISIS_KEY, value);
        this._currentAnalysis.next(value);
      }
    })
    .catch((error) => {
      console.error('Storage error', error)
    });

    this.storage.get(AVG_ANALISIS_KEY)
    .then ((value) => { 
      if (value) {
        console.log('🗄 ', AVG_ANALISIS_KEY, value);
        this._avgAnalysis.next(value);
      }
    })
    .catch((error) => {
      console.error('Storage error', error)
    });

    this.storage.get(SCORE_ANALISIS_KEY)
    .then ((value) => { 
      if (value) {
        console.log('🗄 ', SCORE_ANALISIS_KEY, value);
        this._scoreAnalysis.next(value);
      }
    })
    .catch((error) => {
      console.error('Storage error', error)
    });

    this.storage.get(ANALYSES_KEY)
    .then ((value) => { 
      if (value) {
        console.log('🗄 ', ANALYSES_KEY, value);
        this._analyses.next(value);
      }
    })
    .catch((error) => {
      console.error('Storage error', error)
    });
  }

  ngOnInit() {
    console.log('StateService->ngOnInit()');
  }

  // Let's subscribe our Observable datasets
  initDatasets() {
    console.log('StateService->initDatasets()');
    this.fhService.syncNotification.subscribe(notification => {
      if (notification) {

        if( 'sync_complete' == notification.code ) {
          this.fhService.getAllItemsFromDataset(notification.dataset_id)
          .then((items) => {
            console.log('sync_complete : ', items);
          })
          .catch((err) => {
            console.error('getAllItemsFromDataset err:', err);
          });
        }
        else if( 'local_update_applied' === notification.code ) {
          this.fhService.getAllItemsFromDataset(notification.dataset_id)
          .then((items) => {
            console.log('local_update_applied : ', items);
          })
          .catch((err) => {
            console.error('local_update_applied err:', err);
          });
        }
        else if( 'remote_update_failed' === notification.code ) {
          const errorMsg = notification.message;
          console.log('remote_update_failed : ', errorMsg);
        }
        
      }
    });
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
      this._userId.getValue(), 
      this._userDepartment.getValue(), 
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

  isUserInRole(role) {
    return this._userRoles.getValue().find((element) => {return element === role}) != null ? true : false;
  }

  login = (username: string, password: string) => {
    //this.fhService.login(this.loginForm.value.username, this.loginForm.value.password)
    this.fhService.login(username, password)
    .then( (result) => {
      console.log('login result', result);
      // Lets update the state of the app...
      this._userId.next(result.userId);
      this._userDepartment.next(result.department);
      this._userRoles.next(result.roles);
      this._loginStatus.next('SUCCESS');

      // Advisors
      this._advisors.next(result.advisors);

      this.fhService.manageDataset(ANALYSES_KEY, {eq: {userId: this._userId.getValue()}});
      if(this.isUserInRole('ADVISOR')) {
        this.fhService.manageDataset(SHARED_ANALYSES_KEY, {eq: {advisorId: this._userId.getValue()}});
      } else {
        this.fhService.manageDataset(SHARED_ANALYSES_KEY, {eq: {userId: this._userId.getValue()}});
      }
    })
    .catch( (err) => {
      console.log(err);
      this._loginStatus.next('ERROR');
    });
    
  }

  auth = (username: string, password: string) => {
    this.fhService.auth(username, password)
    .then( (result) => {
      console.log('auth result', result);
      // Lets update the state of the app...
      this._userId.next(username);
      this._userDepartment.next(result.department);
      this._userRoles.next(result.roles);
      this._loginStatus.next('SUCCESS');

      this.fhService.manageDataset(ANALYSES_KEY, {eq: {userId: this._userId.getValue()}});
      if(this.isUserInRole('ADVISOR')) {
        this.fhService.manageDataset(SHARED_ANALYSES_KEY, {eq: {advisorId: this._userId.getValue()}});
      } else {
        this.fhService.manageDataset(SHARED_ANALYSES_KEY, {eq: {userId: this._userId.getValue()}});
      }
    })
    .catch( (err) => {
      console.log(err);
      this._loginStatus.next('ERROR');
    });
  }

  random (min, max) {
    return Math.random() * (max - min) + min;
  }

  randomAnalysis () {
    const date = new Date().toUTCString();
    var newAnalisys = new Analysis(this._userId.getValue(), date, this.random(60, 70), this.random(10, 15), 
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

  calcScoreAnalysis (analyses: Array<Analysis>) {
    // Let's generate score values
    const scoreAnalysis = analyses.map((item, current) => {
        return {
          id:    item.id,
          date:  item.date,
          score: (item.dv + item.me + item.adf )/ item.ndf
        };
    });

    return scoreAnalysis;
  }

  calcAvgAnalysis (analyses: Array<Analysis>) {
    // Let's generate AVG values
    var avgAnalysis = new Analysis(this._userId.getValue());
    const acc = analyses.reduce((acc, current) => {
        return {
          accDM:     acc.accDM     + (current.dm     ? current.dm     : 0),
          accCP:     acc.accCP     + (current.cp     ? current.cp     : 0),
          accDV:     acc.accDV     + (current.dv     ? current.dv     : 0),
          accME:     acc.accME     + (current.me     ? current.me     : 0),
          accStarch: acc.accStarch + (current.starch ? current.starch : 0),
          accSugar:  acc.accSugar  + (current.sugar  ? current.sugar  : 0),
          accNDF:    acc.accNDF    + (current.ndf    ? current.ndf    : 0),
          accADF:    acc.accADF    + (current.adf    ? current.adf    : 0),
          accPH:     acc.accPH     + (current.ph     ? current.ph     : 0),
          accLA:     acc.accLA     + (current.la     ? current.la     : 0)
        };
    }, {accDM: 0, accCP: 0, accDV: 0, accME: 0, accStarch: 0, accSugar: 0, accNDF: 0, accADF: 0, accPH: 0, accLA: 0});
    avgAnalysis.dm     = analyses.length <= 0 ? 0 : Math.round(acc.accDM / analyses.length);
    avgAnalysis.cp     = analyses.length <= 0 ? 0 : Math.round(acc.accCP / analyses.length);
    avgAnalysis.dv     = analyses.length <= 0 ? 0 : Math.round(acc.accDV / analyses.length);
    avgAnalysis.me     = analyses.length <= 0 ? 0 : Math.round(acc.accME / analyses.length);
    avgAnalysis.starch = analyses.length <= 0 ? 0 : Math.round(acc.accStarch / analyses.length);
    avgAnalysis.sugar  = analyses.length <= 0 ? 0 : Math.round(acc.accSugar / analyses.length);
    avgAnalysis.ndf    = analyses.length <= 0 ? 0 : Math.round(acc.accNDF / analyses.length);
    avgAnalysis.adf    = analyses.length <= 0 ? 0 : Math.round(acc.accADF / analyses.length);
    avgAnalysis.ph     = analyses.length <= 0 ? 0 : Math.round(acc.accPH / analyses.length);
    avgAnalysis.la     = analyses.length <= 0 ? 0 : Math.round(acc.accLA / analyses.length);

    return avgAnalysis;
  }

  // Method that should use the scanner to get new data... 
  // and run some algorithm to get results, store them and push them to RHMAP
  runScan() {
    // Let's generate a random analysis
    var newAnalysis = this.randomAnalysis();
    this._currentAnalysis.next(newAnalysis);
    // sync current analysis with server
    this.fhService.saveItemIntoDataset(ANALYSES_KEY, new DatasetItem(newAnalysis.id, newAnalysis))
    .then((data) => {
      console.log('saveItemIntoDataset data', data);
    })
    .catch((err) => {
      console.error('saveItemIntoDataset err', err);
    });
    const analyses = this._analyses.getValue();
    analyses.push(newAnalysis);
    this._analyses.next(analyses);

    // set a key/value
    this.storage.set(CURRENT_ANALISIS_KEY, newAnalysis);
    this.storage.set(ANALYSES_KEY, analyses);

    // Let's generate AVG values
    var avgAnalysis = this.calcAvgAnalysis(analyses);
    this._avgAnalysis.next(avgAnalysis);
    this.storage.set(AVG_ANALISIS_KEY, avgAnalysis);

    // Let's generate score values
    var scoreAnalysis = this.calcScoreAnalysis(analyses);
    this._scoreAnalysis.next(scoreAnalysis);
    this.storage.set(SCORE_ANALISIS_KEY, scoreAnalysis);
  }

  clearLocalStorage () {
    this.storage.clear()
    .then((data) => {
      console.log('😬 all cleared!', data);
    })
    .catch((err) => {
      console.error('😩 error clearing storage!', err);
    });

    this._analyses.next(new Array<Analysis>());
    const initAvgAnalysis = new Analysis ('', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    this._avgAnalysis.next(initAvgAnalysis);
    var scoreAnalysis = this.calcScoreAnalysis(this._analyses.getValue());
    this._scoreAnalysis.next(scoreAnalysis);
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
  shareAnalysis(analysisId: string, advisorId: string) {
    var analyses = this._analyses.getValue();
    const analysis = analyses.find((element) => {return element.id === analysisId});
    const advisor = this._advisors.getValue().find((element) => {return element.id === advisorId});
    if (analysis && advisor) {
      const sharedAnalysis = new SharedAnalysis(analysisId, this._userId.getValue(), advisorId);
      this.fhService.saveItemIntoDataset(SHARED_ANALYSES_KEY, new DatasetItem(sharedAnalysis.id, sharedAnalysis))
      .then((data) => {
        console.log('saveItemIntoDataset data', data);

        this.fhService.getItemFromDataset(SHARED_ANALYSES_KEY, data.uid)
        .then((data) => {
          console.log('shared analysis from dataset', data);
        })
        .catch((err) => {
          console.error('shared analysis error!', err);
        });
      })
      .catch((err) => {
        console.error('saveItemIntoDataset err', err);
      });
      

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