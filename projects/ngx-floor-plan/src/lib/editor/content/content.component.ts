import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { EditorService } from '../../services/editor.service';

@Component({
  selector: 'fp-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.sass'],
})
export class ContentComponent implements OnInit, AfterViewInit {
  @ViewChild('content', { static: false }) contentEl: ElementRef;

  constructor(private editor: EditorService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const svg: SVGElement = this.contentEl.nativeElement;
    svg.addEventListener('mousedown', this.onContentMouseDown);
    svg.addEventListener('mouseup', this.onContentMouseUp);
    svg.addEventListener('mousemove', this.onContentMouseMove);
  }

  onContentMouseDown = (event): void => {
    const svg: SVGElement = this.contentEl.nativeElement;
    this.editor.generateWalls(svg, null);
  };

  onContentMouseUp = (event): void => {};

  onContentMouseMove = (event): void => {};
}
