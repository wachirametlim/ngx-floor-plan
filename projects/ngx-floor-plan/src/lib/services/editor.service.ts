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

  wallDrawing(elWall: SVGElement, elText: SVGElement, walls: WALL[]): void {
    this.clearElement(elWall);
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
      elWall.append(
        this.svg.create('path', {
          d: path,
          fill: '#666',
          stroke: 'none',
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

  snapPointDrawing(el: SVGElement, event: MouseEvent, walls: WALL[]): void {
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

    const point = this.snapGrid(event.offsetX, event.offsetY, 'on');
    const iPoint = this.snapDirectionPoint(point.x, point.y, walls);
    if (iPoint) {
      el.append(
        this.svg.create('line', {
          x1: point.x,
          y1: point.y,
          x2: iPoint.x,
          y2: iPoint.y,
          stroke: '#b5b5b5',
          'stroke-width': 3,
          'stroke-opacity': 0.5,
        })
      );
    }
  }

  snapGrid(
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

  snapDirectionPoint(x, y, walls: WALL[]): { x: number; y: number } {
    let iPoint: { x: number; y: number } = null;
    let dis = Infinity;
    for (const wall of walls) {

      if (this.svg.degrees(x, y, wall.x1, wall.y1) % 45 === 0) {
        const d = this.svg.measure({ x, y }, { x: wall.x1, y: wall.y1 });
        if (d < dis) {
          iPoint = { x: wall.x1, y: wall.y1 };
          dis = d;
        }
      }

      if (x === wall.x2 && y === wall.y2) {
        continue;
      }
      if (this.svg.degrees(x, y, wall.x2, wall.y2) % 45 === 0) {
        const d = this.svg.measure({ x, y }, { x: wall.x2, y: wall.y2 });
        if (d < dis) {
          iPoint = { x: wall.x2, y: wall.y2 };
          dis = d;
        }
      }
    }
    return iPoint;
  }

  findRooms(elRoom: SVGElement, walls: WALL[]): void {
    this.clearElement(elRoom);

    const intersects = [];
    for (let i = 0; i < walls.length; i++) {
      const wall1 = walls[i];
      for (let j = 0; j < walls.length; j++) {
        if (i === j) { continue; }
        const wall2 = walls[j];

        const eq1 = this.svg.equation({ x: wall1.x1, y: wall1.y1 }, { x: wall1.x2, y: wall1.y2 });
        const eq2 = this.svg.equation({ x: wall2.x1, y: wall2.y1 }, { x: wall2.x2, y: wall2.y2 });
        const intersect = this.svg.intersection(eq1, eq2);
        if (
          intersect &&
          this.svg.btwn(intersect.x, wall2.x1, wall2.x2, true) &&
          this.svg.btwn(intersect.y, wall2.y1, wall2.y2, true) &&
          this.svg.btwn(intersect.x, wall1.x1, wall1.x2, true) &&
          this.svg.btwn(intersect.y, wall1.y1, wall1.y2, true)
        ) {
          intersects.push(intersect);
        }
      }
    }

    for (const intersect of intersects) {
      elRoom.append(
        this.svg.create('circle', {
          cx: intersect.x,
          cy: intersect.y,
          r: 5,
          fill: '#f00',
          stroke: 'none',
        })
      );
    }
    // if (intersects.length > 0) {
    //   let d = `M ${intersects[0].x},${intersects[0].y}`;
    //   for (let i = 1; i < intersects.length; i++) {
    //     const intersect = intersects[i];
    //     d += ` L ${intersect.x},${intersect.y}`;
    //   }
    //   d += ' Z';
    //   console.log(d);
    //   elRoom.append(
    //     this.svg.create('path', {
    //       d,
    //       fill: '#fff',
    //       stroke: 'none',
    //     })
    //   );
    // }
  }
}
