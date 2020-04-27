<template>
  <div>
    <h1>Your Mods</h1>
    <span v-if="mods.length < 1" class="centered">
      <h1>{{titles[randomOne]}}</h1>
      <h3>{{subtitles[randomTwo]}}</h3>
    </span>
    <div style="max-height: calc(100vh - 190px); overflow-y: auto; display: flex; flex-direction: column;">
      <transition-group name="list" tag="div">
        <HomeCard v-for="mod in mods" :key="mod.id" :mod="mod"></HomeCard>
      </transition-group>
    </div>
  </div>
</template>

<script>
import HomeCard from '../components/HomeCard'
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
    //WelcomeCard,
  },
  data() {
    return {
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
    getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  },
  computed: {
    randomOne() {
      return this.getRandomInt(0, this.titles.length - 1)
    },
    randomTwo() {
      return this.getRandomInt(0, this.subtitles.length - 1)
    },
  }
}
</script>
