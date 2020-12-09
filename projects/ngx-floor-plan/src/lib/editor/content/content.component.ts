import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MOUSE_BUTTON } from '../../enums/mouse-button.enum';
import { WALL } from '../../models/wall.model';
import { EditorService } from '../../services/editor.service';

@Component({
  selector: 'fp-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.sass'],
})
export class ContentComponent implements OnInit, AfterViewInit {
  @ViewChild('content', { static: false }) contentEl: ElementRef;
  @ViewChild('contentWalls', { static: false }) contentWallsEl: ElementRef;
  private mblClicked = false;
  private walls: WALL[] = [];
  private selectedWallIndex: number;

  constructor(private editor: EditorService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const svg: SVGElement = this.contentEl.nativeElement;
    svg.addEventListener('mousedown', this.onContentMouseDown);
    svg.addEventListener('mouseup', this.onContentMouseUp);
    svg.addEventListener('mousemove', this.onContentMouseMove);
  }

  onContentMouseDown = (event: MouseEvent): void => {
    if (event.button === MOUSE_BUTTON.left) {
      this.mblClicked = true;
      this.walls.push(new WALL(event.offsetX, event.offsetY, 100, 20));
      this.selectedWallIndex = this.walls.length - 1;
      this.drawWalls();
    }
  };

  onContentMouseUp = (event: MouseEvent): void => {
    if (event.button === MOUSE_BUTTON.left) {
      this.mblClicked = false;
      this.selectedWallIndex = null;
    }
  };

  onContentMouseMove = (event: MouseEvent): void => {
    if (this.mblClicked && this.selectedWallIndex !== null) {
      this.walls[this.selectedWallIndex].x = event.offsetX;
      this.walls[this.selectedWallIndex].y = event.offsetY;
      this.drawWalls();
    }
  };

  drawWalls(): void {
    const svg: SVGElement = this.contentWallsEl.nativeElement;
    this.editor.wallComputing(svg, this.walls);
  }
}
