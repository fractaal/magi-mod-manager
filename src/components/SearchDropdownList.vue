<template>
  <div>
    <label style="font-size: 14px; margin-right: 10px;" :for="label">{{label}}</label>
    <select @change="update" v-model="selectedChoice" :id="label" :selected="selectedChoice">
      <option v-if="type == 'gameVersion' && purpose == 'search'" value="activeProfileVersion">Active profile version</option>
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
      purpose: String,
    },

    data() {
      return {
        displayList: [],
        selectedChoice: this.selected,
      }
    },

    methods: {
      update() {
        if (this.purpose == 'search') {
          this.$eventHub.$emit('updateSearchFilters', {
            [this.type]: this.selectedChoice
          })
        } else if (this.purpose == 'config') {
          this.$parent.$emit('change', {
            [this.type]: this.selectedChoice
          }, this.label)
        }
      }
    },

    created() {
      console.log(this.selected)
      if (this.type == "gameVersion") {
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
  cursor: pointer;
  padding: .75em;
  margin-left: 20px;
  border-radius: 10px;
  background-color: rgba(0,0,0,.1);
  border: 0px;
  font-size: 1em;
  outline: none;
  /*transition: 0.15s cubic-bezier(0.55, 0.085, 0.68, 0.53);*/
  color: #fff;
}

select option {
  font-size: 1.5em;
  background-color: rgba(0,0,0,1);
  padding: 10px;
}
</style>