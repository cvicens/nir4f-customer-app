import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { KpiComponent } from '../../components/kpi/kpi.component';

import { ResultsPage } from '../results/results';
import { HomePage } from '../home/home';

@Component({
  selector: 'page-main',
  templateUrl: 'main.html'
})
export class MainPage {
  private pages: Array<{title: string, component: any}>;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  
    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'Analyses', component: ResultsPage }
    ];
    
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
     //this.rootPage = page.component;
     this.navCtrl.setRoot(page.component);
  }
}
