import Vector from './lib/vector'
import * as math from 'mathjs'

export default class Environment {
  constructor(agents, boxes, params) {
    this.agents = agents;
    this.boxes = boxes;
    this.params = params;
    this.distanceMatrix = [];
    this.curfew_list = [];
  }

  distance(a1, a2) {
    return Vector.sub(a1.pos, a2.pos).length()
  }

  updateDistanceMatrix() {
    this.agents.forEach((a1, i1) => {
      this.agents.forEach((a2, i2) => {
        this.distanceMatrix[i1] = this.distanceMatrix[i1] || [];
        this.distanceMatrix[i1][i2] = this.distance(a1, a2);
      })
    })
  }

  setCurfewCount( num_target ) {
    this.curfew_list = []
    for (let i = 0; i < num_target; i++) {
      this.curfew_list[i] = i;
    }
    /*
    let old_len = this.curfew_list.length;
    let new_len = num_target;
    if (new_len > old_len) {
      for (let i = old_len; i < new_len; i++) {
        this.curfew_list[i] = math.randomInt(0, 150) // TODO
      }
    }
    if (new_len < old_len) {
      for (let i = new_len; i < old_len; i++) {
        delete this.curfew_list[i];
      }
    }
    */
  }

  getCurfewList() {
    return this.curfew_list;
  }

  getSummary() {
    let stats = {
      total: 0,
      infected: 0,
      healed: 0,
    }
    this.agents.forEach((agent, index) => {
      stats.total += 1;
      stats.infected += Number(agent.state.infected)
      stats.healed += Number(agent.state.healed)
    })
    return stats
  }
}