export class WALL {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}
