import Vue from 'vue'
// import * as math from 'mathjs'
import config from './config'
import Agent from './agent'
import Environment from './environment'
import StackedAreaPlot from './areaplot'
import Box from './box'

function getRequestAnimationFrame() {
  return window.requestAnimationFrame
}

export default class Simulation {
  constructor({ world, graph }) {
    this.state = Vue.observable({ // TODO: Move to config
      time: 0,
      playing: true,
      enable_debug: false,
      infection_radius: config.INFECTION_RADIUS,
      healing_time: config.HEALING_TIME,
      numTotal: 0,
      numInfected: 0,
      numHealed: 0,
      number_agents: 50,
      number_quarantined: 0,
      enable_boxes: false,
    });

    var vm = new Vue({})

    vm.$watch(() => this.state.number_agents, (value) => {
      this.init( value );
    })

    vm.$watch(() => this.state.number_quarantined, (value) => {
      this.environment.setCurfewCount(value);
    })

    vm.$watch(() => this.state.enable_boxes, (value) => {
      this.setAddBox(value);
    })

    // computed: numDiff

    this._worldCanvas = world;
    this._graphCanvas = graph;
    this._worldCtx    = world ? world.getContext('2d') : null;
    this._graphCtx    = graph ? graph.getContext('2d') : null;

    if ( graph ) {
      this._graphCtx.imageSmoothingEnabled = true;
      this._areaPlot = new StackedAreaPlot( this._graphCanvas, this.state );
    }

    if ( world ) {
      this._worldCtx.imageSmoothingEnabled = true;
      this._worldCtx.scale(2, 2);
      this._worldCtx.translate(0.5, 0.5);
    }

    this._animationId = null;

    this.reset();
    // this.run(); // TODO: MOVE
  }

  /**
   * Play the animation loop. Doesn't affect whether in equilibrium or not.
   */
  play() {
    this.state.playing = true;
    return this;
  }


  /**
   * Pause the animation loop. Doesn't affect whether in equilibrium or not.
   */
  pause() {
    this.state.playing = false;
    return this;
  }

  /**
   * Toggle between playing and pausing the simulation.
   */
  toggle() {
    this.state.playing ? this.pause() : this.play();
    return this;
  }

  /**
   * Animation loop
   */
  loop() {
    const microtask = false;
    const loopFn = () => {
      if ( microtask ) {
        // this._animationId = Promise.resolve().then(() => loopFn());
        this._animationId = setTimeout(loopFn, 0)
      } else {
        this._animationId = getRequestAnimationFrame()(loopFn);
      }

      if (this.state.playing) {
        this.step();
      }
      if ( !microtask ) {
        this.render();
      }
    }
    loopFn();
  }

  /**
   *
   */
  reset() {
    this.agents = [];
    this.boxes = [];
    this.environment = {};
    // this.snapshots = [];
    if ( this._areaPlot ) {
      this._areaPlot.resetStats()
    }
    this.state.time = 0;
    // this.setAddBox(true);
    this.init();
  }

  /*
  *
  */
  init( num_target = null ) {

    let old_len = this.agents.length;
    let new_len = num_target || this.state.number_agents;
    if ( new_len > old_len ) {
      for ( let i = old_len; i < new_len; i++ ) {
        this.agents[i] = new Agent(i)
      }
    }
    if ( new_len < old_len ) {
      for (let i = new_len; i < old_len; i++) {
        delete this.agents[i];
      }
    }

    this.environment = new Environment(this.agents, this.boxes, this.state);
    this.environment.setCurfewCount( this.state.number_quarantined )

    this.agents.forEach(agent => agent.environment = this.environment)

    this.step()
    if ( this._worldCanvas ) {
      this.render()
    }
  }

  /*
  *
  */
  step() {
    this.state.time += 1;
    this.environment.updateDistanceMatrix();
    this.agents.forEach(agent => agent.step(this.state.time))
    let summary = this.environment.getSummary();
    this.state.numTotal    = summary.total;
    this.state.numInfected = summary.infected;
    this.state.numHealed   = summary.healed;
    // this.snapshots.push({...summary});
    if ( this._areaPlot ) {
      this._areaPlot.updateStats(summary)
    }
    return summary;
  }

  render( clear = true ) {
    if ( clear ) {
      this._worldCtx.clearRect(0, 0, this._worldCanvas.width, this._worldCanvas.height);
    }
    this.agents.forEach(agent => agent.render(this._worldCtx))
    this.boxes.forEach(box => box.render( this._worldCtx ))
  }

  destroy() {
    this.pause();
    this.reset();
    window.cancelAnimationFrame(this._animationId);
    this._animationId = null;
  }

  /*
  *
  */
  setAddBox(value) {
    if (value) {
      this.boxes.push(new Box(400 - 15, 0, 30, 200));
      this.boxes.push(new Box(400 - 15, 480 - 200, 30, 200));
      this.boxes.push(new Box(200 - 100, 50, 200, 200));

      // Check if agents are trapped inside boxes
      this.agents.forEach(agent => {
        this.boxes.forEach(box => {
          if ( box.checkCollision( agent.pos, 5 ) ) {
            if ( agent.pos.x > box.pos.x + box.width/2 ) {
              agent.pos.x = box.pos.x + box.width + 1;
              agent.target.x = agent.pos.x + 15;
            } else {
              agent.pos.x = box.pos.x - 1;
              agent.target.x = agent.pos.x - 15;
            }
            agent.target.y = agent.pos.y;
          }
        })
      })
    } else {
      while ( this.boxes.length ) {
        this.boxes.pop();
      }
    }
  }

  /**
   *
   */
  runSim() {
    // TODO: Worker
    const MAX_STEPS = 800;
    let steps = 0;
    this.reset()
    while (steps < MAX_STEPS) {
      this.step();
      steps++;
    }
    if ( this._worldCanvas ) {
      this.render();
    }
  }


  /* run(steps = Infinity) {
    this.stop();
    this.status = true;
    let n = 1;
    this.interval = setInterval(() => {
    this.step(); // HACK
      this.animationId = window.requestAnimationFrame(this.render);
      n += 1;
      if ( steps && n > steps ) {
    this.stop();
      }
    }, 25);
  } */
}
