<template>
  <div>
    <label style="font-size: 14px; margin-right: 10px;" :for="label">{{label}}</label>
    <select v-model="selected" :id="label">
      <option value="activeProfileVersion">Active profile version</option>
      <option v-for="item in displayList" :key="item">{{item}}</option>
    </select>
  </div>
</template>

<script>
  export default {
    name: "DropdownList",
    props: {
      list: [Object, Array],
      type: String,
      activeProfileVersion: String,
      label: String,
    },

    data() {
      return {
        displayList: [],
        selected: null,
      }
    },

    methods: {
      update() {
        this.$eventHub.$emit('updateSearchFilters', {
          [this.type]: this.selected
        })
      }
    },

    watch: {
      selected: function() {
        this.update();
      }
    },

    created() {
      this.selected = 'activeProfileVersion'
      if (this.type == "mc_version") {
        for (let version in this.list.versions) {
          if (this.list.versions[version].type === "release") {
            this.displayList.push(this.list.versions[version].id)
          }
        }
      }
    }
  }
</script>

<style scoped>
select {
  outline: none;
  border-radius: 10px;
  padding: 10px;
  background-color: rgba(0,0,0,0);
  width: 15em;
  font-size: 14px;
}

select option {
  font-size: 1.5em;
  background-color: rgba(0,0,0,0);
}
</style>