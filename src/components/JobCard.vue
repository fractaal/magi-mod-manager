<template>
  <li>
  <div class="jobCard" style="position: relative;" :class="[(job.operation == 'Complete' && job.progress == 1) ? 'success' : ''] + [(job.operation == 'Failed' && job.progress == 1) ? 'failed' : '']">
    <transition name="fade">
      <i v-on:click="$eventHub.$emit('removeFromJobQueue', job.key)" v-if="job.progress == 1" class="fa fa-times-circle fa-lg" style="cursor: pointer; position:absolute; top: 12px; right: 12px;"></i>
    </transition>
    <h2>{{job.name}}</h2>
    <p>{{job.file_name}}</p>
    <div class="progress">
      <span :style="{width: job.progress * 100 + '%'}"></span>
    </div>
    <p>{{job.operation}} - {{Math.round(job.progress * 100) + '%'}} - {{job.auxiliary}}</p>
    <p>{{job.reason}}</p>
  </div>
  </li>
</template>

<script>
export default {
  name: "JobCard",
  props: ['job']
}
</script>