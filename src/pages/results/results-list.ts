import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

// Services (they have to be added to the providers array in ../../app.component.ts)
import { StateService } from '../../services/state.service';

// Model
import { Analysis } from '../../model/analysis';

@Component({
  selector: 'page-results-list',
  templateUrl: 'results-list.html'
})
export class ResultsListPage {
  analyses: Array<Analysis> = null;

  constructor(public navCtrl: NavController, private stateService: StateService) {
    this.stateService.analyses.subscribe(value => {
      this.analyses = value; 
      console.log('🔥 Result Details: this.analyses', this.analyses);
    });
  }
}
