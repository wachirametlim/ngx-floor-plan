import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ContentComponent } from './content.component';

@NgModule({
  declarations: [ContentComponent],
  imports: [CommonModule],
  exports: [ContentComponent],
})
export class ContentModule {}
