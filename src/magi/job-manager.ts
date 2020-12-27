import Magi from ".";
import Job from "./objects/job";

export default class JobManager {
  activeJobs = 0;
  maxActiveJobs = 5;

  jobs: Job[] = [];

  /**
   * @description Creates new job manager.
   * @param updateRate ms in which JobManager performs a management pass on the queue.
   */
  constructor(magi: Magi, updateRate?: number) {
    setInterval(() => {
      this.activeJobs = this.jobs.reduce((acc, val) => val.isRunning ? ++acc : acc, 0);
      this.jobs = this.jobs.filter(job => (!job.isComplete));

      if (this.activeJobs < this.maxActiveJobs) {
        const room = this.maxActiveJobs - this.activeJobs;
        const available = this.jobs.filter(job => !job.isRunning && !job.isFailed && !job.isComplete);
        
        for (let i = 0; i < room; i++) {
          if (available[i]) {
            available[i].start(magi);
          }
        }
      }

    }, updateRate || 1000);
  }

  addJob(job: Job) {
    this.jobs.push(job);
  }
}