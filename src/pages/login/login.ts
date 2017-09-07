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

  constructor(public navCtrl: NavController, public toastCtrl: ToastController, public formBuilder: FormBuilder, private stateService: StateService) {
    this.loginForm = formBuilder.group({
        username: ['', Validators.compose([Validators.required])],
        password: ['', Validators.compose([Validators.required])]
    });
  }

  ngOnInit () {
    this.stateService.loginStatus.subscribe(value => {
      console.log('🔥 LoginPage: loginStatus', value);
      if (value) {
        if ('SUCCESS' === value) {
          this.message = 'Login OK';
          

          if (this.stateService.isUserInRole('ADVISOR')) {
            this.navCtrl.setRoot(TabsPage);
          } else {
            this.navCtrl.setRoot(MainPage);
          }

        } else if ('ERROR' === value) {
          this.presentToast('User/Password wrong or not found');
        } else {
          this.presentToast('Unkwon error!');
        }
      }
    });
  }

  login () {
    this.submitAttempt = true;
 
    if(this.loginForm.valid){
      console.log('Before calling hello endpoint with', this.loginForm.value);

      this.message = 'Before calling...';

      //this.fhService.login(this.loginForm.value.username, this.loginForm.value.password)
      this.stateService.login(this.loginForm.value.username, this.loginForm.value.password);
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
