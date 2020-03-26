export default class StackedAreaPlot {

  constructor( canvas, state ) {
    this._canvas = canvas;
    this._ctx    = canvas.getContext('2d');
    this._state  = state;

    this._ctx.translate(0, this._canvas.height);
    this._ctx.scale(1, -1);
  }

  resetStats() {
    let ctx = this._ctx
    if (ctx) {
      ctx.clearRect(0, 0, this._canvas.width*2, this._canvas.height*2);
    }
  }

  updateStats(summary) {
    let ctx = this._ctx;
    if (ctx) {
      const diff = summary.total - summary.infected - summary.healed;
      const s = 200 / summary.total;
      ctx.fillStyle = 'red';
      const t = this._state.time % this._canvas.width;
      ctx.fillRect(t, 0, 1, s * summary.infected);
      ctx.fillStyle = 'blue';
      ctx.fillRect(t, s * summary.infected, 1, s * summary.healed);
      ctx.fillStyle = 'lightgreen';
      ctx.fillRect(t, s * (summary.infected + summary.healed), 1, s * diff);
      ctx.fillStyle = 'black';
      ctx.fillRect(t + 1, 0, 1, this._canvas.height)
    }
  }
}