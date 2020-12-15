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

      const textPos = this.svg.calcPointDegs(wall.x1, wall.y1, 20, degs);
      const textShape = this.svg.create('text', {
        x: textPos.x,
        y: textPos.y,
      });
      textShape.textContent = `${wall.x1.toFixed(2)}, ${wall.y1.toFixed(2)}`;
      elText.append(textShape);

      const textPos2 = this.svg.calcPointDegs(wall.x2, wall.y2, 20, degs - 180);
      const textShape2 = this.svg.create('text', {
        x: textPos2.x,
        y: textPos2.y,
      });
      textShape2.textContent = `${wall.x2.toFixed(2)}, ${wall.y2.toFixed(2)}`;
      elText.append(textShape2);
    }
  }

  snapPointDrawing(el: SVGElement, event: MouseEvent, walls: WALL[]): void {
    this.clearElement(el);

    const snapGrid = this.snapGrid(event.offsetX, event.offsetY, 'on');
    const snapPoint = this.snapWallNode(snapGrid.x, snapGrid.y, walls);
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
    } else {
      const snapWallPoint = this.snapWall(snapGrid.x, snapGrid.y, walls);
      if (snapWallPoint) {
        const circle = this.svg.circle(snapWallPoint.x, snapWallPoint.y, 5);
        el.append(
          this.svg.create('path', {
            d: circle,
            stroke: 'none',
            fill: '#0f0',
          })
        );
      }
    }

    const point = this.snapGrid(snapGrid.x, snapGrid.y, 'on');
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

  snapWallNode(
    x: number,
    y: number,
    walls: WALL[],
    state?: 'draw'
  ): { x: number; y: number } {
    let snap: { x: number; y: number } = null;
    for (let i = 0; i < walls.length; i++) {
      const wall = walls[i];
      let d = Infinity;

      d = this.svg.measure({ x, y }, { x: wall.x1, y: wall.y1 });
      if (d < this.mouseSnap) {
        snap = { x: wall.x1, y: wall.y1 };
      }

      // skip if state is drawing wall
      if (state === 'draw' && i + 1 === walls.length) {
        continue;
      }
      d = this.svg.measure({ x, y }, { x: wall.x2, y: wall.y2 });
      if (d < this.mouseSnap) {
        snap = { x: wall.x2, y: wall.y2 };
      }
    }
    return snap;
  }

  snapWall(
    x: number,
    y: number,
    walls: WALL[],
    state?: 'draw'
  ): { x: number; y: number } {
    let snap: { x: number; y: number } = null;

    for (let i = 0; i < walls.length; i++) {
      const wall = walls[i];
      // skip if state is drawing wall
      if (state === 'draw' && i + 1 === walls.length) {
        continue;
      }
      const eq = this.svg.equation(
        { x: wall.x1, y: wall.y1 },
        { x: wall.x2, y: wall.y2 }
      );
      const nearPoint = this.svg.nearPointOnEquation(eq, { x, y });
      if (
        nearPoint &&
        nearPoint.distance < this.mouseSnap &&
        this.svg.btwn(nearPoint.x, wall.x1, wall.x2) &&
        this.svg.btwn(nearPoint.y, wall.y1, wall.y2)
      ) {
        snap = { x: nearPoint.x, y: nearPoint.y };
      }
    }
    return snap;
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

  splitWall(walls: WALL[]): WALL[] {
    for (let i = 0; i < walls.length; i++) {
      const wall1 = walls[i];
      const len = Math.round(this.svg.measure({ x: wall1.x1, y: wall1.y1 }, { x: wall1.x2, y: wall1.y2 }));
      const eq1 = this.svg.equation({ x: wall1.x1, y: wall1.y1 }, { x: wall1.x2, y: wall1.y2 });
      for (let j = 0; j < walls.length; j++) {
        if (i === j) {
          continue;
        }
        const wall2 = walls[j];
        const eq2 = this.svg.equation({ x: wall2.x1, y: wall2.y1 }, { x: wall2.x2, y: wall2.y2 });
        const intersect = this.svg.intersection(eq1, eq2);
        if (
          intersect &&
          this.svg.btwn(intersect.x, wall2.x1, wall2.x2, 'round') &&
          this.svg.btwn(intersect.y, wall2.y1, wall2.y2, 'round') &&
          this.svg.btwn(intersect.x, wall1.x1, wall1.x2, 'round') &&
          this.svg.btwn(intersect.y, wall1.y1, wall1.y2, 'round')
        ) {
          const distance = Math.round(this.svg.measure({ x: wall1.x1, y: wall1.y1 }, intersect));
          console.log(distance, len);
          if (distance > 5 && distance < len) {
            walls.push({
              x1: intersect.x,
              y1: intersect.y,
              x2: wall1.x1,
              y2: wall1.y1,
            });

            walls[i].x1 = intersect.x;
            walls[i].y1 = intersect.y;
          }
        }
      }
    }
    return walls;
  }

  findRooms(elRoom: SVGElement, walls: WALL[]): void {
    this.clearElement(elRoom);

    const intersects = [];
    for (let i = 0; i < walls.length; i++) {
      const wall1 = walls[i];
      for (let j = 0; j < walls.length; j++) {
        if (i === j) {
          continue;
        }
        const wall2 = walls[j];

        const eq1 = this.svg.equation(
          { x: wall1.x1, y: wall1.y1 },
          { x: wall1.x2, y: wall1.y2 }
        );
        const eq2 = this.svg.equation(
          { x: wall2.x1, y: wall2.y1 },
          { x: wall2.x2, y: wall2.y2 }
        );
        const intersect = this.svg.intersection(eq1, eq2);
        if (
          intersect &&
          this.svg.btwn(intersect.x, wall2.x1, wall2.x2, 'round') &&
          this.svg.btwn(intersect.y, wall2.y1, wall2.y2, 'round') &&
          this.svg.btwn(intersect.x, wall1.x1, wall1.x2, 'round') &&
          this.svg.btwn(intersect.y, wall1.y1, wall1.y2, 'round')
        ) {
          const isAdded = intersects.findIndex(
            (its) =>
              Math.round(its.x) === Math.round(intersect.x) &&
              Math.round(its.y) === Math.round(intersect.y)
          );
          if (isAdded < 0) {
            intersects.push(intersect);
          }
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
