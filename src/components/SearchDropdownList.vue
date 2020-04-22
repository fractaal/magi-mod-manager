<template>
  <div>
    <label style="font-size: 14px; margin-right: 10px;" :for="label">{{label}}</label>
    <select @change="update" v-model="selectedChoice" :id="label" :selected="selectedChoice">
      <option v-if="type == 'mc_version'" value="activeProfileVersion">Active profile version</option>
      <option v-if="type == 'category'" value="">None</option>
      <option v-for="item in displayList" :key="item">{{item}}</option>
    </select>
  </div>
</template>

<script>
  export default {
    name: "SearchDropdownList",
    props: {
      list: [Object, Array],
      type: String,
      activeProfileVersion: String,
      selected: String,
      label: String,
    },

    data() {
      return {
        displayList: [],
        selectedChoice: this.selected,
      }
    },

    methods: {
      update() {
        this.$eventHub.$emit('updateSearchFilters', {
          [this.type]: this.selectedChoice
        })
      }
    },

    created() {
      console.log(this.selected)
      if (this.type == "mc_version") {
        for (let version in this.list.versions) {
          if (this.list.versions[version].type === "release") {
            this.displayList.push(this.list.versions[version].id)
          }
        }
      } else {
        for (let item in this.list) {
          this.displayList.push(this.list[item])
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
  background-color: rgba(0,0,0,1);
}
</style>