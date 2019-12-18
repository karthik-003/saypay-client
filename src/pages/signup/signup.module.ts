import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import {ProgressBarModule} from "angular-progress-bar"
import { SignupPage } from './signup';

@NgModule({
  declarations: [
    SignupPage,
  ],
  imports: [
    IonicPageModule.forChild(SignupPage),
    TranslateModule.forChild(),
    ProgressBarModule
  ],
  exports: [
    SignupPage
  ]
})
export class SignupPageModule { }
