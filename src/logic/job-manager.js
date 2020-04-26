import Job from './job'

export default class {
  constructor() {
    this.jobQueue = []
    this.stop = true;

    setInterval(() => { // Job manager
      if (this.stop) return;
      
    }, 1000)
  }

  /**
   * @method JobManager.startJobQueue 
   * @description Stops the job queue
   *
   */
  startJobQueue() {
    this.stop = false;
  }

  /**
   * @method JobManager.stopJobQueue 
   * @description Stops the job queue
   *
   */
  stopJobQueue() {
    this.stop = true;
  }

  /**
   * @method JobManager.addJob 
   * @description Adds a job to the job manager's queue
   * @param {Job} job
   */
  addJob(job) {
    if (job instanceof Job) {
      this.jobQueue.push(job);
    } else {
      console.error("You can't add non-job objects to the Job Queue");
    }
  }
}