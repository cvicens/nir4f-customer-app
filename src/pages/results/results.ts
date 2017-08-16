import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

import { ResultsListPage } from './results-list';
import { ResultDetailPage } from './result-detail';

// Services (they have to be added to the providers array in ../../app.component.ts)
import { StateService } from '../../services/state.service';

// Model
import { Analysis } from '../../model/analysis';

@Component({
  selector: 'page-results',
  templateUrl: 'results.html'
})
export class ResultsPage {
  analyses: Array<Analysis> = null;
  detail: any =  ResultDetailPage;

  constructor(public navCtrl: NavController, private stateService: StateService) {
    this.stateService.analyses.subscribe(value => {
      this.analyses = value; 
      console.log('🔥 Result List: this.analyses', this.analyses);
    });
  }

  runScan () {
    this.stateService.runScan();
  }

  setAsCurrentAnalysis (id: string) {
    this.stateService.setAsCurrentAnalysis(id);
  }
}
