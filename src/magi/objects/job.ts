export default class Job {
  type: string;
  action: Function;
  title: string;
  subtitle: string;

  // For UI purposes only
  status = "";
  progress = 0;
  
  // Used for actual logic
  isFailed = false;
  isRunning = false;
  isComplete = false;

  constructor(title: string, subtitle: string, type: string, action: Function) {
    this.type = type;
    this.action = action;
    this.title = title;
    this.subtitle = subtitle;
  }

  async start() {
    try {
      this.isRunning = true;
      await this.action();

      this.status = `Complete`;
      this.progress = 100;

      this.isComplete = true;
      this.isFailed = false;
      this.isRunning = false;
    } catch(err) {
      this.isComplete = false;
      this.isFailed = true;
      this.isRunning = false;

      this.status = `Critical - ${err.message}`
      this.progress = 0;
    }
  }
}