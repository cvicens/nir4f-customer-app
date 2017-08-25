import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';

import { KpiComponent } from '../components/kpi/kpi.component';
import { ChartComponent } from '../components/chart/chart.component';
import { TimelineComponent } from '../components/timeline/timeline.component';
import { HorizontalTimelineComponent } from '../components/horizontal-timeline/horizontal-timeline.component';

import { MainPage } from '../pages/main/main';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';

import { ResultsPage } from '../pages/results/results';
import { ResultDetailPage } from '../pages/results/result-detail';
import { ResultsListPage } from '../pages/results/results-list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Services
import { StateService } from '../services/state.service';
import { SocketService } from '../services/socket.service';
import { FHService } from '../services/fh.service';

// Directives
import { ParentSizeDirective } from '../directives/parent-size.directive';

@NgModule({
  declarations: [
    MyApp,
    ParentSizeDirective,
    KpiComponent,
    ChartComponent,
    TimelineComponent,
    HorizontalTimelineComponent,
    MainPage,
    LoginPage,
    AboutPage,
    ContactPage,
    HomePage,
    ResultsPage,
    ResultDetailPage,
    ResultsListPage,
    TabsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp,{statusbarPadding: false}),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    KpiComponent,
    ChartComponent,
    MainPage,
    LoginPage,
    AboutPage,
    ContactPage,
    HomePage,
    ResultsPage,
    ResultDetailPage,
    ResultsListPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    StateService, SocketService, FHService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
