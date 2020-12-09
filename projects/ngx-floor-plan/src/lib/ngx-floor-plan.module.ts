import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ContentComponent } from './editor/content/content.component';
import { EditorComponent } from './editor/editor.component';
import { ToolPanelComponent } from './editor/tool-panel/tool-panel.component';

@NgModule({
  declarations: [EditorComponent, ToolPanelComponent, ContentComponent],
  imports: [CommonModule],
  exports: [EditorComponent],
})
export class NgxFloorPlanModule {}
