import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { TabsPage } from './tabs';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
  declarations: [
    TabsPage,
  ],
  imports: [
    IonicPageModule.forChild(TabsPage),
    TranslateModule.forChild(),
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 50,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#488aff",
      innerStrokeColor: "#000000",
      animationDuration: 300,
      percent:50
    })
  ],
  exports: [
    TabsPage
  ],
  providers: []
})
export class TabsPageModule { }
