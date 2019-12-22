import { Component } from '@angular/core';
import { IonicPage, NavController,LoadingController,AlertController  } from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar'
import {} from '@ionic-native/speech-recognition/ngx'
import { FirstRunPage,ItemPage,MainPage } from '../';


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
  
  listeningDone:boolean = false;
  listening = false;
  percent = 0;
  pollCounter = 0;
  loaderCreated:boolean = false;
  loader:any;

  constructor(private statusBar: StatusBar,public navCtrl: NavController,public loadingCtrl: LoadingController,public alertController: AlertController) {
    console.log("testvar: ",testvar);
  }
  
  ngOnInit(){
    localStorage.removeItem("listening");
		localStorage.setItem("listening","false");
    localStorage.removeItem("recognitionDone");
    this.loaderCreated = false;
  }
  
  
  makePayment(){
    this.listening = true;
    //enrollNewProfile();
    localStorage.removeItem("listening");
		localStorage.setItem("listening","true");
    localStorage.removeItem("recognitionDone");
    localStorage.removeItem("amount");
    localStorage.removeItem("payeeContactName");
    startListeningForIdentification();
    //startListeningForVerification();
    let intevalId = setInterval( ()=>{
      this.pollCounter++;
      if(this.pollCounter >60){
        this.presentAlertConfirm('Unable to authorize. Please try again.');
        clearInterval(intevalId);
      }
      if(this.percent <=100){
        this.percent += 20;
      }
      //localStorage.setItem("recognitionSarted",false);
      if(localStorage.getItem("listening")!=null && localStorage.getItem("listening")!="true" &&!this.loaderCreated){
        this.createLoader();
      }
      if(localStorage.getItem("recognitionDone")!=null && localStorage.getItem("recognitionDone")=="succeeded" && localStorage.getItem("listening")=="false"){
        clearInterval(intevalId);
        this.loader.dismiss();
      }
      if(localStorage.getItem("recognitionDone")!=null && localStorage.getItem("recognitionDone")=="succeeded"
      && localStorage.getItem("speakerRecongized")!=null && localStorage.getItem("speakerRecongized")=="false"){
        clearInterval(intevalId);
        this.presentAlertConfirm('Authorization Failed.');
        //this.navCtrl.push(ItemPage);
      }
      if(localStorage.getItem("recognitionDone")!=null && localStorage.getItem("recognitionDone")=="succeeded" &&
      localStorage.getItem("speakerRecongized")!=null && localStorage.getItem("speakerRecongized")=="true"){
        this.navCtrl.push(ItemPage);
      }
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

  presentAlertConfirm(message) {
    const alert =  this.alertController.create({
      
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            //console.log('Confirm Cancel: blah');
            this.navCtrl.push(FirstRunPage);
          }
        }, {
          text: 'Retry',
          handler: () => {
            console.log('Confirm Okay');
            window.stop();
            localStorage.setItem("listening","false");
            this.navCtrl.push(MainPage);
          }
        }
      ]
    });

    alert.present();
  }
  createLoader() {
    console.log("Creating loader");
    this.loaderCreated = true;
    this.loader = this.loadingCtrl.create({
      content: "Authorizing.."
    });
    this.loader.present();
  }

  doLogout(){
    this.navCtrl.push(FirstRunPage);
  }
}
