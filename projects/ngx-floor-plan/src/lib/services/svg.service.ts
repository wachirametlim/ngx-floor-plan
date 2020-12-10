import { Injectable } from '@angular/core';
import { SHAPE_TYPE } from '../enums/shape-type.type';

@Injectable({
  providedIn: 'root',
})
export class SvgService {
  constructor() {}

  create(shapeType: SHAPE_TYPE, attrs: object): SVGElement {
    const shape = document.createElementNS(
      'http://www.w3.org/2000/svg',
      shapeType
    );
    for (const k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) {
        continue;
      }
      const value = attrs[k];
      shape.setAttribute(k, value);
    }
    return shape;
  }

  circle(cx: number, cy: number, r: number): string {
    return `M ${cx} ${cy} m ${-r},0 a ${r},${r} 0 1,0 ${
      r * 2
    },0 a ${r},${r} 0 1,0 ${-r * 2},0`;
  }

  rectangle(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    p4: { x: number; y: number }
  ): string {
    return `M ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} L ${p4.x},${p4.y} Z`;
  }

  degrees(x1, y1, x2, y2): number {
    const x = x2 - x1;
    const y = y2 - y1;
    let degs = (Math.atan2(y, x) * 180) / Math.PI; // degrees range (-180, 180)
    if (degs < 0) {
      degs = 360 + degs;
    } // set degrees range (0, 360)
    return degs;
  }

  radians(x1, y1, x2, y2): number {
    const x = x2 - x1;
    const y = y2 - y1;
    return Math.atan2(y, x);
  }

  // sx = start point x
  // sy = start point y
  calcPointDegs(
    sx: number,
    sy: number,
    length: number,
    degs: number
  ): { x: number; y: number } {
    const x = sx + length * Math.cos((degs * Math.PI) / 180);
    const y = sy + length * Math.sin((degs * Math.PI) / 180);
    return { x, y };
  }

  // sx = start point x
  // sy = start point y
  calcPointRads(
    sx: number,
    sy: number,
    length: number,
    rads: number
  ): { x: number; y: number } {
    const x = sx + length * Math.cos(rads);
    const y = sy + length * Math.sin(rads);
    return { x, y };
  }

  measure(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }
}
