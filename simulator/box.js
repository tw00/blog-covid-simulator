import Vector from './lib/vector'
import * as math from 'mathjs'

function get_intersection(p0, p1, p2, p3) {
  let s, s1_x, s1_y, s2_x, s2_y, t;
  s1_x = p1.x - p0.x;
  s1_y = p1.y - p0.y;
  s2_x = p3.x - p2.x;
  s2_y = p3.y - p2.y;
  s = (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y))
    / (-s2_x * s1_y + s1_x * s2_y);
  t = (s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x))
    / (-s2_x * s1_y + s1_x * s2_y);
  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return new Vector(
      p0.x + (t * s1_x),
      p0.y + (t * s1_y)
    );
  }
  return null;
}

export default class Box {
  constructor(x, y, w, h) {
    this.pos = new Vector(x, y);
    this.width = w;
    this.height = h;
    // this._debug = [];
  }

  get boundingBox() { // TODO: add memoization
    return {
      ix: this.pos.x,
      iy: this.pos.y,
      ax: this.pos.x + this.width,
      ay: this.pos.y + this.height,
    };
  }

  get borders() { // TODO: add memoization
    const bb = this.boundingBox;
    return [
      { A: { x: bb.ix, y: bb.iy }, B: { x: bb.ix, y: bb.ay } },
      { A: { x: bb.ix, y: bb.ay }, B: { x: bb.ax, y: bb.ay } },
      { A: { x: bb.ax, y: bb.ay }, B: { x: bb.ax, y: bb.iy } },
      { A: { x: bb.ax, y: bb.iy }, B: { x: bb.ix, y: bb.iy } },
    ];
  }

  checkCollision(p, off = 0) {
    const bb = this.boundingBox;
    if (bb.ix - off <= p.x && p.x <= bb.ax + off
     && bb.iy - off <= p.y && p.y <= bb.ay + off) {
      // Point is in bounding box
      return true
    }
    return false;
  }

  collideWall(pos, target) {
    const borders = this.borders;
    let closest_intersection = null;

    // this._debug.push({ pos, target })

    for (let border of borders) {
      let intersection = get_intersection(pos, target, border.A, border.B);

      if (intersection) {
        if (!closest_intersection ||
          Vector.sub(pos, intersection).lengthSquared <=
          Vector.sub(pos, closest_intersection).lengthSquared) {
          closest_intersection = intersection;
        }
      }
    }

    if (closest_intersection) {
      return closest_intersection.subSelf(
        Vector.sub(pos, closest_intersection).normalize().multiplyScalar(-10)
      );
    }
    return target;
  }

  render(ctx) {
    this._debugCtx = ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; // '#555555';
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    ctx.stroke();
    ctx.restore();

    /*
    ctx.save();
    for( const { pos, target } of this._debug ) {
      let closest_intersection = null;
      for ( let border of this.borders ) {
        const intersection = get_intersection(
          target, pos,
          border.A, border.B);

        if ( intersection ) {
          if (!closest_intersection ||
              Vector.sub(pos, intersection).lengthSquared <
              Vector.sub(pos, closest_intersection).lengthSquared ) {
            closest_intersection = intersection;
          }
        }

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(border.A.x, border.A.y)
        ctx.lineTo(border.B.x, border.B.y)
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = 'green';
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(target.x, target.y)
        ctx.stroke();

        if (intersection) {
          ctx.fillRect(intersection.x-3, intersection.y-3, 6, 6)
        }
      }
      if (closest_intersection ) {
        ctx.fillStyle = 'cyan'
        ctx.fillRect(closest_intersection.x - 6, closest_intersection.y - 6, 12, 12)
      }
    }
    ctx.restore();
    this._debug = [];
    */
  }
}