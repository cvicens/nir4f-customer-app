import { Component, Input, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef, Renderer } from '@angular/core';

import { Chart } from 'chart.js';

// Model
import { Analysis } from '../../model/analysis';

// Services
import { StateService } from '../../services/state.service';

const MIN_COLOR = '#fc6751';
const AVG_COLOR = '#fda729';
const MAX_COLOR = '#9ad462';
const NAN_COLOR = '#fff500';

@Component({
  selector: 'kpi',
  templateUrl: './kpi.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiComponent  {
  @ViewChild('kpiElement') elementView: ElementRef;
  viewHeight: number;

  @Input() title: string = 'No title!';
  @Input() dataSource: string = 'avgAnalysis';
  @Input() propertyName: string = 'dv';
  value: number = -999;
  valueColor: string;
  
  //analyses: Array<Analysis> = null;
  //currentAnalysis: Analysis = null;

  constructor(private el : ElementRef, private cd: ChangeDetectorRef, public renderer: Renderer, private stateService: StateService) {
    
  }

  ngOnInit() {
    console.log ('KPI init value: ' + this.value);
    this.stateService[this.dataSource].subscribe(value => {
      if (value && value[this.propertyName]) {
          this.value = value[this.propertyName];
      }
      console.log('🔥 KPI observer: this.dataSource', this.dataSource, 'propetyName', this.propertyName, 'value', this.value);
      this.setValueColor();
      this.cd.markForCheck();
    });
  }

  setValueColor() {
     if (this.value <= 30) {
        this.valueColor = MIN_COLOR;
    } else if (this.value <= 60) {
        this.valueColor = AVG_COLOR;
    } else if (this.value <= 100) {
        this.valueColor = MAX_COLOR;
    } else {
        this.valueColor = NAN_COLOR;
    }
  }

  ngOnChanges(changes: any) {
    console.log('⚙ KPI value changed', changes);
    //this.value = changes.value.currentValue;
    this.setValueColor();
    this.cd.markForCheck();
  }

  reduce() {
    this.viewHeight = this.elementView.nativeElement.offsetHeight;

    console.log("HI there!!!", this.elementView.nativeElement.offsetHeight, this.elementView.nativeElement.clientHeight);

  }

  public resizeHeight (newHeight) {
    console.log('📥 kpi.nativeElement.offsetHeight', this.el.nativeElement.offsetHeight);
    console.log('📥 kpi.nativeElement.clientHeight', this.el.nativeElement.clientHeight);
    console.log('📥 kpi resizeHeight', newHeight);
    
    this.viewHeight = newHeight;
    
    this.renderer.setElementStyle(this.el.nativeElement, 'backgroundColor', 'yellow');
    this.renderer.setElementStyle(this.el.nativeElement, 'heigth',  newHeight + 'px');


    //this.cd.markForCheck();
    this.cd.detectChanges();
  }
}
