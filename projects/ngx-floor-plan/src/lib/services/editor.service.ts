import { Injectable } from '@angular/core';
import { WALL } from '../models/wall.model';
import { SvgService } from './svg.service';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  constructor(private svg: SvgService) {}

  clearElement(el: Element): void {
    el.innerHTML = '';
  }

  wallComputing(el: SVGElement, walls: WALL[]): void {
    this.clearElement(el);

    for (const wall of walls) {
      const c = this.svg.rectangle(wall.x, wall.y, wall.x + wall.width, wall.y + wall.height);
      el.append(
        this.svg.create('path', {
          d: c,
          stroke: 'none',
          fill: '#f00',
          'stroke-width': 1,
        })
      );
    }
  }
}
