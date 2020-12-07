import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ToolPanelComponent } from './tool-panel.component';

@NgModule({
  declarations: [ToolPanelComponent],
  imports: [CommonModule],
  exports: [ToolPanelComponent]
})
export class ToolPanelModule {}
