<template>
  <div class="covid-sim" id="app">
    <h1 v-if="!isProduction" class="center">COVID-19 Simulator</h1>
    <div class="flex flex-column">
      <div ref="covidsim" class="covid-sim-controls" />
      <canvas
        id="canvas-container"
        ref="canvasContainer"
        width="1600"
        height="960"
        style="width: 800px; height: 480px"/>
      <hr />
      <canvas
        id="canvas-container-graph"
        ref="canvasContainerGraph"
        width="1600"
        height="200"
        style="width: 800px; height: 100px"/>
    </div>
    <div class="flex flex-buttons">
      <span class="total"># Total: {{info.numTotal}}</span>
      <span class="healed"># Healed: {{info.numHealed}}</span>
      <span class="infected"># Infected: {{info.numInfected}}</span>
    </div>
    <!-- <pre>{{info}}</pre> -->
  </div>
</template>

<script>
import Simulation from '../simulator/simulation'
import GUI from '../simulator/gui'

export default {
  components: {
  },
  data() {
    return {
      info: {},
    }
  },
  mounted() {
    this.sim = new Simulation({
      world: this.$refs.canvasContainer,
      graph: this.$refs.canvasContainerGraph
    });

    this.gui = new GUI( this.sim );
    this.gui.attach( this.$refs.covidsim );

    this.sim.loop();
    this.info = this.sim.state;
  },
  beforeDestroy() {
    if ( this.sim ) {
      this.sim.destroy();
    }
  },
  computed: {
    isProduction() {
      return process.env.NODE_ENV === 'production';
    }
  }
}
</script>

<style>
@import "../node_modules/dat.gui/build/dat.gui.css";
@import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

body {
  margin: 0;
}

#app {
  font-family: 'Roboto', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.center {
  text-align: center;
}

.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-buttons {
  align-content: space-between;
  justify-content: space-between;
  width: 600px;
  margin: 1rem auto;
}

.covid-sim {
  max-width: calc(800px + 2rem);
  margin: 0 auto;
  position: relative;
}

canvas#canvas-container,
canvas#canvas-container-graph {
  border: 2px solid black;
}

.total, .healed, .infected {
  color: white;
  font-weight: bold;
  font-family: monospace;
  margin: 0;
  padding: 1rem;
  display: block;
}

.total { background-color: lightgreen;}
.infected { background-color: red;}
.healed { background-color: blue;}

.covid-sim-controls {
  position: absolute;
  right: -250px;
  height: 20px;
  margin-right: 1rem;
}
</style>
