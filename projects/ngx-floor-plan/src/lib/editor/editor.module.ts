import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ContentModule } from './content/content.module';
import { EditorComponent } from './editor.component';
import { ToolPanelModule } from './tool-panel/tool-panel.module';

@NgModule({
  declarations: [EditorComponent],
  imports: [CommonModule, ToolPanelModule, ContentModule],
  exports: [EditorComponent],
})
export class EditorModule {}
