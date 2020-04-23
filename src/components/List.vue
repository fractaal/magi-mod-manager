<template>
  <div>
    <span @click="itemClicked(item)" v-for="item in list" :key="item" >
      {{item}}
    </span>
  </div>
</template>

<script>
  export default {
    name: "List",
    props: {
      list: Array
    },
    methods: {
      itemClicked(name) {
        this.$parent.$emit('itemClicked', name)
      }
    }
  }
</script>

<style scoped>
  span {
    cursor: pointer;
    width: 25em;
    padding: 20px;
    display:flex; 
    background-color: rgba(255,255,255,0.1);
    border-radius: 10px;
    margin: 10px;
  }

  span:hover {
    background-color: rgba(255,255,255,0.2);
  }

</style>