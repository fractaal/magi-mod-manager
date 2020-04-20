<template>
  <div class="jobViewColor">
    <h2>Job Queue</h2>
    <div style="display: grid; grid-template-columns: 1fr; overflow-y: auto; max-height: 87vh;">
      <JobCard v-for="job in jobQueue" :key="job.key" :job="job"></JobCard>
    </div>
  </div>
</template>

<script>
export default {
  name: "JobQueue",
  props: ['jobQueue'],
  components: {
    JobCard: () => import('@/components/JobCard.vue')
  }
}
</script>