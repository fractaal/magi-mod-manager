<template>
  <div class="jobViewColor">
    <h2>Download Queue</h2>
    <p>Maximum active jobs: {{maxActiveJobs}}</p>
    <p>Currently active jobs: {{activeJobs}}</p>
    <p>Job queue index: {{jobQueueIndex}}</p>
    <div style="display: flex; flex-direction: column; overflow-y: auto; max-height: calc(100vh - 175px); overflow-x: hidden;">
      <ul>
        <transition-group name="list" tag="div">
          <JobCard v-for="job in jobQueue" :key="job.key" :job="job" class="list-item no-style-type" style="flex-grow: 1;"></JobCard>
        </transition-group>
      </ul>
    </div>
  </div>
</template>

<script>
import JobCard from '@/components/JobCard'
export default {
  name: "JobQueue",
  props: {
    jobQueue: Array,
    maxActiveJobs: Number,
    activeJobs: Number,
    jobQueueIndex: Number,
  },
  components: {
    JobCard,
  }
}
</script>

<style scoped>
.jobViewColor {
  resize: horizontal;
}
</style>