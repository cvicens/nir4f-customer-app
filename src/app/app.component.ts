import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Login
import { LoginPage } from '../pages/login/login';

import { ResultsPage } from '../pages/results/results';

// Menu
import { MainPage } from '../pages/main/main';

// Services
import { FHService } from '../services/fh.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  //rootPage: any = LoginPage;
  rootPage: any = MainPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, fhService: FHService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
