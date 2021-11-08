<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    v-if="current"
    class="control-text-track"
    v-html="current.text"
  />
</template>

<script>
import { WebVTT, VTTCue } from 'videojs-vtt.js'

export default {
  name: 'ControlTextTrack',
  props: {
    src: {
      type: String,
      required: true
    },
    time: {
      type: Number,
      required: true
    },
    customCue: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    message: '',
    cues: [],
    current: null,
    lastTime: 0,
    lastIndex: 0
  }),
  watch: {
    src () {
      return this.load()
    },
    time () {
      this.updateCurrent()
    }
  },
  mounted () {
    this.load()
    this.updateCurrent()
  },
  methods: {
    updateCurrent () {
      const value = this.time
      if (this.lastTime > value) {
        this.lastTime = 0
        this.lastIndex = 0
      }

      let index = this.lastIndex
      let current = this.cues?.[index]
      while(
        index < this.cues.length-1 &&
        this.cues?.[index+1].startTime < value
        ) {
        index++;
        current = this.cues?.[index]
      }

      this.current = current && current.startTime <= value && value <= current.endTime ? current : null
      this.lastIndex = index
      this.lastTime = value
    },
    async load () {
      if (!this.src) {
        return
      }

      const parser = new WebVTT.Parser(window, this.customCue ? { VTTCue } : {}, new WebVTT.StringDecoder())
      const data = await fetch(this.src).then(response => response.text());
      parser.oncue = cue => this.cues.push(cue)

      setTimeout(() => {
        parser.parse(data)
        parser.flush()
      })
    }
  }
}
</script>

<style scoped>
.control-text-track {
  white-space: pre-line;
  background-color: transparent;
  text-shadow: 2px 2px rgba(48, 48, 48, 0.8) !important;
  color: white;
  padding: 0.5em;
  text-align: center;
}
</style>
