import Worker from 'worker-loader!./worker/index.js';

const worker = new Worker();

worker.onmessage = function (event) {
  console.log("MAIN onmessage", event.data)
};

export function runWorker() {

  // worker.addEventListener("message", (event) => {
  //   console.log("onmessage", event.data)
  // });

  // TODO: Set config

  worker.postMessage({ cmd: "run" });
}