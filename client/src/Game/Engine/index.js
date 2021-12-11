/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
// Engin makes shure that its render method is called every step in time
class Engine {
  constructor(step, statusUpdate) {
    this.step = step,
    this.statusUpdate = statusUpdate,
    this.render = () => {};
    this.timeSinceRender = 0;
    this.frame = null,
    this.engineTime = null,

    this.initEngine = this.initEngine.bind(this);
    this.haltEngine = this.haltEngine.bind(this);
    this.run = this.run.bind(this);
  }

  initEngine(renderFn) {
    this.render = renderFn;
    this.timeSinceRender = this.step;
    this.engineTime = window.performance.now();
    this.frame = window.requestAnimationFrame(this.run);
  }

  haltEngine() {
    window.cancelAnimationFrame(this.frame);
  }

  run(rightNow) {
    this.frame = window.requestAnimationFrame(this.run);

    const deltaTime = rightNow - this.engineTime;
    this.timeSinceRender += deltaTime;
    this.engineTime = rightNow;

    if (this.timeSinceRender >= this.step) {
      this.statusUpdate?.('FPS', (1 / (this.timeSinceRender / 1000)).toFixed(2)); // Calculate FPS
      this.render();
      this.timeSinceRender = 0;
    }
  }
}

export default Engine;
