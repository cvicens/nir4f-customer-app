import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';

import { NavController, NavParams, ActionSheetController, FabContainer } from 'ionic-angular';

import { KpiComponent } from '../../components/kpi/kpi.component';
import { ChartComponent } from '../../components/chart/chart.component';

import { ResultsPage } from '../results/results';
import { ResultDetailPage } from '../results/result-detail';
import { HomePage } from '../home/home';

// Services
import { StateService } from '../../services/state.service';

// Model
import { Analysis } from '../../model/analysis';
import { Advisor } from '../../model/advisor';

@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPage {
  @ViewChild('kpiDashboardRow') kpiDashboardRowView: ElementRef;
  @ViewChildren(KpiComponent) kpiComponents: QueryList<KpiComponent>;
  
  @ViewChild('chartDashBoardRow1') chartDashBoardRow1View: ElementRef;
  @ViewChildren('chartComponentRow1') chartComponentsRow1: QueryList<ChartComponent>;

  showPage: string = 'DASHBOARD';

  advisors: Array<Advisor> = null;
  analyses: Array<Analysis> = new Array<Analysis> ();
  currentAnalysis: Analysis = new Analysis ('', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  avgAnalysis: Analysis = new Analysis ('', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  private pages: Array<{title: string, icon: string, component: any}>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController, private cd: ChangeDetectorRef, private stateService: StateService) {
    

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', icon: 'home', component: HomePage },
      { title: 'Analyses', icon: 'stats', component: ResultDetailPage }
    ];
    
  }

  openPage(page) {
    if (page.title === 'Home') {
      this.showPage = 'DASHBOARD';
    } else {
      this.showPage = 'DETAILS';
    }
    console.log('Show page', this.showPage);

    //this.fixKpiComponentsHeight();
    //this.fixChartComponentsRow1Height();
    //this.cd.detectChanges();

    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
     //this.rootPage = page.component;
     //this.navCtrl.setRoot(page.component);
     //this.navCtrl.push(page.component);
  }

  ngOnInit () {
    this.stateService.analyses.subscribe(value => {
      this.analyses = value; 
      console.log('🔥 MainPage: this.analyses', this.analyses);
      this.cd.detectChanges();
    });

    this.stateService.avgAnalysis.subscribe(value => {
      this.avgAnalysis = value; 
      console.log('🔥 MainPage: this.avgAnalysis', this.avgAnalysis);
      this.cd.detectChanges();
    });

    this.stateService.advisors.subscribe(value => {
      this.advisors = value; 
      console.log('🔥 MainPage: this.advisors', this.advisors);
    });

    this.stateService.currentAnalysis.subscribe(value => {
      this.currentAnalysis = value;
      console.log('🔥 MainPage: this.currentAnalysis', this.currentAnalysis);
    });
  }

  ionViewDidLoad() {
    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', icon: 'home', component: HomePage },
      { title: 'Analyses', icon: 'stats', component: ResultDetailPage }
    ];

    console.log('MainPage',this.kpiDashboardRowView, this.kpiComponents);
    //this.fixKpiComponentsHeight();
    //this.fixChartComponentsRow1Height();
    //this.cd.detectChanges();
  }

  fixKpiComponentsHeight() {
    this.kpiComponents.forEach((item) => {
      item.resizeHeight(this.kpiDashboardRowView.nativeElement.offsetHeight);
    });
  }

  fixChartComponentsRow1Height() {
    console.log('this.chartDashBoardRow1View.nativeElement.offsetHeight', this.chartDashBoardRow1View.nativeElement.offsetHeight);
    console.log('this.chartDashBoardRow1View.nativeElement.clientHeight', this.chartDashBoardRow1View.nativeElement.clientHeight);
    this.chartComponentsRow1.forEach((item) => {
      item.resizeHeight(this.chartDashBoardRow1View.nativeElement.offsetHeight);
    });
  }

  /*runScan () {
    console.log('MainPage->runScan');
    this.stateService.runScan();
  }*/

  clearStorage (fab?: FabContainer) {
    if (fab !== undefined) {
      fab.close();
    }
    this.stateService.clearLocalStorage();
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
