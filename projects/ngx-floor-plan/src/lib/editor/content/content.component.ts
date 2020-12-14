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
  @ViewChild('contentRooms', { static: false }) contentRoomEl: ElementRef;
  @ViewChild('contentWalls', { static: false }) contentWallEl: ElementRef;
  @ViewChild('contentWallTexts', { static: false }) contentWallTextEl: ElementRef;
  @ViewChild('snapPoint', { static: false }) snapPointEl: ElementRef;

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
    svg.addEventListener('mouseenter', this.onContentMouseEnter);
    svg.addEventListener('mouseleave', this.onContentMouseLeave);
  }

  onContentMouseDown = (event: MouseEvent): void => {
    if (event.button === MOUSE_BUTTON.left) {
      this.mblClicked = true;
      const snap = this.editor.snapWallPoint(event.offsetX, event.offsetY, this.walls);
      const grid = this.editor.snapGrid(event.offsetX, event.offsetY, 'on');

      if (snap) {
        this.walls.push(new WALL(snap.x, snap.y, snap.x, snap.y));
      } else {
        this.walls.push(new WALL(grid.x, grid.y, grid.x, grid.y));
      }
      this.selectedWallIndex = this.walls.length - 1;
      this.drawWalls();
    }
  }

  onContentMouseUp = (event: MouseEvent): void => {
    if (event.button === MOUSE_BUTTON.left) {
      this.mblClicked = false;
      this.selectedWallIndex = null;
    }
  }

  onContentMouseMove = (event: MouseEvent): void => {
    if (this.mblClicked && this.selectedWallIndex !== null) {
      const grid = this.editor.snapGrid(event.offsetX, event.offsetY, 'on');
      const snap = this.editor.snapWallPoint(event.offsetX, event.offsetY, this.walls, 'draw');

      this.walls[this.selectedWallIndex].x2 = snap ? snap.x : grid.x;
      this.walls[this.selectedWallIndex].y2 = snap ? snap.y : grid.y;
      this.drawWalls();
    }

    this.drawSnapPoint(event);
  }

  onContentMouseEnter = (event: MouseEvent): void => {}

  onContentMouseLeave = (event: MouseEvent): void => {}

  drawWalls(): void {
    const svgWall: SVGElement = this.contentWallEl.nativeElement;
    const svgText: SVGElement = this.contentWallTextEl.nativeElement;
    const svgRoom: SVGElement = this.contentRoomEl.nativeElement;
    this.editor.wallDrawing(svgWall, svgText, this.walls);
    this.editor.findRooms(svgRoom, this.walls);
  }

  drawSnapPoint(event: MouseEvent): void {
    const svg: SVGElement = this.snapPointEl.nativeElement;
    this.editor.snapPointDrawing(svg, event, this.walls);
  }
}
