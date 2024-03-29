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
  <div
    class="control-slider"
    :class="{ minimal }"
    @pointerdown.self.prevent="onpointerdown"
    @pointerup="onpointerup"
    @pointermove="onpointermove"
    @mouseleave="$emit('mouseleave')"
  >
    <div class="bar">
      <div
        v-for="({ start, end }, i) of ranges"
        :key="i"
        class="range"
        :style="{ left: getX(start) + '%', width: getX(end) - getX(start) + '%' }"
      />
      <div
        class="progress"
        :style="{ width }"
      />
    </div>
    <div
      class="scrubber"
      :style="{ left: width }"
    />
  </div>
</template>

<script>
export default {
  name: 'ControlSlider',
  props: {
    max: {
      type: Number,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    minimal: {
      type: Boolean,
      default: false
    },
    immediate: {
      type: Boolean,
      default: false
    },
    ranges: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    pointerX: null,
    pointerdown: false
  }),
  computed: {
    width() {
      return (this.pointerdown ? this.pointerValue : this.value) / this.max * 100 + '%';
    },
    pointerValue() {
      return Math.min(
        Math.max(this.pointerX / this.$el.clientWidth * this.max, 0),
        this.max
      );
    }
  },
  methods: {
    getX(value) {
      return value / this.max * 100;
    },
    onpointerdown({ offsetX, pointerId }) {
      this.pointerdown = true;
      this.pointerX = offsetX;
      this.$el.setPointerCapture(pointerId);
    },
    onpointerup({ pointerId }) {
      if (!this.pointerdown) {
        return;
      }

      this.$emit('input', this.pointerValue);
      this.pointerX = null;
      this.pointerdown = false;
      this.$el.releasePointerCapture(pointerId);
    },
    onpointermove({ offsetX }) {
      this.pointerX = offsetX;
      if (this.immediate && this.pointerdown) {
        this.$emit('input', this.pointerValue);
      }
      this.$emit('hover', this.pointerValue);
    }
  }
}
</script>

<!--suppress CssUnresolvedCustomProperty -->
<style scoped>
.control-slider {
  height: 10px;
  position: relative;
  cursor: pointer;
}

.bar {
  background: rgba(255, 255, 255, 0.2);
  height: 5px;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translate(0, -50%);
  pointer-events: none;
}

.range {
  top: 0;
  height: 100%;
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
}

.progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--primary-color);
  z-index: 1;
}

.scrubber {
  position: absolute;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  top: 50%;
  transform: translate(-50%, -50%);
  background:  var(--primary-color);
  pointer-events: none;
}

.minimal .bar {
  height: 3px;
  transition: height 0.2s;
}

.minimal:hover .bar {
  height: 5px;
}

.minimal .scrubber {
  width: 0;
  height: 0;
  transition: width 0.2s, height 0.2s;
}

.minimal:hover .scrubber {
  width: 10px;
  height: 10px;
}
</style>
