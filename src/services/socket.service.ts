import { Injectable } from '@angular/core';
//import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/Rx";

// Model
import { Event } from '../model/event';

// Services
import { FHService } from './fh.service';

// Sockets API
import * as io from 'socket.io-client';

// Messages
var RECONNECT_MESSAGE    = 'reconnect';
var START_QUIZ_MESSAGE    = 'start-quiz';
var START_QUIZ_OK_MESSAGE = 'start-quiz-ok';
var START_QUIZ_KO_MESSAGE = 'start-quiz-ko';
var STOP_QUIZ_MESSAGE     = 'stop-quiz';
var STOP_QUIZ_OK_MESSAGE  = 'stop-quiz-ok';
var STOP_QUIZ_KO_MESSAGE  = 'stop-quiz-ko';
var NEXT_QUESTION_MESSAGE = 'next-question';
var NEW_QUESTION_MESSAGE  = 'new-question';
var LAST_QUESTION_MESSAGE = 'last-question';
var JOIN_QUIZ_MESSAGE     = 'join-quiz';

@Injectable()
export class SocketService {
  // Our localhost address that we set in our server code
  private url; 
  private socket;

  // Ready flag
  private _ready: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly ready: Observable<boolean> = this._ready.asObservable();

  private _reconnected: BehaviorSubject<any> = new BehaviorSubject(null);
  public readonly reconnected: Observable<any> = this._reconnected.asObservable();

  constructor(private fhService: FHService) {
    console.log('New SocketService!!!!');

    this.fhService.ready.subscribe(ready => {
      if (ready) {
        if(this.init()) {
          this._ready.next(true);
        }
      }
    });
    
  }

  init () {
    this.url = this.fhService.getUrl();
    if (!this.url) {
      return false;
    }
    // Uncomment next line to enable sockets locally
    //this.url = "http://localhost:8001";
    this.socket = io(this.url);
    console.log('SocketService.url', this.url);
    
    this.socket.on(RECONNECT_MESSAGE, (data) => {
      console.log('🛰 SUCCESSFUL RECONNECTION', data);
      this._reconnected.next(data);
    });

    return true;
  }

  sendMessage(message){
    // Make sure the "add-message" is written here because this is referenced in on() in our server
    this.socket.emit('add-message', message);   
  }

  joinLiveQuiz(liveQuizId: string){
    if (liveQuizId) {
      // Send join message including our socket id and event data
      this.socket.emit(JOIN_QUIZ_MESSAGE, {liveQuizId: liveQuizId}, (ack) => {
        console.log('💬 Ack joining room', liveQuizId, '=>', ack);
      });
    }
  }

  getQuestions() {
    let observable = new Observable(observer => {
      
      this.socket.on(NEW_QUESTION_MESSAGE, (data) => {
        observer.next(data);   
      });

      return () => {
        //this.socket.disconnect();
        // So if unsubcribed... no more calling next... we don't close the socket because we need it for other subscribers
        this.socket.on(NEW_QUESTION_MESSAGE, (data) => {
          ;   
        });
      }; 
    });

    return observable;
  }

  getStartQuizEvent() {
    let observable = new Observable(observer => {
      
      this.socket.on(START_QUIZ_OK_MESSAGE, (data) => {
        observer.next(data);   
      });

      return () => {
        //this.socket.disconnect();
        // So if unsubcribed... no more calling next... we don't close the socket because we need it for other subscribers
        this.socket.on(START_QUIZ_OK_MESSAGE, (data) => {
          ;   
        });
      }; 
    });

    return observable;
  }

  getStopQuizEvent() {
    let observable = new Observable(observer => {
      
      this.socket.on(STOP_QUIZ_OK_MESSAGE, (data) => {
        observer.next(data);   
      });

      return () => {
        //this.socket.disconnect();
        // So if unsubcribed... no more calling next... we don't close the socket because we need it for other subscribers
        this.socket.on(STOP_QUIZ_OK_MESSAGE, (data) => {
          ;   
        });
      }; 
    });

    return observable;
  }

  getLastQuestionEvent() {
    let observable = new Observable(observer => {
      
      this.socket.on(LAST_QUESTION_MESSAGE, (data) => {
        observer.next(data);   
      });

      return () => {
        //this.socket.disconnect();
        // So if unsubcribed... no more calling next... we don't close the socket because we need it for other subscribers
        this.socket.on(LAST_QUESTION_MESSAGE, (data) => {
          ;   
        });
      }; 
    });

    return observable;
  }

  startQuiz = (eventId: string, quizId: string) => {
    this.socket.emit(START_QUIZ_MESSAGE, {eventId: eventId, quizId: quizId});   
  }

  stopQuiz = (eventId: string, quizId: string) => {
    this.socket.emit(STOP_QUIZ_MESSAGE, {eventId: eventId, quizId: quizId});   
  }

  nextQuestion = (eventId: string, quizId: string) => {
    this.socket.emit(NEXT_QUESTION_MESSAGE, {eventId: eventId, quizId: quizId});   
  }
}