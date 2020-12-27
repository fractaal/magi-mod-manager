<template>
  <div class="job">
    <div class="upper-job">
      <h2>{{title}}</h2>
      <p>{{subtitle}}</p>
    </div>
    <div class="middle-job">
      <div class="progress-bar" :class="styling" :style="`width: ${progress}%`"></div>
    </div>
    <div class="lower-job">
      <p>{{progress}}% - {{status}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Job",
  data() {
    return {};
  },
  props: ['title', 'subtitle', 'status', 'progress', 'type', 'running', 'complete', 'failed'],
  computed: {
    styling: function() {
      if (this.failed) {
        return 'error';
      } else if (this.complete) {
        return 'complete';
      } else if (this.running) {
        return 'running';
      } else {
        return '';
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>