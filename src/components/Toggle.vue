<template>
  <label class="switch">
      <label :for="label">{{label}}</label>
      <input type="checkbox" v-model="checked" @change="onChange" :id="label">
      <span></span>
  </label>
</template>

<script>
  export default {
    name: "Toggle",
    props: {
      initialValue: Boolean,
      label: String,
      mkey: String,
    },

    data() {
      return {
        checked: this.initialValue
      }
    },

    methods: {
      onChange() {
        this.$parent.$emit("change", this.checked, this.label, this.mkey);
      }
    }
  }
</script>

<style scoped>
.switch {
  cursor: pointer;
  display: flex;
}
.switch input {
  display: none;
}
.switch input + span {
  margin-left: 20px;
  width: 48px;
  height: 28px;
  border-radius: 14px;
  -webkit-transition: all .3s ease;
  transition: all .3s ease;
  display: block;
  position: relative;
  background: #FF4651;
}
.switch input + span:before, .switch input + span:after {
  content: '';
  display: block;
  position: absolute;
  -webkit-transition: all .3s ease;
  transition: all .3s ease;
}
.switch input + span:before {
  top: 5px;
  left: 5px;
  width: 18px;
  height: 18px;
  border-radius: 9px;
  border: 5px solid #fff;
}
.switch input + span:after {
  top: 5px;
  left: 32px;
  width: 6px;
  height: 18px;
  border-radius: 40%;
  -webkit-transform-origin: 50% 50%;
          transform-origin: 50% 50%;
  background: #fff;
  opacity: 0;
}
.switch input + span:active {
  -webkit-transform: scale(0.92);
          transform: scale(0.92);
}
.switch input:checked + span {
  background: #48EA8B;
}
.switch input:checked + span:before {
  width: 0px;
  border-radius: 3px;
  margin-left: 27px;
  border-width: 3px;
  background: #fff;
}
.switch input:checked + span:after {
  -webkit-animation: blobChecked .35s linear forwards .2s;
          animation: blobChecked .35s linear forwards .2s;
}
.switch input:not(:checked) + span:before {
  -webkit-animation: blob .85s linear forwards .2s;
          animation: blob .85s linear forwards .2s;
}

@-webkit-keyframes blob {
  0%, 100% {
    -webkit-transform: scale(1);
            transform: scale(1);
  }
  30% {
    -webkit-transform: scale(1.12, 0.94);
            transform: scale(1.12, 0.94);
  }
  60% {
    -webkit-transform: scale(0.96, 1.06);
            transform: scale(0.96, 1.06);
  }
}

@keyframes blob {
  0%, 100% {
    -webkit-transform: scale(1);
            transform: scale(1);
  }
  30% {
    -webkit-transform: scale(1.12, 0.94);
            transform: scale(1.12, 0.94);
  }
  60% {
    -webkit-transform: scale(0.96, 1.06);
            transform: scale(0.96, 1.06);
  }
}
@-webkit-keyframes blobChecked {
  0% {
    opacity: 1;
    -webkit-transform: scaleX(1);
            transform: scaleX(1);
  }
  30% {
    -webkit-transform: scaleX(1.44);
            transform: scaleX(1.44);
  }
  70% {
    -webkit-transform: scaleX(1.18);
            transform: scaleX(1.18);
  }
  50%,
    99% {
    -webkit-transform: scaleX(1);
            transform: scaleX(1);
    opacity: 1;
  }
  100% {
    -webkit-transform: scaleX(1);
            transform: scaleX(1);
    opacity: 0;
  }
}
@keyframes blobChecked {
  0% {
    opacity: 1;
    -webkit-transform: scaleX(1);
            transform: scaleX(1);
  }
  30% {
    -webkit-transform: scaleX(1.44);
            transform: scaleX(1.44);
  }
  70% {
    -webkit-transform: scaleX(1.18);
            transform: scaleX(1.18);
  }
  50%,
    99% {
    -webkit-transform: scaleX(1);
            transform: scaleX(1);
    opacity: 1;
  }
  100% {
    -webkit-transform: scaleX(1);
            transform: scaleX(1);
    opacity: 0;
  }
}
html {
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: border-box;
}
*:before, *:after {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  font-family: Roboto, Arial;
  color: #ADAFB6;
  display: -webkit-box;
  display: flex;
  -webkit-box-pack: center;
          justify-content: center;
  -webkit-box-align: center;
          align-items: center;
  background: #F5F9FF;
}
body .dribbble {
  position: fixed;
  display: block;
  right: 20px;
  bottom: 20px;
}
body .dribbble img {
  display: block;
  height: 28px;
}

</style>