import { Injectable } from '@angular/core';

type SHAPE_TYPE = 'a' | 'circle' | 'ellipse' | 'g' | 'line' | 'path' | 'text';

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
    return `M ${cx} ${cy} m ${-r}, 0 a ${r}, ${r} 0 1, 0 ${r * 2}, 0 a ${r}, ${r} 0 1, 0 ${-r * 2}, 0`;
  }
}
