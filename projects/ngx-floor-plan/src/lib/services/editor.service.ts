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

  wallDrawing(elWall: SVGElement, walls: WALL[]): void {
    this.clearElement(elWall);

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
    }
  }

  wallNodeDrawing(elNode: SVGElement, elText: SVGElement, walls: WALL[]): void {
    this.clearElement(elNode);
    this.clearElement(elText);

    const nodes = this.nodeList(walls);
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

      const textShape = this.svg.create('text', {
        x: node.x,
        y: node.y,
      });
      textShape.textContent = `${node.x.toFixed(2)}, ${node.y.toFixed(2)}`;
      elText.append(textShape);
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

  intersectionPoints(walls: WALL[]): { x: number; y: number }[] {
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

  nodeList(walls: WALL[]): { x: number; y: number }[] {
    const nodes: { x: number; y: number }[] = [];
    for (const wall of walls) {
      const inNodeFrom = nodes.find((n) =>
        this.nearPoint(n, { x: wall.x1, y: wall.y1 }, 1)
      );
      const inNodeTo = nodes.find((n) =>
        this.nearPoint(n, { x: wall.x2, y: wall.y2 }, 1)
      );
      if (!inNodeFrom) {
        nodes.push({ x: wall.x1, y: wall.y1 });
      }
      if (!inNodeTo) {
        nodes.push({ x: wall.x2, y: wall.y2 });
      }
    }
    return nodes;
  }

  junctionPoint(
    fromPoint: { x: number; y: number },
    walls: WALL[]
  ): { x: number; y: number; junction: { x: number; y: number }[] } {
    const junction: { x: number; y: number }[] = [];
    // connected next point
    for (const wall of walls) {
      if (fromPoint.x === wall.x1 && fromPoint.y === wall.y1) {
        junction.push({ x: wall.x2, y: wall.y2 });
      }
      if (fromPoint.x === wall.x2 && fromPoint.y === wall.y2) {
        junction.push({ x: wall.x1, y: wall.y1 });
      }
    }
    return {
      x: fromPoint.x,
      y: fromPoint.y,
      junction,
    };
  }

  findWay(
    nodes: { x: number; y: number; junction: { x: number; y: number }[] }[],
    startNode: { x: number; y: number; junction: { x: number; y: number }[] },
    prevNode: { x: number; y: number; junction: { x: number; y: number }[] },
    index: number, // index of node to start finding
    seg: number,
    result: { x: number; y: number }[]
  ): { x: number; y: number }[] {
    if (index >= nodes.length) {
      return result;
    }
    const node = nodes[index];
    if (seg >= node.junction.length) {
      return result;
    }
    const j = node.junction[seg];
    const nextNode = nodes.find((n) => n.x === j.x && n.y === j.y);
    if (!nextNode) {
      return result;
    }
    // check next node is not start node
    const isStart = startNode.x === j.x && startNode.y === j.y;
    const isPrev = prevNode.x === j.x && prevNode.y === j.y;
    if (!isStart && !isPrev) {
      result = this.findWay(nodes, startNode, node, index + 1, seg, result);
      result.push(j);
    } else {
      result = this.findWay(nodes, startNode, node, index, seg + 1, result);
      if (isStart && index === nodes.length - 1) {
        result.push(j);
      }
    }

    return result;
  }

  findRoom(
    nodes: { x: number; y: number; junction: { x: number; y: number }[] }[]
  ): { x: number; y: number }[][] {
    const ROOM_NODE: { x: number; y: number }[][] = [];
    const ROOM: { x: number; y: number }[][] = [];

    for (const node of nodes) {
      const inRoomNode = ROOM_NODE.find((r) =>
        r.find((p) => p.x === node.x && p.y === node.y)
      );
      if (inRoomNode) {
        continue;
      }
      const room = this.findWay(nodes, node, node, 0, 0, []);
      room.push({ x: node.x, y: node.y });
      console.log(node, room);
      ROOM_NODE.push(room);

      if (
        room[0].x === room[room.length - 1].x &&
        room[0].y === room[room.length - 1].y
      ) {
        ROOM.push(room);
      }
    }
    return ROOM;
  }

  roomDrawing(elRoom: SVGElement, walls: WALL[]): void {
    this.clearElement(elRoom);
    const nodes = this.nodeList(walls);

    const junctionPoints: {
      x: number;
      y: number;
      junction: { x: number; y: number }[];
    }[] = [];
    for (const node of nodes) {
      const junction = this.junctionPoint(node, walls);
      junctionPoints.push(junction);
    }
    const rooms = this.findRoom(junctionPoints);
    console.log('------------------------');

    for (const room of rooms) {
      let d = `M ${room[0].x},${room[0].y}`;
      for (const r of room) {
        d += ` L ${r.x},${r.y}`;
      }
      d += ' Z';
      elRoom.append(
        this.svg.create('path', {
          d,
          fill: '#fff',
          stroke: 'none',
        })
      );
    }
  }
}
