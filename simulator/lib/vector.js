/**
 * A two dimensional vector.
 */

export default class Vector {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  clear() {
    this.x = 0;
    this.y = 0;
    return this;
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  add(v1, v2) {
    this.x = v1.x + v2.x;
    this.y = v1.y + v2.y;
    return this;
  }

  addSelf(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  static sub(v1, v2) {
    return (new Vector()).sub(v1, v2)
  }

  sub(v1, v2) {
    this.x = v1.x - v2.x;
    this.y = v1.y - v2.y;
    return this;
  }

  subSelf(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  multiplySelf(v) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  multiplyScalar(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  divideScalar(s) {
    if (s) {
      this.x /= s;
      this.y /= s;
    } else {
      this.set(0, 0);
    }
    return this;
  }

  negate() {
    return this.multiplyScalar(-1);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  lengthSquared() {
    return this.x * this.x + this.y * this.y;
  }

  length() {
    return Math.sqrt(this.lengthSquared());
  }

  normalize() {
    return this.divideScalar(this.length());
  }

  distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v) {
    var dx = this.x - v.x, dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  setLength(l) {
    return this.normalize().multiplyScalar(l);
  }

  equals(v) {
    return (this.distanceTo(v) < 0.0001 /* almost same position */);
  }

  lerp(v, t) {
    var x = (v.x - this.x) * t + this.x;
    var y = (v.y - this.y) * t + this.y;
    return this.set(x, y);
  }

  isZero() {
    return (this.length() < 0.0001 /* almost zero */);
  }

  toArray() {
    return [this.x, this.y];
  }
}