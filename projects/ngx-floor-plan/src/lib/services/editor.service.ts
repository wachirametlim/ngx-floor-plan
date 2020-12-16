import { Injectable } from '@angular/core';
import { WALL } from '../models/wall.model';
import { ObjectUtils } from '../utils/objects';
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

  wallNodeDrawing(elNode: SVGElement, walls: WALL[]): void {
    this.clearElement(elNode);
    const nodes: { x: number; y: number }[] = [];
    for (const wall of walls) {
      const inNode1 = nodes.find((n) =>
        this.nearPoint(n, { x: wall.x1, y: wall.y1 }, 1)
      );
      const inNode2 = nodes.find((n) =>
        this.nearPoint(n, { x: wall.x2, y: wall.y2 }, 1)
      );
      if (!inNode1) {
        nodes.push({ x: wall.x1, y: wall.y1 });
      }
      if (!inNode2) {
        nodes.push({ x: wall.x2, y: wall.y2 });
      }
    }
    for (const node of nodes) {
      elNode.append(
        this.svg.create('circle', {
          cx: node.x,
          cy: node.y,
          r: 8,
          fill: '#9a9a9a',
          stroke: '#666',
          'stroke-width': '2',
        })
      );
    }
  }

  snapPointDrawing(el: SVGElement, event: MouseEvent, walls: WALL[]): void {
    this.clearElement(el);

    const snapGrid = this.snapGrid(event.offsetX, event.offsetY, 'on');
    const sPoint = this.snapWallNode(snapGrid.x, snapGrid.y, walls);
    if (sPoint) {
      const circle = this.svg.circle(sPoint.x, sPoint.y, 5);
      el.append(
        this.svg.create('path', {
          d: circle,
          stroke: '#ffffff',
          'stroke-width': 2,
          fill: '#57d2ff',
        })
      );
    } else {
      const swPoint = this.snapWall(snapGrid.x, snapGrid.y, walls);
      if (swPoint) {
        const circle = this.svg.circle(swPoint.x, swPoint.y, 5);
        el.append(
          this.svg.create('path', {
            d: circle,
            stroke: 'none',
            fill: '#0f0',
          })
        );
      }
    }

    const dPoint = this.snapDirectionPoint(snapGrid.x, snapGrid.y, walls);
    if (dPoint) {
      el.append(
        this.svg.create('line', {
          x1: snapGrid.x,
          y1: snapGrid.y,
          x2: dPoint.x,
          y2: dPoint.y,
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
      const len = Math.round(
        this.svg.measure(
          { x: wall1.x1, y: wall1.y1 },
          { x: wall1.x2, y: wall1.y2 }
        )
      );
      const eq1 = this.svg.equation(
        { x: wall1.x1, y: wall1.y1 },
        { x: wall1.x2, y: wall1.y2 }
      );
      for (let j = 0; j < walls.length; j++) {
        if (i === j) {
          continue;
        }
        const wall2 = walls[j];
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
          const distance = Math.round(
            this.svg.measure({ x: wall1.x1, y: wall1.y1 }, intersect)
          );
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

  intersectionPoint(walls: WALL[]): { x: number; y: number }[] {
    const intersects: { x: number; y: number }[] = [];
    for (let i = 0; i < walls.length; i++) {
      const wall1 = walls[i];
      const eq1 = this.svg.equation(
        { x: wall1.x1, y: wall1.y1 },
        { x: wall1.x2, y: wall1.y2 }
      );
      for (let j = 0; j < walls.length; j++) {
        if (i === j) {
          continue;
        }
        const wall2 = walls[j];
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
    return intersects;
  }

  nearPoint(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    length?: number
  ): boolean {
    if (!length) {
      length = this.mouseSnap;
    }
    return this.svg.measure(p1, p2) < length;
  }

  invertWall(wall: WALL): WALL {
    const temp = Object.assign({}, wall);
    temp.x1 = wall.x2;
    temp.y1 = wall.y2;
    temp.x2 = wall.x1;
    temp.y2 = wall.y1;
    return temp;
  }

  filterDupicateWall(walls: WALL[]): WALL[] {
    const newWalls: WALL[] = [];
    walls.forEach((w) => {
      const inNewWall = newWalls.find(
        (n) =>
          ObjectUtils.compare(w, n) ||
          ObjectUtils.compare(this.invertWall(w), n)
      );
      if (!inNewWall) {
        newWalls.push(w);
      }
    });
    return newWalls;
  }

  filterNoWall(walls: WALL[]): WALL[] {
    return walls.filter((wall) => {
      return (
        this.svg.measure(
          { x: wall.x1, y: wall.y1 },
          { x: wall.x2, y: wall.y2 }
        ) > 10
      );
    });
  }

  findRoom(
    point: { x: number; y: number },
    walls: WALL[]
  ): { x: number; y: number }[] {
    const nextPoints: { x: number; y: number }[] = [];
    // connected next point
    for (const wall of walls) {
      if (point.x === wall.x1 && point.y === wall.y1) {
        nextPoints.push({ x: wall.x2, y: wall.y2 });
      }
      if (point.x === wall.x2 && point.y === wall.y2) {
        nextPoints.push({ x: wall.x1, y: wall.y1 });
      }
    }
    return nextPoints;
  }

  roomDrawing(elRoom: SVGElement, walls: WALL[]): void {
    const nodes = this.intersectionPoint(walls);

    const rooms = [];
    for (const node of nodes) {
      const p = this.findRoom(node, walls);
      console.log(node, ': ', p);
    }
    console.log('------------------------');

    // for (const wall of walls) {
    //   const connectedWall: WALL[] = walls.filter(
    //     (w) =>
    //       ((w.x1 === wall.x1 && w.y1 === wall.y1) ||
    //       (w.x2 === wall.x2 && w.y2 === wall.y2))
    //   );
    //   console.log(connectedWall);
    // }
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
