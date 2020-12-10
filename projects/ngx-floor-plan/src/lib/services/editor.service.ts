import { Injectable } from '@angular/core';
import { WALL } from '../models/wall.model';
import { SvgService } from './svg.service';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  public wallWidth = 10;
  public mouseSnap = 20;

  private readonly gridSnap = 10;

  constructor(private svg: SvgService) {}

  clearElement(el: Element): void {
    el.innerHTML = '';
  }

  wallComputing(el: SVGElement, elText: SVGElement, walls: WALL[]): void {
    this.clearElement(el);
    this.clearElement(elText);

    for (const wall of walls) {
      const degs = this.svg.degrees(wall.x1, wall.y1, wall.x2, wall.y2);
      const width = this.wallWidth / 2;
      const path = this.svg.rectangle(
        this.svg.calcPointDegs(wall.x1, wall.y1, width, degs - 90),
        this.svg.calcPointDegs(wall.x1, wall.y1, width, degs + 90),
        this.svg.calcPointDegs(wall.x2, wall.y2, width, degs + 90),
        this.svg.calcPointDegs(wall.x2, wall.y2, width, degs - 90)
      );
      el.append(
        this.svg.create('path', {
          d: path,
          stroke: '#ffffff',
          'stroke-width': 2,
          fill: '#deb8a2',
        })
      );

      const l = this.svg.measure(
        { x: wall.x1, y: wall.y1 },
        { x: wall.x2, y: wall.y2 }
      );
      const textPos = this.svg.calcPointDegs(wall.x1, wall.y1, l / 2, degs);
      const textShape = this.svg.create('text', {
        x: textPos.x,
        y: textPos.y,
      });
      textShape.textContent = l.toFixed(2) + 'px';
      elText.append(textShape);
    }
  }

  snapPointComputing(el: SVGElement, event: MouseEvent, walls: WALL[]): void {
    this.clearElement(el);

    const snapPoint = this.snapWallPoint(event.offsetX, event.offsetY, walls);
    if (snapPoint) {
      const circle = this.svg.circle(snapPoint.x, snapPoint.y, 5);
      el.append(
        this.svg.create('path', {
          d: circle,
          stroke: '#ffffff',
          'stroke-width': 2,
          fill: '#57d2ff',
        })
      );
    }
  }

  calculateSnap(
    x: number,
    y: number,
    state: 'on' | 'off'
  ): { x: number; y: number } {
    const size = this.gridSnap;
    let xGrid = x;
    let yGrid = y;
    if (state === 'on') {
      xGrid = Math.round(x / size) * size;
      yGrid = Math.round(y / size) * size;
    }

    return { x: xGrid, y: yGrid };
  }

  snapWallPoint(
    x: number,
    y: number,
    walls: WALL[],
    state?: 'draw'
  ): { x: number; y: number } {
    let snapW: { x: number; y: number } = null;
    for (let i = 0; i < walls.length; i++) {
      const wall = walls[i];
      let d = Infinity;

      d = this.svg.measure({ x, y }, { x: wall.x1, y: wall.y1 });
      if (d < this.mouseSnap) {
        snapW = { x: wall.x1, y: wall.y1 };
      }

      // skip if state is drawing wall
      if (state === 'draw' && i + 1 === walls.length) {
        continue;
      }
      d = this.svg.measure({ x, y }, { x: wall.x2, y: wall.y2 });
      if (d < this.mouseSnap) {
        snapW = { x: wall.x2, y: wall.y2 };
      }
    }
    return snapW;
  }
}
