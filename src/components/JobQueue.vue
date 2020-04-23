<template>
  <div class="jobViewColor">
    <h2>Job Queue</h2>
    <div style="display: flex; flex-direction: column; overflow-y: auto; max-height: 87vh; overflow-x: hidden;">
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
  props: ['jobQueue'],
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