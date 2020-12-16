import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TOOL } from '../../enums/tool.enum';

@Component({
  selector: 'fp-tool-panel',
  templateUrl: './tool-panel.component.html',
  styleUrls: ['./tool-panel.component.sass'],
})
export class ToolPanelComponent implements OnInit {
  // tslint:disable: no-output-on-prefix
  @Output() onSelectionTool: EventEmitter<TOOL> = new EventEmitter<TOOL>();

  public TOOL = TOOL;

  private selectedTool: TOOL;

  constructor() {}

  ngOnInit(): void {
    this.selectionTool(TOOL.selector);
  }

  isSelected(tool: TOOL): boolean {
    return this.selectedTool === tool;
  }

  selectionTool(tool: TOOL): void {
    this.selectedTool = tool;
    this.onSelectionTool.emit(this.selectedTool);
  }
}
