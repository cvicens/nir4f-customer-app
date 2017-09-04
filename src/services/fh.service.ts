import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/Rx";

import {Md5} from 'ts-md5/dist/md5';

// Model
import { Dataset, DatasetItem } from '../model/dataset';
import { SyncNotification } from '../model/sync-notification';

// Services
//import { StateService } from './state.service';

import * as $fh from 'fh-js-sdk';

const INIT_EVENT = 'fhinit';

const ANALYSES_DATASET_ID = 'ANALYSES_DATASET';

const DEFAULT_SYNC_OPTIONS = { 
  "sync_frequency": 5, // Sync every X seconds for the 'tasks' dataset
  "has_custom_sync" : null,
};

@Injectable()
export class FHService {
  private _ready: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly ready: Observable<boolean> = this._ready.asObservable();

  private _syncNotification: BehaviorSubject<SyncNotification> = new BehaviorSubject(null);
  public readonly syncNotification: Observable<SyncNotification> = this._syncNotification.asObservable();

  private _datasets: BehaviorSubject<Map<string, Dataset<any>>> = new BehaviorSubject(new Map<string, Dataset<any>> ());
  public readonly datasets: Observable<Map<string, Dataset<any>>> = this._datasets.asObservable();

  constructor() {
    $fh.once(INIT_EVENT, (event) => {
      console.log('Service ready with url:', this.getUrl());
      this.init();
      this._ready.next(true);
    });
  }

  manageDataset(datasetId: string, query_params?, options?) {
    //var query = { "eq": { "eventId": eventId } };
    //var query_params = typeof eventId !== 'undefined'  ? query : {};
    
    // Extra params that will be sent to the back-end data handlers.
    var meta_data = {token: 'token1'};

    $fh.sync.manage(datasetId, options ? options : DEFAULT_SYNC_OPTIONS, query_params ? query_params : {}, meta_data, () => {
      console.log('dataset ' + datasetId + ' is now managed by sync');
      var datasets = this._datasets.getValue();
      if (datasets) {
        datasets.set(datasetId, new Dataset(datasetId));
        this._datasets.next(datasets);
      }
    });
  }

  init() {
    $fh.sync.init({
      "do_console_log" : true,
      "storage_strategy" : "dom"
    });
    
    $fh.sync.notify((notification) => {
      // The dataset that the notification is associated with
      const dataset_id = notification.dataset_id;
      
      // The unique identifier that the notification is associated with.
      // This will be the unique identifier for a record if the notification is related to an individual record,
      // or the current hash of the dataset if the notification is associated with a full dataset
      //  (for example, sync_complete)
      const uid = notification.uid;

      if ('sync_failed' == notification.code) {
        let datasets = this._datasets.getValue();
        datasets.set(dataset_id, new Dataset(dataset_id, false));
        this._datasets.next(datasets);
      } else if( 'sync_complete' == notification.code ) {
        let datasets = this._datasets.getValue();
        datasets.set(dataset_id, new Dataset(dataset_id, true));
        this._datasets.next(datasets);
      } else if( 'collision_detected' === notification.code ) {
        var collisionError = notification.message;
        console.log('collision @', notification, 'Error', collisionError);
        /*$fh.sync.removeCollision(dataset_id, notification.message.hash, function (success) {
          console.log('removeCollision success', success);
        }, function (err) {
          console.log('removeCollision err', err);
        });*/
      } else if( 'local_update_applied' === notification.code ) {
        console.log('local change applied', notification);
      } else if( 'remote_update_applied' === notification.code ) {
        console.log('remote change applied', notification);
      } else if( 'remote_update_failed' === notification.code ) {
        console.log('remote change failed', notification);
      }

      // Let others do something about it
      this._syncNotification.next(notification);
    });
  }

  deleteItemFromDataset (datasetId: string, item: DatasetItem) {
    return new Promise<any> ((resolve, reject) => {
      $fh.sync.doDelete(
        datasetId, item.code, 
        (data) => {
          resolve(data);
        }), 
        (error, _datasetId) => {
          reject({datasetId: _datasetId, error: error});
        }
    });
  }

  getItemFromDataset (datasetId: string, id: string) {
    return new Promise<any> ((resolve, reject) => {
      $fh.sync.doRead(
        datasetId, id, 
        (data) => {
          resolve(data);
        }, 
        (error, _datasetId) => {
          reject({datasetId: _datasetId, error: error});
        }
      );
    });
  }

