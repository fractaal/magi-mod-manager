<template>
  <div>
    <ul>
      <li v-for="changeLog in changeLogs" :key="changeLog">
        {{changeLog}}
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    props: {
      changeLogs: Array
    }
  }
</script>