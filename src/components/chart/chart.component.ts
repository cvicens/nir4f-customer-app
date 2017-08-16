import { Component, Input, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { Chart } from 'chart.js';

// Model
import { Analysis } from '../../model/analysis';

// Services
import { StateService } from '../../services/state.service';

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class KpiComponent  {
  @Input() title: string = 'No title!';
  @Input() value: number = -999;
  
  @ViewChild('barCanvas') barCanvas;
  barChart: any;
  barChartTitle: string;

  analyses: Array<Analysis> = null;
  currentAnalysis: Analysis = null;

  constructor(private cd: ChangeDetectorRef, private stateService: StateService) {
    this.stateService.analyses.subscribe(value => {
      this.analyses = value; 
      console.log('🔥 Result Detail: this.analyses', this.analyses);
    });

    this.stateService.currentAnalysis.subscribe(value => {
      this.currentAnalysis = value;
      if (this.barChart) {
        this.barChart.data.datasets[0].data = [
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
                      ];
        this.barChart.update();
      }
      console.log('🔥 Result Details: this.currentAnalysis', this.currentAnalysis);
    });
  }

  ionViewDidLoad() {
    this.barCanvas.height = 250;
    this.barChart = new Chart(this.barCanvas.nativeElement, {

        type: 'bar',
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
                yAxes: [{
                    ticks: {
                        beginAtZero:true
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
  }
}