  getAllItemsFromDataset (datasetId: string) {
    return new Promise<any> ((resolve, reject) => {
      $fh.sync.doList(
        datasetId, 
        (data) => {
          resolve(data);
        }, 
        (error, _datasetId) => {
          reject({datasetId: _datasetId, error: error});
        }
      );
    });
  }

  updateItemIntoDataset (datasetId: string, item: DatasetItem) {
    return new Promise<any> ((resolve, reject) => {
      $fh.sync.doUpdate(
        datasetId, item.code, item.data,
        (data) => {
          resolve(data);
        }), 
        (error, _datasetId) => {
          reject({datasetId: _datasetId, error: error});
        }
    });
  }

  saveItemIntoDataset (datasetId: string, item: DatasetItem) {
    return new Promise<any> ((resolve, reject) => {
      $fh.sync.doCreate(
        datasetId, item.data,
        (data) => {
          resolve(data);
        }), 
        (error, _datasetId) => {
          reject({datasetId: _datasetId, error: error});
        }
    });
  }

  readItemFromDataset (datasetId: string, id: string) {
    return new Promise<any> ((resolve, reject) => {
      $fh.sync.doRead(
        datasetId, id,
        (data) => {
          resolve(data);
        }), 
        (error, _datasetId) => {
          reject({datasetId: _datasetId, error: error});
        }
    });
  }

