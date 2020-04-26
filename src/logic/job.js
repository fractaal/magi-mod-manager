module.exports = class {
  constructor(options) {
    if (!options.name || !options.action) {
      console.error("Job cannot have an empty name/action");
      return false;
    } else {
      this.name = options.name;
      this.action = options.action;
      this.started = false;
      this.errored = false;
    }
  }
  
  start(payload, onFinish, onError) {
    this.started = true;
    this.action(payload, onFinish, onError);
  }
}