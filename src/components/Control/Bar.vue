<template>
  <div class="control-bar">
    <button
      @click="$emit('play')"
    >
      <svg-icon
        type="mdi"
        :size="iconSize"
        :path="paused ? mdiPlay : mdiPause"
      />
    </button>
    <button
      @click="$emit('toggle-mute')"
    >
      <svg-icon
        type="mdi"
        :size="iconSize"
        :path="volumeIcon"
      />
    </button>
    <span>
      {{ currentTime | format }}/{{ duration | format }}
    </span>
    <div class="spacer" />
    <button
      @click="$emit('fullscreen')"
    >
      <svg-icon
        type="mdi"
        :size="iconSize"
        :path="fullscreen ? mdiFullscreenExit : mdiFullscreen"
      />
    </button>
  </div>
</template>

<script>
import {
  mdiPlay,
  mdiPause,
  mdiVolumeMedium,
  mdiVolumeHigh,
  mdiVolumeOff,
  mdiFullscreen,
  mdiFullscreenExit
} from '@mdi/js';

export default {
  name: 'ControlBar',
  filters: {
    format(value) {
      return [
        Math.floor(value/60),
        Math.floor(value%60).toString().padStart(2, '0')
      ].join(':')
    }
  },
  props: {
    paused: {
      type: Boolean,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    volume: {
      type: Number,
      required: true
    },
    muted: {
      type: Boolean,
      required: true
    },
    fullscreen: {
      type: Boolean,
      required: true
    }
  },
  data: () => ({
    mdiPlay,
    mdiPause,
    mdiFullscreen,
    mdiFullscreenExit,

    iconSize: 32
  }),
  computed: {
    volumeIcon() {
      if (this.volume === 0 || this.muted) {
        return mdiVolumeOff
      } else if (this.volume === 1) {
        return mdiVolumeHigh
      } else {
        return mdiVolumeMedium
      }
    }
  }
}
</script>

<style scoped>
.control-bar {
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  display: flex;
  color: white;
  align-items: center;
  gap: 10px;
}

.control-bar svg {
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
}

.control-bar button {
  transition: opacity 0.2s;
}

.control-bar button:hover {
  opacity: 0.8;
}

.spacer {
  flex-grow: 1;
}
</style>
