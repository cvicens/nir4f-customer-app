import { Component, Input, ChangeDetectorRef, ViewChildren, ContentChildren, ElementRef, QueryList, ChangeDetectionStrategy } from '@angular/core';

import { NavController, AlertController } from 'ionic-angular';

// Services (they have to be added to the providers array in ../../app.component.ts)
import { StateService, SHARED_ANALYSES_KEY } from '../../services/state.service';

// Model
import { SharedAnalysis } from '../../model/shared-analysis';

const MIN_COLOR = '#fc6751';
const AVG_COLOR = '#fda729';
const MAX_COLOR = '#9ad462';
const NAN_COLOR = '#fff500';

declare var google;

@Component({
  selector: 'page-shared-analyses',
  templateUrl: 'shared-analyses.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class SharedAnalysesPage {
  @Input() showHeader: boolean = true;

  @ViewChildren('map', { read: ElementRef }) mapElements: QueryList<any>;
  maps: Array<any> = new Array<any>();

  sharedAnalyses: Array<SharedAnalysis> = new Array<SharedAnalysis>();
  name: string;
  valueColor: string;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, private cd: ChangeDetectorRef, private stateService: StateService) {
    
  }

  ngOnInit () {
    console.log ('🔥 SharedAnalyses init values: ', this.showHeader);

    this.stateService.datasets.subscribe(value => {
      console.log('value pre-check', value);
      if (value) {
        console.log('value', value.get(SHARED_ANALYSES_KEY));
        if (value.get(SHARED_ANALYSES_KEY) && value.get(SHARED_ANALYSES_KEY).initialized) {
          this.sharedAnalyses.length = 0;
          value.get(SHARED_ANALYSES_KEY).data.forEach((element) => {
            this.sharedAnalyses.push(element);
          })

          console.log('this.sharedAnalyses >>>>> ', this.sharedAnalyses);
          this.cd.detectChanges();

          this.loadMaps();
        }
      }
    });
  }

  loadMaps(){

    this.mapElements.forEach(map => {

      let latLng = new google.maps.LatLng(map.nativeElement.getAttribute('y'), map.nativeElement.getAttribute('x'));
      
      let mapOptions = {
        center: latLng,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        draggable: !("ontouchend" in document)
      }

      console.log('***map.native.x', map.nativeElement.getAttribute('x'));
      console.log('***map.native.y', map.nativeElement.getAttribute('y'));
      this.maps.push(new google.maps.Map(map.nativeElement, mapOptions));
    });

    
  }

  round(value) {
    return Math.round(value);
  }

  getValueColor(value) {
    let valueColor; 
    if (value <= 15) {
       valueColor = MIN_COLOR;
    } else if (value <= 22.5) {
        valueColor = AVG_COLOR;
    } else if (value <= 30) {
        valueColor = MAX_COLOR;
    } else {
        valueColor = NAN_COLOR;
    }

   return valueColor;
  }

  answer(sharedAnalysis) {
    console.log(sharedAnalysis);
    this.showAnswerPrompt(sharedAnalysis.data.username, sharedAnalysis);
  }

  unread(sharedAnalysis) {
    console.log(sharedAnalysis);
  }

  showAnswerPrompt(username, sharedAnalysis) {
    let prompt = this.alertCtrl.create({
      title: 'Answer',
      message: "Enter an answer to be sent to '" + username + "'",
      inputs: [
        {
          name: 'answer',
          placeholder: 'Answer'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log('Saved clicked answer:', data);
            this.stateService.answerSharedAnalysis(sharedAnalysis.uid, sharedAnalysis.data, data.answer);
          }
        }
      ]
    });
    prompt.present();
  }
}
