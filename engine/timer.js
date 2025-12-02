export class Timer {
  constructor() {
    this.startTime = performance.now();
  }

  reset() {
    this.startTime = performance.now();
  }

  elapsedMillis() {
    return performance.now() - this.startTime;
  }
}