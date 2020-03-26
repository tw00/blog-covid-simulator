import * as math from 'mathjs'
import Vector from './lib/vector'

const clamp = (min, v, max) => math.min(math.max(min, v), max);

export default class Agent {
  constructor(id) {

    const x = math.randomInt(800);
    const y = math.randomInt(480);

    this.pos = new Vector(x, y);
    this.target = new Vector(x, y);

    this.id = id;
    this.environment = null;

    this.state = {
      infected: Math.random() > 0.9,
      healed: false,
      healing: math.randomInt(-150, 0),
    }
  }

  step(t) {

    let curfew_list = this.environment.getCurfewList();
    let isBlocked = curfew_list.includes( this.id );

    if (!isBlocked ) {
      let d = Vector.sub(this.target, this.pos).length()

      if (d < 10) {
        const range = 100;
        const width = 800;
        const height = 480;
        const dx = math.randomInt(-range, range);
        const dy = math.randomInt(-range, range);

        this.target.x = clamp( 0, this.pos.x + dx, width);
        this.target.y = clamp( 0, this.pos.y + dy, height);

        /* if (this.environment.boxes.some(box => box.checkCollision(this.target))) {
          this.target.x = clamp( 0, this.pos.x - dx, width);
          this.target.y = clamp( 0, this.pos.y - dy, height);
        } */

      }

      this.environment.boxes.forEach(box => {
        this.target = box.collideWall( this.pos, this.target );
        // let intersection = box.collideWall( this.pos, this.target );
        // if ( intersection ) {
        //   this.target.x = clamp( 0, intersection.x, width );
        //   this.target.y = clamp( 0, intersection.y, height );
        // }
      });
    }

    let distances = this.environment.distanceMatrix[this.id] || [];
    let result = distances.reduce((acc, v, i) => {
      return v < this.environment.params.infection_radius ? acc.concat(i) : acc;
    }, []);
    result.forEach(id => {
      if (this.environment.agents[id].state.infected) {
        this.state.infected = true;
      }
    })

    if (this.state.infected) {
      this.state.healing += 1;
      if (this.state.healing > this.environment.params.healing_time) {
        this.state.healed = true;
        this.state.infected = false;
      }
    }

    // const alpha = 0.1;
    // this.pos.x += ( this.target.x - this.pos.x ) * alpha;
    // this.pos.y += ( this.target.y - this.pos.y ) * alpha;

    if (!isBlocked) {
      this.pos.addSelf(Vector.sub(this.target, this.pos).normalize());
    }

    // if (this.pos.x < -2 || this.pos.x > 800 + 2) {
    //   this.target.x = this.pos.x - (this.target.x - this.pos.x);
    // }
    // if (this.pos.y < -2 || this.pos.y > 480 + 2) {
    //   this.target.y = this.pos.y - (this.target.y - this.pos.y);
    // }
  }

  render( ctx ) {

    const radius = 5;
    ctx.circle = (x, y, r) => {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2, true);
    }

    ctx.save();
    ctx.fillStyle = this.state.infected ? 'red' :
                    this.state.healed   ? 'blue' : 'lightgreen';
    // ctx.strokeStyle = 'black';
    ctx.circle(this.pos.x, this.pos.y, radius);
    ctx.fill();
    ctx.stroke()
    ctx.restore();

    if ( this.environment.params.enable_debug ) {
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.circle(this.pos.x, this.pos.y, this.environment.params.infection_radius)
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.strokeRect(this.target.x - 3, this.target.y - 3, 6, 6);
      ctx.beginPath();
      ctx.moveTo(this.pos.x, this.pos.y);
      ctx.lineTo(this.target.x, this.target.y);
      ctx.stroke();
      ctx.restore();
    }
  }
}