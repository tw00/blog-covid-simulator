import * as dat from 'dat.gui';
import * as math from 'mathjs';
import config from './config'
import { runWorker } from './batch'

export default class GUI {
  constructor( sim, configuration ) {
    this.message = 'dat.gui';

    this.number_agents = 50;
    this.infection_radius = config.INFECTION_RADIUS;
    this.healing_time = config.HEALING_TIME;
    this.enable_debug = false;
    this.enable_boxes = false;
    this.number_quarantined = 0;

    this._sim = sim;
    this._config = config; // TODO
  }

  attach( domNode ) {
    var gui = new dat.GUI({ autoPlace: false });
    domNode.appendChild(gui.domElement);

    const enhance = (group) => {
      group.auto_add = (ctx, param, ...args) => {
        const controller = group.add(ctx, param, ...args)
        controller.onChange((value) => {
          this._sim.state[param] = value;
        })
        // or map to state directly?
        return controller;
      }
      return group;
    }

    const f1 = gui.addFolder('Control')
    const f2 = gui.addFolder('Simulation');
    const f3 = gui.addFolder('Agent');
    const f4 = gui.addFolder('Advanced');

    enhance(f1);
    enhance(f2);
    enhance(f3);

    f1.add(this, 'toggle').name('Pause');
    f1.add(this, 'reset').name('Reset');
    f1.add(this, 'step').name('Step');
    // f1.add(this, 'runSim10XSmooth');

    f2.auto_add(this, 'number_agents', 0, 200).step(1).name("# Agents");
    f2.auto_add(this, 'number_quarantined', 0, 250).step(1).name("# Quarantined");
    f2.auto_add(this, 'enable_debug').name("Enable Debug");
    f2.auto_add(this, 'enable_boxes').name("Lockdown");
    f2.add(this, 'infect').name("Infect Random");
    f2.add(this, 'resetImmunity').name("Reset Immunity");

    f3.auto_add(this, 'infection_radius', 0, 150).name("Infection Radius");
    f3.auto_add(this, 'healing_time', 0, 500).step(10).name("Healing Time");

    f4.add(this, 'runSim').name('Fast Simulation');
    f4.add(this, 'runWorker').name('Worker');

    f1.closed = false;
    f2.closed = false;
    f3.closed = false;

    // message.onFinishChange((value) => {});
    // window.gui = gui;
    this._gui = gui
  }

  toggle() {
    const controller = this._gui.__folders["Control"].__controllers[0];
    controller.name(this._sim.state.playing ? "Play" : "Pause" )
    this._sim.toggle();
  }

  infect() {
    for ( let i = 0; i < 1; i++ ) {
      let idx = math.randomInt(0, this._sim.agents.length)
      this._sim.agents[idx].state.healed = false;
      this._sim.agents[idx].state.healing = -100;
      this._sim.agents[idx].state.infected = true;
    }
  }

  resetImmunity() {
    this._sim.agents.forEach(agent => {
      agent.state.healed = false;
      agent.state.infected = false;
      agent.state.healing = -100;
    })
  }

  runSim() {
    this._sim.runSim();
  }

  runWorker() {
    runWorker();
  }

  play() {
    this._sim.play();
  }

  step() {
    this._sim.step();
    this._sim.render( false )
  }

  pause() {
    this._sim.pause();
  }

  reset() {
    this._sim.reset();
  }
}
