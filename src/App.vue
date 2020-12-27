<template>
  <div>
    <div class="top-bar">
      <div class="title-bar">
        <button class="window-button" @click="minimize">
          <fai icon="window-minimize" size="lg"/>
        </button>
        <button class="window-button" @click="maximize">
          <fai icon="window-maximize" size="lg"/>
        </button>
        <button class="window-button" @click="close">
          <fai icon="times" size="2x"/>
        </button>
      </div>
      <div class="top-bar-content">
        <img src="@/assets/logo.png" alt="" class="logo">
        <div style="margin-right: 50px;">
          <h2>{{shared.magi.profileManager.activeProfile.name}}</h2>
          <p>Minecraft {{shared.magi.profileManager.activeProfile.gameVersion}}</p>
          <p>{{profileString}}</p>

        </div>
        <magi-button icon="home" size="lg"/>
        <magi-button icon="search" size="lg"/>
      </div>
    </div>
    <modal name="main">{{modalText}}</modal>
    <div class="app">
      <div class="view">
        <router-view/>
      </div>
      <div class="sidebar">
        <h1>DOWNLOADS</h1>
        <transition-group name="list" mode="out-in">
          <job v-for="job in shared.magi.jobManager.jobs" :key="job.title"
            :progress="job.progress"
            :status="job.status"
            :title="job.title"
            :subtitle="job.subtitle"
            :type="job.type"
            :running="job.isRunning"
            :complete="job.isComplete"
            :failed="job.isFailed"
          />
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { remote } from 'electron';
import shared from './store';
const { BrowserWindow } = remote;

import Vue from 'vue';
import Job from './components/Job.vue';
import MagiButton from './components/MagiButton.vue';


export default Vue.extend({
  components: { Job, MagiButton },
  name: "App",
  data() {
    return {
      shared,
      modalText: "",
    }
  },
  created() {
    this.shared.magi.information = (msg: string) => {
      console.log(`[vue] showing modal (${msg})`)
      this.modalText = msg;
      this.$modal.show("main")
    };
  },
  computed: {
    profileString: function(): string {
      return `${this.shared.magi.profileManager.activeProfile.mods.length} active mods`;
    }
  },
  methods: {
    minimize() {
      BrowserWindow.getFocusedWindow()?.minimize();
    },
    maximize() {
      BrowserWindow.getFocusedWindow()?.maximize();
    },
    close() {
      BrowserWindow.getFocusedWindow()?.close();
    }
  }
})
</script>

<style>
@import "./assets/styles.css";
</style>
