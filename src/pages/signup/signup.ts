import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController,AlertController,LoadingController  } from 'ionic-angular';

import { User } from '../../providers';
import { MainPage } from '../';

declare var enrollNewProfile:any;
@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  // The account fields for the login form.
  // If you're using the username field with or without email, make
 

  // Our translated text strings
  private signupErrorString: string;
  //private timer = 10;
  timeLeft: number = 10;
  listening: boolean = false;
  interval;
  progress=0;
  enrollmentComplete:boolean = false;
  currentSentence = "";
  loaderCreated:boolean = false;
  alert:any;
  loader:any;

  thingsToRead = [
    "Never gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you",
    "There's a voice that keeps on calling me\n	Down the road, that's where I'll always be.\n	Every stop I make, I make a new friend,\n	Can't stay for long, just turn around and I'm gone again\n	\n	Maybe tomorrow, I'll want to settle down,\n	Until tomorrow, I'll just keep moving on.\n	\n	Down this road that never seems to end,\n	Where new adventure lies just around the bend.\n	So if you want to join me for a while,\n	Just grab your hat, come travel light, that's hobo style.",
    "They're the world's most fearsome fighting team \n	They're heroes in a half-shell and they're green\n	When the evil Shredder attacks\n	These Turtle boys don't cut him no slack! \n	Teenage Mutant Ninja Turtles\nTeenage Mutant Ninja Turtles",
    "If you're seein' things runnin' thru your head \n	Who can you call (ghostbusters)\n	An' invisible man sleepin' in your bed \n	Oh who ya gonna call (ghostbusters) \nI ain't afraid a no ghost \n	I ain't afraid a no ghost \n	Who ya gonna call (ghostbusters) \n	If you're all alone pick up the phone \n	An call (ghostbusters)",
  ];
  

  constructor(public alertCtrl: AlertController,public loadingCtrl: LoadingController,public navCtrl: NavController) {
    this.currentSentence = this.thingsToRead[Math.floor(Math.random() * this.thingsToRead.length)]
    
  }

  listenAndEnrollVoice(){
    this.enrollmentComplete = false;
    this.listening = true;
    this.timeLeft = 10;
    this.startTimer();
    localStorage.removeItem("enrollmentDone")
    enrollNewProfile("Karthik");
    
    
    //console.log("Before Creating Loader: this.listening:",this.listening,": this.enrollmentComplete: ",this.enrollmentComplete)
    
    let interval = setInterval(()=>{
      if(!this.listening && !this.enrollmentComplete && !this.loaderCreated){
        this.createLoader();
      }
      if(localStorage.getItem("enrollmentDone") != null && localStorage.getItem("enrollmentDone") == "true"){
        this.enrollmentComplete = true;
       
        clearInterval(interval);
        console.log("Loader object: "+this.loader);
        this.loader.dismiss();
        this.showAlert();
      }
    },1000)
  }

  startTimer() {
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.listening = true;
        this.timeLeft--;
        this.progress += 10;
        
      } else{
        this.timeLeft = 0;
        this.progress = 0;
        this.listening = false;
        clearInterval(this.interval);
      }
    },1000);
  }

  getProgress(){
    return this.progress;
  }
 

  showAlert() {
    const alert = this.alertCtrl.create({
      title: 'Success',
      subTitle: 'Your voice is registered succesfully.',
      buttons: [{
        text: 'Ok',
        handler: data => {
          this.navCtrl.push(MainPage);
        }
      }]
    });
    alert.present();
  }

  createLoader() {
    console.log("Craeting loader")
    this.loaderCreated = true;
    this.loader = this.loadingCtrl.create({
      content: "Please wait..."
    });
    this.loader.present();
  }
}