  getFormattedTime(date) {
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + (date.getMinutes()+1)).slice(-2);
  }

  getFormattedDate(date, separator = '') {
    var separator = separator ? separator : '';
    return  date.getFullYear() + separator + ('0' + (date.getMonth()+1)).slice(-2) + separator + ('0' + date.getDate()).slice(-2);
  }

  getUrl = () => {
    return $fh.getCloudURL();
  }

  login = (username: string, password: string) => {
    
    return new Promise<any>(function(resolve, reject) {
        var params = {
          path: 'login',
          method: 'POST',
          contentType: "application/json",
          data: { username: username, password: password },
          timeout: 15000
        };

      $fh.cloud(
        params, 
        (data) => {
          resolve(data);
        }, 
        (msg, err) => {
          // An error occurred during the cloud call. Alert some debugging information
          console.log('Cloud call failed with error message:' + msg + '. Error properties:' + JSON.stringify(err));
          reject(msg);
        });
    });
  }

  auth = (username: string, password: string) => {
    return new Promise<any>(function(resolve, reject) {
        // LDAP or Platform User Example
        $fh.auth({
          "policyId": "Redhatters", // name of auth policy to use - see link:{ProductFeatures}#administration[Auth Policies Administration] for details on how to configure an auth policy
          "clientToken": "e5fh23hxyk5gnc5ml75w44ti", // Your App ID
          "params": { // the parameters associated with the requested auth policy - see below for full details.
            "userId": username, 
            "password": password 
          }
        }, function (res) {
          // Authentication successful - store sessionToken in variable
          var sessionToken = res.sessionToken; // The platform session identifier
          var authResponse = res.authResponse; // The authentication information returned from the authentication service.
          // This may include things such as validated email address,
          // OAuth token or other response data from the authentication service
          resolve(res);
        }, function (msg, err) {
          console.log('LOGIN ERROR: ', JSON.stringify(msg), JSON.stringify(err));
          var errorMsg = err.message;
          /* Possible errors:
            unknown_policyId - The policyId provided did not match any defined policy. Check the auth policies defined. See link:{ProductFeatures}#administration[Auth Policies Administration]
            user_not_found - The auth policy associated with the policyId provided has been set up to require that all users authenticating exist on the platform, but this user does not exists.
            user_not_approved - - The auth policy associated with the policyId provided has been set up to require that all users authenticating are in a list of approved users, but this user is not in that list.
            user_disabled - The user has been disabled from logging in.
            user_purge_data - The user has been flagged for data purge and all local data should be deleted.
            device_disabled - The device has been disabled. No user or apps can log in from the requesting device.
            device_purge_data - The device has been flagged for data purge and all local data should be deleted.
          */
          if (errorMsg === "user_purge_data" || errorMsg === "device_purge_data") {
            // User or device has been black listed from administration console and all local data should be wiped
          } else {
            //alert("Authentication failed - " + errorMsg);
          }
          reject(err);
        });
    });
  }

  sayHello = (endpoint: string, method: string, name: string) => {
    return new Promise<any>(function(resolve, reject) {
      var params = {
          path: endpoint,
          method: method,
          contentType: "application/json",
          data: { hello: name },
          timeout: 15000
        };

      $fh.cloud(
        params, 
        function(data) {
          resolve(data);
        }, 
        function(msg, err) {
          // An error occurred during the cloud call. Alert some debugging information
          console.log('Cloud call failed with error message:' + msg + '. Error properties:' + JSON.stringify(err));
          reject({msg: msg, err: err});
        });
    });
  }

  getEventsAtLocationForToday = (country: string, city: string) => {
    return new Promise<any>(function(resolve, reject) {
        if (!country || !city) {
          reject({err: 'Not enough or good parameters country: ' + country + ' city: ' + city});
        }
        var params = {
          path: 'events/' + country.toUpperCase() + '/' + city.toUpperCase(),
          method: 'GET',
          contentType: "application/json",
          //data: { country: country, city: city },
          timeout: 15000
        };

      $fh.cloud(
        params, 
        function(data) {
          resolve(data);
        }, 
        function(msg, err) {
          // An error occurred during the cloud call. Alert some debugging information
          console.log('Cloud call failed with error message:' + msg + '. Error properties:' + JSON.stringify(err));
          reject({msg: msg, err: err});
        });
    });
  }

  getEventsForDate = (date) => {
    let self = this;
    return new Promise<any>(function(resolve, reject) {
        if (!date) {
          reject('Need a date object!');
        }
        var filter = {
          eq: {
            date: self.getFormattedDate(date, '-')
          }
        }
        var params = {
          path: 'events',
          method: 'POST',
          contentType: "application/json",
          data: filter,
          timeout: 15000
        };

      $fh.cloud(
        params, 
        function(data) {
          resolve(data);
        }, 
        function(msg, err) {
          // An error occurred during the cloud call. Alert some debugging information
          console.log('Cloud call failed with error message:' + msg + '. Error properties:' + JSON.stringify(err));
          reject({msg: msg, err: err});
        });
    });
  }

  getQuizById = (id: string) => {
    return new Promise<any>(function(resolve, reject) {
        if (!id) {
          reject({err: 'Not enough or good parameters id: ' + id});
        }
        var params = {
          path: 'quizzes?id=' + id,
          method: 'GET',
          contentType: "application/json",
          timeout: 15000
        };

      $fh.cloud(
        params, 
        function(data) {
          resolve(data);
        }, 
        function(msg, err) {
          // An error occurred during the cloud call. Alert some debugging information
          console.log('Cloud call failed with error message:' + msg + '. Error properties:' + JSON.stringify(err));
          reject({msg: msg, err: err});
        });
    });
  }

  getLiveQuizById = (eventId: string, quizId: string) => {
    return new Promise<any>(function(resolve, reject) {
        if (!eventId || !quizId) {
          reject({err: 'Not enough or good parameters eventId: ' + eventId + ' quizId: ' + quizId});
        }
        var params = {
          path: 'live/quiz',
          method: 'GET',
          contentType: "application/json",
          data: {eventId: eventId, quizId: quizId},
          timeout: 15000
        };

      $fh.cloud(
        params, 
        function(data) {
          resolve(data);
        }, 
        function(msg, err) {
          // An error occurred during the cloud call. Alert some debugging information
          console.log('Cloud call failed with error message:' + msg + '. Error properties:' + JSON.stringify(err));
          reject({msg: msg, err: err});
        });
    });
  }

  submitAnswer (eventId: string, quizId: string, username: string, department: string, question: number, answer: number) {
    let self = this;
    return new Promise<any>(function(resolve, reject) {
        if (!eventId || !quizId) {
          reject({err: 'Not enough or good parameters eventId: ' + eventId + ' quizId: ' + quizId});
        }
        
        var date: string = self.getFormattedDate(new Date());
        var payload: any = {eventId: eventId, quizId: quizId, date: date, username: username, department: department, question: question}
        // id is not part of the MD5 for obvious reasons, 
        payload.id = Md5.hashAsciiStr(JSON.stringify(payload));
        // answer is not because different answers are not allowed
        payload.answer = answer;

        var params = {
          path: 'answers',
          method: 'POST',
          contentType: "application/json",
          data: payload,
          timeout: 15000
        };

      $fh.cloud(
        params, 
        function(data) {
          resolve(data);
        }, 
        function(msg, err) {
          // An error occurred during the cloud call. Alert some debugging information
          console.log('Cloud call failed with error message:' + msg + '. Error properties:' + JSON.stringify(err));
          reject({msg: msg, err: err});
        });
    });
  }
}