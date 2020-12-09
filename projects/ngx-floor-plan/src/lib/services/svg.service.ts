import { Injectable } from '@angular/core';
import { SHAPE_TYPE } from '../enums/shape-type.type';


@Injectable({
  providedIn: 'root'
})
export class SvgService {

  constructor() { }

  create(shapeType: SHAPE_TYPE, attrs: object): SVGElement {
    const shape = document.createElementNS('http://www.w3.org/2000/svg', shapeType);
    for (const k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) { continue; }
      const value = attrs[k];
      shape.setAttribute(k, value);
    }
    return shape;
  }

  circle(cx: number, cy: number, r: number): string {
    return `M ${cx} ${cy} m ${-r},0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${-r * 2},0`;
  }

  rectangle(x1: number, y1: number, x2: number, y2: number): string {
    return `M ${x1},${y1} L ${x1},${y2} L ${x2},${y2} L ${x2},${y1} Z`;
  }

  deg(x1, y1, x2, y2): number {
    const x = x2 - x1;
    const y = y2 - y1;
    let degs = Math.atan2(y, x) * 180 / Math.PI; // degs range (-180, 180)
    if (degs < 0) degs = 360 + degs; // set degs range (0, 360)
    return degs;
  }

  // calcDes(x: number, y: number, length: number, degs: number): { x: number, y: number } {
  // }
}
