import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxFloorPlansModule } from 'projects/ngx-floor-plans/src/public-api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxFloorPlansModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
