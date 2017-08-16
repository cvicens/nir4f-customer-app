import { Component, Input, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { Chart } from 'chart.js';

// Model
import { Analysis } from '../../model/analysis';

// Services
import { StateService } from '../../services/state.service';

const MIN_COLOR = '#fc6751';
const AVG_COLOR = '#fda729';
const MAX_COLOR = '#9ad462';

@Component({
  selector: 'kpi',
  templateUrl: './kpi.component.html',
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiComponent  {
  @Input() title: string = 'No title!';
  @Input() value: number = -999;
  valueColor: string;
  
  analyses: Array<Analysis> = null;
  currentAnalysis: Analysis = null;

  constructor(private cd: ChangeDetectorRef, private stateService: StateService) {
    this.stateService.analyses.subscribe(value => {
      this.analyses = value; 
      console.log('🔥 KpiComponent (' + this.title + ': this.analyses', this.analyses);
      //this.cd.detectChanges();
    });

    this.stateService.currentAnalysis.subscribe(value => {
      this.currentAnalysis = value;
      console.log('🔥 KpiComponent (' + this.title + ': this.currentAnalysis', this.currentAnalysis);
      //this.cd.detectChanges();
    });
  }

  ngOnInit() {
        console.log ('<>>>>>>>>' + this.value);

        if (this.value <= 30) {
            this.valueColor = MIN_COLOR;
        } else if (this.value <= 60) {
            this.valueColor = AVG_COLOR;
        } else {
            this.valueColor = MAX_COLOR;
        }

    }

  ionViewDidLoad() {
  }
}
