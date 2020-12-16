import { Injectable } from '@angular/core';
import { WALL } from 'dist/ngx-floor-plan/lib/models/wall.model';
import { EquationType } from '../enums/equation-type.type';
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
    p1: { x: number, y: number },
    p2: { x: number, y: number },
    p3: { x: number, y: number },
    p4: { x: number, y: number }
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
  ): { x: number, y: number } {
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
  ): { x: number, y: number } {
    const x = sx + length * Math.cos(rads);
    const y = sy + length * Math.sin(rads);
    return { x, y };
  }

  measure(p1: { x: number, y: number }, p2: { x: number, y: number }): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  gap(p1: { x: number, y: number }, p2: { x: number, y: number }): number {
    return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
  }

  btwn(value: number, p1: number, p2: number, round?: 'round'): boolean {
    if (round) {
      value = Math.round(value);
      p1 = Math.round(p1);
      p2 = Math.round(p2);
    }
    return (value >= p1 && value <= p2) || (value >= p2 && value <= p1);
  }

  equation(
    p1: { x: number, y: number },
    p2: { x: number, y: number }
  ): EquationType {
    if (p2.x - p1.x === 0) {
      return { m: 'v', b: p1.x };
    }
    if (p2.y - p1.y === 0) {
      return { m: 'h', b: p1.y };
    }
    const m = (p2.y - p1.y) / (p2.x - p1.x); // m = (y2 - y1) / (x2 - x1)
    const b = p1.y - m * p1.x; // b = y - mx
    return { m, b };
  }

  intersection(eq1: EquationType, eq2: EquationType): { x: number, y: number } {
    if (eq1.m === 'v' && eq2.m === 'h') {
      return { x: eq1.b, y: eq2.b };
    }
    if (eq1.m === 'h' && eq2.m === 'v') {
      return { x: eq2.b, y: eq1.b };
    }
    if (eq1.m === 'v' && typeof eq2.m === 'number') {
      return { x: eq1.b, y: eq2.m * eq1.b + eq2.b };
    }
    if (eq1.m === 'h' && typeof eq2.m === 'number') {
      return { x: (eq1.b - eq2.b) / eq2.m, y: eq1.b };
    }
    if (eq2.m === 'v' && typeof eq1.m === 'number') {
      return { x: eq2.b, y: eq1.m * eq2.b + eq1.b };
    }
    if (eq2.m === 'h' && typeof eq1.m === 'number') {
      return { x: (eq2.b - eq1.b) / eq1.m, y: eq2.b };
    }
    if (typeof eq1.m === 'number' && typeof eq2.m === 'number') {
      const x = (eq2.b - eq1.b) / (eq1.m - eq2.m); // x = (b2 - b1) / (m1 - m2)
      const y = eq1.m * x + eq1.b; // y = mx + b
      return { x, y };
    }
    return null;
  }

  nearPointOnEquation(
    eq: EquationType,
    point: { x: number, y: number }
  ): { x: number, y: number, distance: number } {
    if (eq.m === 'h') {
      return {
        x: point.x,
        y: eq.b,
        distance: Math.abs(eq.b - point.y),
      };
    }
    if (eq.m === 'v') {
      return {
        x: eq.b,
        y: point.y,
        distance: Math.abs(eq.b - point.x),
      };
    }
    const p1 = { x: point.x, y: eq.m * point.x + eq.b };
    const p2 = { x: (point.y - eq.b) / eq.m, y: point.y };

    const a = point.x - p1.x;
    const b = point.y - p1.y;
    const c = p2.x - p1.x;
    const d = p2.y - p1.y;

    const dot = a * c + b * d;
    const len = Math.pow(c, 2) + Math.pow(d, 2);
    const p = len ? dot / len : -1;

    const x = p < 0 ? p1.x : p > 1 ? p2.x : p1.x + p * c;
    const y = p < 0 ? p1.y : p > 1 ? p2.y : p1.y + p * d;

    return {
      x,
      y,
      distance: this.measure({ x, y }, point),
    };
  }
}
