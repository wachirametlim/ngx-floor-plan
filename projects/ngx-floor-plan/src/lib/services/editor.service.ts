import { Injectable } from '@angular/core';
import { SvgService } from './svg.service';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  constructor(private svg: SvgService) {}

  clearElement(el: Element): void {
    el.innerHTML = '';
  }

  generateWalls(el: SVGElement, walls): void {
    // this.clearElement(el);

    // for test create svg
    const c = this.svg.circle(200, 200, 20);
    el.append(
      this.svg.create('path', {
        d: c,
        stroke: 'none',
        fill: '#f00',
        'stroke-width': 1,
      })
    );
    el.append(
      this.svg.create('path', {
        d: 'M 110 110 H 190 V 190 H 110 L 110 110',
        stroke: 'none',
        fill: '#f00',
        'stroke-width': 1,
      })
    );
  }
}
