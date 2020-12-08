import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxFloorPlanModule } from 'projects/ngx-floor-plan/src/public-api';
// import { NgxFloorPlanModule } from 'ngx-floor-plan';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxFloorPlanModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
