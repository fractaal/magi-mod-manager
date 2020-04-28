<template>
  <div class="jobViewColor">
    <h2>Download Queue</h2>
    <div style="display: flex;">
      <p style="margin-right: 2em;">Downloads queued: {{jobQueueLength}}</p>
      <p>Active downloads: {{activeJobs}}</p>
    </div>
    <div style="display: flex; flex-direction: column; overflow-y: auto; max-height: calc(100vh - 200px); overflow-x: hidden;">
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
  },
  computed: {
    jobQueueLength: function() {
      return this.jobQueue.length;
    }
  }
}
</script>

<style scoped>
.jobViewColor {
  resize: horizontal;
}
</style>