import Simulation from '../simulation'

// Respond to message from parent thread
self.addEventListener('message', (event) => {
  // console.log("WORKER onmessage", event.data)

  if ( event.data.cmd === 'run' ) {
    run()
  }

  if (event.data.cmd === 'stop') {
    stop()
  }
})

// Post data to parent thread
self.postMessage({ status: 'ready' })

let sim = null;

/*
*
*/
function run() {
  sim = new Simulation({
    world: null,
    graph: null,
  });

  sim.runSim()
  let summary = sim.environment.getSummary();

  self.postMessage( summary );
}
