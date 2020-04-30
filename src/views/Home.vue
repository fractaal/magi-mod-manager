<template>
  <div>
    <div style="display: flex;">
      <h1>Your Mods</h1>
      <TextBox :onSubmit="onSearchSubmt" placeholder="Search in your mods..."/>
    </div>
    <span v-if="mods.length < 1" class="centered">
      <h1>{{titles[randomOne]}}</h1>
      <h3>{{subtitles[randomTwo]}}</h3>
    </span>
    <br>
    <div style="min-height: calc(100vh - 220px); max-height: calc(100vh - 220px); overflow-y: auto; display: flex; flex-direction: column;">
      <transition-group name="list" tag="div">
        <HomeCard v-for="mod in filteredMods" :key="mod.id" :mod="mod"></HomeCard>
      </transition-group>
    </div>
  </div>
</template>

<script>
import HomeCard from '../components/HomeCard'
import TextBox from '../components/TextBox'
//import WelcomeCard from '../components/WelcomeCard'

export default {
  name: 'Home',
  props: {
      mods: Array,
      appVersion: String,
      changeLogs: Array,
      },
  components: {
    HomeCard,
    TextBox,
    //WelcomeCard,
  },
  created() {
    this.$on('change', (input) => {
      console.log(input)
      this.filter = input;
    })
    this.$on('input', (input) => {
      console.log(input)
      this.filter = input;
    })
  },
  data() {
    return {
      countDown: 1000,
      filter: '',
      titles: [
        'Ayyy lmao', 
        'What\'s up, doc?', 
        'Care for a trip in the TARDIS?', 
        'Hello, Pond.', 
        'MUDAMUDAMUDAMUDA!',
        'Hi!',
        'What\'s up?',
        'I\'m running out of greetings.'
        ],
      subtitles: [
        'Search for some mods... or don\'t. It\'s a free world.', 
        'You can select your profiles with the cog or make new ones!', 
        'I made this at exactly 2:03pm.',
        'Click the Magi logo for a special surprise!',
        'The search button (not the bar) shows you the most downloaded mods of your current version!',
        'Use refined search if you have something specific you want to look for!',
        ]
    }
  },
  methods: {
    onSearchSubmt(input) {
      this.filter = input;
    },
    getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    sleep(milliseconds) {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    },
  },
  computed: {
    filteredMods() {
      let mods = [];
      this.mods.map((mod) => {
        let alreadyPushed = false;
        if ((mod.name.toLowerCase()).search(this.filter.toLowerCase()) !== -1) {
          mods.push(mod);
          alreadyPushed = true;
        }
        try {
          if (((mod.blurb.toLowerCase()).search(this.filter.toLowerCase()) !== -1) && !alreadyPushed) {
            mods.push(mod);
          }
        } catch(error) {console.warn("Error while trying to get blurb ", error)}
      })
      return mods;
    },
    randomOne() {
      return this.getRandomInt(0, this.titles.length - 1)
    },
    randomTwo() {
      return this.getRandomInt(0, this.subtitles.length - 1)
    },
  }
}
</script>
