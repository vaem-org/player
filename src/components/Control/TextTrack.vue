<!--
  - VAEM - Asset manager
  - Copyright (C) 2021  Wouter van de Molengraft
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU General Public License for more details.
  -
  - You should have received a copy of the GNU General Public License
  - along with this program.  If not, see <https://www.gnu.org/licenses/>.
  -->

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
import vtt from 'videojs-vtt.js'

const { VTTCue, WebVTT } = vtt;

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
    },
    fontScale: {
      type: Number,
      default: 1
    }
  },
  data: () => ({
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
    },
    fontScale() {
      this.onResize();
    }
  },
  async mounted() {
    await this.load();
    this.observer = new ResizeObserver(this.onResize);
    this.observer.observe(this.$el);
    this.onResize();
  },
  destroyed() {
    this.observer?.unobserve?.(this.$el);
  },
  methods: {
    onResize() {
      this.fontSize = Math.max(16, Math.ceil(this.$el.clientWidth / 40 * this.fontScale)) + 'px'
    },
    updateCurrent() {
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

      this.cues = [];
      this.current = null;
      this.lastTime = 0;
      this.lastIndex = 0;

      const parser = new WebVTT.Parser(window,
        this.customCue ? { VTTCue } : {},
        new WebVTT.StringDecoder())
      const data = await fetch(this.src).then(response => response.text());
      parser.oncue = cue => this.cues.push(cue)

      setTimeout(() => {
        parser.parse(data)
        parser.flush()
        this.updateCurrent();
      });
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
