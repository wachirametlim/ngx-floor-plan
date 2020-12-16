import { Component, OnInit } from '@angular/core';
import { TOOL } from '../enums/tool.enum';

@Component({
  selector: 'ngx-floor-plan',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.sass'],
})
export class EditorComponent implements OnInit {
  public selectedTool: TOOL;

  constructor() {}

  ngOnInit(): void {}

  onSelectionTool(tool: TOOL): void {
    this.selectedTool = tool;
  }
}
