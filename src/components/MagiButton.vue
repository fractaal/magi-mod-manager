<template>
  <button class="round-button" @click="$emit('click')">
    <fai :icon="icon" :size="size"/>
  </button>
</template>

<script>
export default {
  name: "MagiButton",
  props: ['icon', 'size'],
};
</script>