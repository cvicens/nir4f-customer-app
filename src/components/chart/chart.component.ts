import { Component, Input, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { Chart } from 'chart.js';

// Model
import { Analysis } from '../../model/analysis';

// Services
import { StateService } from '../../services/state.service';

const ALPHA_COLOR = 0.4;

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ChartComponent  {
  @ViewChild('chartElement') elementView: ElementRef;
  viewHeight: number;

  @Input() title: string = 'No title!';
  @Input() dataSource: string = 'avgAnalysis';
  @Input() type: string = 'bar';

  @Input() axesFontColor: string = 'white';
  
  @ViewChild('canvas') canvas;
  chart: any;

  analyses: Array<Analysis> = null;
  currentAnalysis: Analysis = new Analysis ('', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

  constructor(private cd: ChangeDetectorRef, private stateService: StateService) {
    this.stateService.analyses.subscribe(value => {
      this.analyses = value; 
      console.log('🔥 Result Detail: this.analyses', this.analyses);
    });
  }

  ngOnInit() {
    console.log ('🔥 Chart init values: ', this.title, this.dataSource, this.type);
    console.log('this.barCanvas', this.canvas);
    //this.barCanvas.nativeElement = 500;
    this.chart = new Chart(this.canvas.nativeElement, {

        type: this.type,
        data: {
            labels: ["DM", "CP", "DV", "ME" , "St", "Sg", "NDF", "ADF", "pH", "LA"],
            datasets: [{
                data: [
                        this.currentAnalysis.dm, 
                        this.currentAnalysis.cp,
                        this.currentAnalysis.dv,
                        this.currentAnalysis.me,
                        this.currentAnalysis.starch,
                        this.currentAnalysis.sugar,
                        this.currentAnalysis.ndf,
                        this.currentAnalysis.adf,
                        this.currentAnalysis.ph,
                        this.currentAnalysis.la
                      ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 2, 22, 0.2)',
                    'rgba(43, 10, 55, 0.2)',
                    'rgba(53, 102, 85, 0.2)',
                    'rgba(134, 82, 95, 0.2)',
                    'rgba(99, 92, 23, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 2, 22, 1)',
                    'rgba(43, 10, 55, 1)',
                    'rgba(53, 102, 85, 1)',
                    'rgba(134, 82, 95, 1)',
                    'rgba(99, 92, 23, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
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
        this.currentAnalysis = value;
        if (this.chart && value) {
            if (value instanceof Array) {
                // Let's turn analyses into datasets
                

                const datasets = value.map((item) => {
                    return this.generateDataSet(item);
                })
                this.chart.data.datasets = datasets;

                //this.chart.data.datasets[0].data = value.map((item) => {
                //    return [ item.dm, item.cp, item.dv, item.me, item.starch, item.sugar, item.ndf, item.adf, item.ph, item.la ];
                //});
            } else {
                this.chart.data.datasets[0].data = [
                        value.dm, 
                        value.cp,
                        value.dv,
                        value.me,
                        value.starch,
                        value.sugar,
                        value.ndf,
                        value.adf,
                        value.ph,
                        value.la
                    ];
            }
            this.chart.update();
        } 

      console.log('🔥 Result Details: this.currentAnalysis', this.currentAnalysis);
    });
  }

  public resizeHeight (newHeight) {
    console.log('this.elementView.nativeElement.offsetHeight', this.elementView.nativeElement.offsetHeight);
    console.log('this.elementView.nativeElement.clientHeight', this.elementView.nativeElement.clientHeight);
    console.log('bigger', newHeight);
    this.viewHeight = newHeight;
    this.chart.update();
  }

  generateDataSet (analysis) {
    const color = this.randomColor();
    return {
        data: [
                analysis.dm, 
                analysis.cp,
                analysis.dv,
                analysis.me,
                analysis.starch,
                analysis.sugar,
                analysis.ndf,
                analysis.adf,
                analysis.ph,
                analysis.la
                ],
        backgroundColor: color.backgroundColor,
        borderColor: color.borderColor,
        borderWidth: 1
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
}
