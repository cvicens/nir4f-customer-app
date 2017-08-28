import { Component, Input, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { Chart } from 'chart.js';

// Model
import { Analysis } from '../../model/analysis';

// Services
import { StateService } from '../../services/state.service';

const ALPHA_COLOR = 0.4;
const NUMBER_OF_ANALYSES = 10;

@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class TimelineComponent  {
  @ViewChild('chartElement') elementView: ElementRef;
  viewHeight: number;

  @Input() title: string = 'No title!';
  @Input() dataSource: string = 'avgAnalysis';
  @Input() type: string = 'bar';
  @Input() propertyName: string = 'dm';

  @Input() axesFontColor: string = 'white';
  
  @ViewChild('canvas') canvas;
  chart: any;

  analyses: Array<Analysis> = null;
  scores: Array<{time: string, score: number}> = null;

  constructor(private cd: ChangeDetectorRef, private stateService: StateService) {
    this.stateService.analyses.subscribe(value => {
      this.analyses = value; 
      console.log('🔥 Result Detail: this.analyses', this.analyses);
      this.scores = this.analyses.map((item) => {
          return {time: item.date, score: item[this.propertyName]};
      })
    });
  }

  ngOnInit() {
    console.log ('🔥 Timeline init values: ', this.title, this.dataSource, this.type);
    console.log('this.canvas', this.canvas);
    //this.barCanvas.nativeElement = 500;

    //Chart.defaults.global.elements.point.radius = 10;

    this.chart = new Chart(this.canvas.nativeElement, {

        type: this.type,
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1,
                pointHitRadius: 10,
                pointRadius: 8
            }]
        },
        options: {
            /// Boolean - whether or not the chart should be responsive and resize when the browser does.
            responsive: true,
            // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    ticks: {
                        fontColor: this.axesFontColor
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: this.axesFontColor
                    }
                }]
            },
            legend: {
                display: false,
                labels: {
                    fontColor: 'rgb(255, 99, 132)'
                }
            }
        }

    });

    this.stateService[this.dataSource].subscribe(value => {
        if (this.chart && value) {
            if (value instanceof Array) {
                // Let's turn analyses into one dataset
                const aux = this.generateDataSetAndLabels(value);

                
                this.chart.data.datasets[0] = aux.dataset;
                this.chart.data.labels = aux.labels;

                //this.chart.data.datasets[0].data = value.map((item) => {
                //    return [ item.dm, item.cp, item.dv, item.me, item.starch, item.sugar, item.ndf, item.adf, item.ph, item.la ];
                //});
            } else {
                // ERROR
                console.error('Data should be an array of analyses');
            }
            this.chart.update();
        }  else {
            console.error('TimelineComponent: Either no chart or no analyses');
        }

      console.log('🔥 Timeline Details:', value);
    });
  }

  public resizeHeight (newHeight) {
    console.log('this.elementView.nativeElement.offsetHeight', this.elementView.nativeElement.offsetHeight);
    console.log('this.elementView.nativeElement.clientHeight', this.elementView.nativeElement.clientHeight);
    console.log('bigger', newHeight);
    this.viewHeight = newHeight;
    this.chart.update();
  }

  addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
  }

  generateDataSetAndLabels (analyses: Array<any>) {
    //const _analyses = analyses.slice(analyses.length < NUMBER_OF_ANALYSES ? 0 : analyses.length - NUMBER_OF_ANALYSES);
    const _analyses = analyses;
    const data = _analyses.map((item) => Math.round(item[this.propertyName]));
    const labels = _analyses.map((item) => {
        const date = new Date(item.date);
        return date.getDate() + '/' + (date.getMonth() + 1);
    });
    return {
        dataset: {
            data: data,
            backgroundColor: 'rgba(43, 87, 57, ' + ALPHA_COLOR + ')',
            borderColor: 'rgba(15, 234, 83, 1)',
            borderWidth: 1,
            pointHitRadius: 7,
            pointRadius: 10,
            pointHoverRadius: 7,
            pointHitBackgroundColor: 'rgba(15, 234, 83, 1)',
            pointHoverBackgroundColor: 'rgba(15, 234, 83, 1)',
        },
        labels: labels
    };
  }

  randomColor() {
    const r = Math.round(Math.random() * 255);
    const g = Math.round(Math.random() * 255);
    const b = Math.round(Math.random() * 255);
    const bgc = 'rgba(' + r + ',' + g + ',' + b + ',' + ALPHA_COLOR + ')';
    const bc = 'rgba(' + r + ',' + g + ',' + b + ',' + 1 + ')';
    return {backgroundColor: bgc, borderColor: bc};
  }

  onClick (event) {
    var activePoints = this.chart.getElementsAtEvent(event);
    console.log(activePoints);
    if (activePoints.length > 0) {
        const _datasetIndex = activePoints[0]._datasetIndex;
        const _index = activePoints[0]._index;
        const dataPoint = this.chart.data.datasets[_datasetIndex].data[_index];
        console.log(dataPoint);
        this.stateService.setAsCurrentAnalysis(this.analyses[_index].id);
    }
  }
}
