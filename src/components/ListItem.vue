<template>
  <div class="list-item" :class="enabled ? '' : 'disabled'">
    <img :src="image" class="mod-logo">
    <div style="width: 100%;">
      <h2>{{title}}</h2>
      <p>{{content}}</p>
    </div>
    <div class="row">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "ListItem",
  props: ['title', 'content', 'image', 'enabled'],
};
</script>

<style lang="scss" scoped></style>