import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Items } from '../../providers';
import {MainPage} from '../'
declare var parseString:any;
@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  item: any;
  payeeName: string = "";
  vpaAddress: any = "";
  amount: any = "";
  paymentConfrimed:any=false;
  payeeUnknown:boolean = false;
  cmdInvalid:boolean = false;
  synth:any ;
	toSpeak:any;
  constructor(public navCtrl: NavController, navParams: NavParams, items: Items) {
    this.item = navParams.get('item') || items.defaultItem;
    //parseString();
    
  }

  payee1 = {
    "name":"Anupam Choudhary",
    "vpa":"8770215615@upi"
  }
  payee2 = {
    "name":"Karthik Viswanadha",
    "vpa":"9004578369@upi"
  }
  payee3 = {
    "name":"Sandesh Nayak",
    "vpa":"961109681@upi"
  }
  payee4 = {
    "name":"Prashanti Kotaru",
    "vpa":"961109681@upi"
  }
  

  ngOnInit(){
    this.synth = window.speechSynthesis;
    let interval = setInterval(() => {
      this.amount = localStorage.getItem("amount");
      this.payeeName = localStorage.getItem("payeeContactName");
      if(this.payeeName != null && this.amount!=null){
        clearInterval(interval);
        this.getPayeeDetails(this.payeeName)
      }
      this.cmdInvalid = localStorage.getItem("cmdInvalid") == "true";
      console.log(" this.cmdInvalid ", this.cmdInvalid);
    }, 500);
    

   

  }

  getPayeeDetails(payeeName){
    if(this.payeeName.toLowerCase() == "karthik"){
      this.payeeName = this.payee2.name;
      this.vpaAddress = this.payee2.vpa;
    }
    else if(this.payeeName.toLowerCase() == "anupam"){
      this.payeeName = this.payee1.name;
      this.vpaAddress = this.payee1.vpa;
    }
    else if(this.payeeName.toLowerCase() == "sandesh"){
      this.payeeName = this.payee3.name;
      this.vpaAddress = this.payee3.vpa;
    }else if(this.payeeName.toLowerCase() == "prashanti"){
      this.payeeName = this.payee4.name;
      this.vpaAddress = this.payee4.vpa;
    }
    else{
      this.payeeUnknown = true;
    }
  }
  cancelPayment(){
    this.navCtrl.push(MainPage);
  }
  confirmPayment(){
    this.paymentConfrimed = true;
    this.toSpeak = new SpeechSynthesisUtterance("Transaction is successful.");
		this.synth.speak(this.toSpeak);
  }
  goHome(){
    this.navCtrl.push(MainPage);
  }
}
