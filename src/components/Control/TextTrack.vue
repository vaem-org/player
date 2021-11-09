<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    :style="{ fontSize }"
    class="control-text-track"
  >
    <div
      v-if="current"
      v-html="current.text"
    />
  </div>
</template>

<script>
import { VTTCue, WebVTT } from 'videojs-vtt.js'

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
    lastIndex: 0,
    fontSize: 24
  }),
  watch: {
    src() {
      return this.load()
    },
    time() {
      this.updateCurrent()
    }
  },
  async mounted() {
    await this.load()
    this.updateCurrent()
    this.observer = new ResizeObserver(this.onResize);
    this.observer.observe(this.$el);
    this.onResize();
  },
  destroyed() {
    this.observer?.unobserve?.(this.$el);
  },
  methods: {
    onResize() {
      this.fontSize = Math.max(16, Math.ceil(this.$el.clientWidth / 50)) + 'px'
    },
    updateCurrent() {
      this.current = {
        text: 'Rustig, Steve. We gaan.'
      };

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
    async load() {
      if (!this.src) {
        return
      }

      const parser = new WebVTT.Parser(window,
        this.customCue ? { VTTCue } : {},
        new WebVTT.StringDecoder())
      const data = await fetch(this.src).then(response => response.text());
      parser.oncue = cue => this.cues.push(cue)

      setTimeout(() => {
        parser.parse(data)
        parser.flush()
      });
      this.updateCurrent();
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
  padding: 1em;
  text-align: center;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>
