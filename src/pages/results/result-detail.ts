import { Component, ViewChild } from '@angular/core';

import { NavController, ActionSheetController, FabContainer } from 'ionic-angular';

import { Chart } from 'chart.js';

// Pages
import { MainPage } from '../main/main';

// Services (they have to be added to the providers array in ../../app.component.ts)
import { StateService } from '../../services/state.service';

// Model
import { Analysis } from '../../model/analysis';
import { Advisor } from '../../model/advisor';

@Component({
  selector: 'page-result-detail',
  templateUrl: 'result-detail.html'
})
export class ResultDetailPage {
  @ViewChild('barCanvas') barCanvas;
  barChart: any;
  barChartTitle: string;

  advisors: Array<Advisor> = null;
  analyses: Array<Analysis> = null;
  currentAnalysis: Analysis = null;

  constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, private stateService: StateService) {
    this.stateService.analyses.subscribe(value => {
      this.analyses = value; 
      console.log('🔥 Result Detail: this.analyses', this.analyses);
    });

    this.stateService.advisors.subscribe(value => {
      this.advisors = value; 
      console.log('🔥 Result Detail: this.advisors', this.advisors);
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

  runScan (fab?: FabContainer) {
    if (fab !== undefined) {
      fab.close();
    }
    this.stateService.runScan();
  }

  goToMain (fab?: FabContainer) {
    if (fab !== undefined) {
      fab.close();
    }
    this.navCtrl.setRoot(MainPage);
  }

  shareAnalysis (fab?: FabContainer) {
    if (fab !== undefined) {
      fab.close();
    }
    this.presentAdvisorsActionSheet();
    console.log('after action sheet')
    
  }

  presentAdvisorsActionSheet() {
    const buttons = this.advisors.map((element) => {
      return {
        text: element.firstName + ' ' + element.lastName,
        role: '',
        handler: () => {
            console.log('Clicked on ', element.firstName + ' ' + element.lastName);
            this.stateService.shareAnalysis(this.currentAnalysis.id, element.id);
          }
      };
    });
    buttons.push({ 
      text: 'Cancel',
      role: 'cancel',
      handler: () => { console.log(); }
    });

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Choose an advisor',
      buttons: buttons
    });

   actionSheet.present();
 }
}
