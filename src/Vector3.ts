import { GnomonicData } from './gnomonic';

class Vector3 {
  constructor(x: number, y: number, z?: number);
  constructor(gnomonic: GnomonicData);
  constructor(x: number | GnomonicData, y = 1, z = 1) {
    if (typeof x === 'object') {
      this.x = x.x;
      this.y = x.y;
      this.z = 1;
    } else {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  cross = (b: Vector3): Vector3 =>
    new Vector3(
      this.y * b.z - this.z * b.y,
      this.z * b.x - this.x * b.z,
      this.x * b.y - this.y * b.x
    );

  dot = (b: Vector3): number => this.x * b.x + this.y * b.y + this.z * b.z;

  norm = () => new Vector3(this.x / this.z, this.y / this.z, 1);

  x: number;
  y: number;
  z: number;
}

export default Vector3;
