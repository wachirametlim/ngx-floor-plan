import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { MOUSE_BUTTON } from '../../enums/mouse-button.enum';
import { TOOL } from '../../enums/tool.enum';
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
  @ViewChild('contentWallNodes', { static: false }) contentWallNodeEl: ElementRef;
  @ViewChild('contentWallTexts', { static: false }) contentWallTextEl: ElementRef;
  @ViewChild('snapPoint', { static: false }) snapPointEl: ElementRef;
  @ViewChild('debug', { static: false }) debugEl: ElementRef;

  @Input() selectedTool: TOOL;

  private mblClicked = false;
  private walls: WALL[] = [];
  private selectedWallIndex: number | { index: number, posX: 'x1' | 'x2', posY: 'y1' | 'y2' }[];

  constructor(private editor: EditorService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const svg: SVGElement = this.contentEl.nativeElement;
    svg.addEventListener('mousedown', this.onContentMouseDown);
    svg.addEventListener('mousemove', this.onContentMouseMove);
    svg.addEventListener('mouseup', this.onContentMouseUp);
  }

  canvasClass(): string {
    switch (this.selectedTool) {
      case TOOL.wall: return 'drawing';
      default: return '';
    }
  }

  onContentMouseDown = (event: MouseEvent): void => {
    if (event.button === MOUSE_BUTTON.left) {
      this.mblClicked = true;
      const snapGrid = this.editor.snapGrid(event.offsetX, event.offsetY, 'on');
      const snapWall = this.editor.snapWall(snapGrid.x, snapGrid.y, this.walls);
      const snapNode = this.editor.snapWallNode(snapGrid.x, snapGrid.y, this.walls);

      switch (this.selectedTool) {
        case TOOL.wall: {
          const snap = snapWall || snapNode || snapGrid;
          this.walls.push(new WALL(snap.x, snap.y, snap.x, snap.y));
          this.selectedWallIndex = this.walls.length - 1;
          break;
        }
        case TOOL.selector: {
          this.selectedWallIndex = [];
          for (let i = 0; i < this.walls.length; i++) {
            const wall = this.walls[i];
            if (this.editor.nearPoint({ x: wall.x1, y: wall.y1 }, snapGrid)) {
              this.selectedWallIndex.push({ index: i, posX: 'x1', posY: 'y1' });
            }
            if (this.editor.nearPoint({ x: wall.x2, y: wall.y2 }, snapGrid)) {
              this.selectedWallIndex.push({ index: i, posX: 'x2', posY: 'y2' });
            }
          }
        }
      }
    }
  }

  onContentMouseUp = (event: MouseEvent): void => {
    if (event.button === MOUSE_BUTTON.left) {
      switch (this.selectedTool) {
        case TOOL.wall: {
          this.mblClicked = false;
          this.selectedWallIndex = null;
          break;
        }
        case TOOL.selector: {
          this.mblClicked = false;
        }
      }
      this.walls = this.editor.splitWall(this.walls);
      this.walls = this.editor.filterNoWall(this.walls);
      this.walls = this.editor.filterDupicateWall(this.walls);
      this.drawWalls();
      this.drawRooms();
    }
  }

  onContentMouseMove = (event: MouseEvent): void => {
    if (this.mblClicked && this.selectedWallIndex !== null) {
      const snapGrid = this.editor.snapGrid(event.offsetX, event.offsetY, 'on');
      const snapWall = this.editor.snapWall(snapGrid.x, snapGrid.y, this.walls, 'draw');
      const snapNode = this.editor.snapWallNode(snapGrid.x, snapGrid.y, this.walls, 'draw');
      const snap = snapWall || snapNode || snapGrid;

      if (typeof this.selectedWallIndex === 'number') {
        this.walls[this.selectedWallIndex].x2 = snap.x;
        this.walls[this.selectedWallIndex].y2 = snap.y;
      } else {
        for (const w of this.selectedWallIndex) {
          this.walls[w.index][w.posX] = snapGrid.x;
          this.walls[w.index][w.posY] = snapGrid.y;
        }
      }
      this.drawWalls();
    }

    this.drawSnapPoint(event);
  }

  drawWalls(): void {
    const svgRoom: SVGElement = this.contentRoomEl.nativeElement;
    const svgWall: SVGElement = this.contentWallEl.nativeElement;
    const svgNode: SVGElement = this.contentWallNodeEl.nativeElement;
    const svgText: SVGElement = this.contentWallTextEl.nativeElement;
    this.editor.clearElement(svgRoom);
    this.editor.wallDrawing(svgWall, this.walls);
    this.editor.wallNodeDrawing(svgNode, svgText, this.walls);
  }

  drawRooms(): void {
    const svgRoom: SVGElement = this.contentRoomEl.nativeElement;
    this.editor.roomDrawing(svgRoom, this.walls);

  }

  drawSnapPoint(event: MouseEvent): void {
    const svg: SVGElement = this.snapPointEl.nativeElement;
    this.editor.snapPointDrawing(svg, event, this.walls);
  }
}
