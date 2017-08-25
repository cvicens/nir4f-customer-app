import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NavController, ToastController } from 'ionic-angular';

// Tabs
import { TabsPage } from '../tabs/tabs';
import { MainPage } from '../main/main';

// Services (they have to be added to the providers array in ../../app.component.ts)
import { FHService } from '../../services/fh.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'login-page',
  templateUrl: './login.html'
})
export class LoginPage {
  loginForm: FormGroup;
  submitAttempt: boolean;

  message: string = '';

  constructor(public navCtrl: NavController, public toastCtrl: ToastController, public formBuilder: FormBuilder, private fhService: FHService, private stateService: StateService) {
    this.loginForm = formBuilder.group({
        username: ['', Validators.compose([Validators.required])],
        password: ['', Validators.compose([Validators.required])]
    });
  }

  login () {
    this.submitAttempt = true;
 
    if(this.loginForm.valid){
      console.log('Before calling hello endpoint with', this.loginForm.value);

      this.message = 'Before calling...';

      //this.fhService.login(this.loginForm.value.username, this.loginForm.value.password)
      this.fhService.login(this.loginForm.value.username, this.loginForm.value.password)
      .then( (result) => {
        // Lets update the state of the app...
        this.stateService.updateUsername(this.loginForm.value.username);
        this.stateService.updateDepartment(this.loginForm.value.department);
        this.stateService.updateUserRoles(result.roles);
        //console.log('result', result);
        this.message = 'Login OK';
        this.navCtrl.setRoot(MainPage);
      })
      .catch( (err) => {
        console.log(err);
        //this.message = JSON.stringify(err);
        this.presentToast('User/Password wrong or not found');
      });
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
