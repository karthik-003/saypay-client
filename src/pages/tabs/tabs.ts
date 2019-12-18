import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar'
import {} from '@ionic-native/speech-recognition/ngx'
import { FirstRunPage } from '../';


declare var testvar;
declare var startListeningForIdentification:any;
declare var startListeningForVerification:any;
interface RecordedAudioOutput {
  blob: Blob;
  title: string;
}
@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})

export class TabsPage {
  
  listening = false;
  percent = 0;
  
  constructor(private statusBar: StatusBar,public navCtrl: NavController) {
    console.log("testvar: ",testvar);
  }
  
  
  
  makePayment(){
    this.listening = true;
    //enrollNewProfile();
    startListeningForIdentification();
    //startListeningForVerification();
    setInterval( ()=>{
      this.percent += 20;
    }, 1000);
   
  }

  cancelPayment(){
    this.navCtrl.push(FirstRunPage);
  }
  
  

  formatSubtitle = (percent: number) : string => {
    if(this.percent < 100)
      return "Listening.."
    else
      return "Processing.."
  }

  formatTitle = ()=>{
    return ""
  }

  getPercent(){
    return this.percent;
  }
}
