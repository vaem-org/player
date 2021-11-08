<template>
  <div
    class="control-bar"
    @mouseleave.self="showVolume=false"
  >
    <button
      v-if="!waiting"
      @click="$emit('play')"
    >
      <svg-icon
        type="mdi"
        :size="iconSize"
        :path="paused ? mdiPlay : mdiPause"
      />
    </button>
    <control-loader
      v-else
      :size="iconSize"
      :width="4"
    />
    <button
      v-if="showAudioControls"
      @click="$emit('toggle-mute')"
      @mouseover="showVolume=true"
    >
      <svg-icon
        type="mdi"
        :size="iconSize"
        :path="volumeIcon"
      />
    </button>
    <transition name="scale-x">
      <control-slider
        v-if="showVolume"
        :value="muted ? 0 : volume"
        :max="1"
        immediate
        class="volume"
        @input="$emit('volume', $event)"
      />
    </transition>
    <span>
      {{ currentTime | format(duration>=3600) }}/{{ duration | format }}
    </span>
    <div class="spacer" />
    <button
      v-if="textTracks.length > 0"
      class=""
      @click="showTextTrackSelector=!showTextTrackSelector"
    >
      <svg-icon
        type="mdi"
        :size="iconSize"
        :path="mdiSubtitles"
      />
    </button>
    <button
      v-if="showCastButton"
      class="menu"
      @click="$emit('cast')"
    >
      <svg-icon
        type="mdi"
        :size="iconSize"
        :path="castConnected ? mdiCastConnected : mdiCast"
      />
      <transition name="fade">
        <control-text-track-selefector
          v-if="showTextTrackSelector"
          :value="activeTextTrack"
          :text-tracks="textTracks"
        />
      </transition>
    </button>
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
  mdiVolumeLow,
  mdiVolumeMedium,
  mdiVolumeHigh,
  mdiVolumeOff,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiCast,
  mdiCastConnected,
  mdiSubtitles
} from '@mdi/js';
import ControlSlider from '@/components/Control/Slider';
import Common from '@/mixins/Common';
import ControlLoader from '@/components/Control/Loader';
import ControlTextTrackSelefector from '@/components/Control/TextTrackSelefector';

export default {
  name: 'ControlBar',
  components: { ControlTextTrackSelefector, ControlLoader, ControlSlider },
  mixins: [Common],
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
    },
    showCastButton: {
      type: Boolean,
      default: false
    },
    castConnected: {
      type: Boolean,
      required: true
    },
    waiting: {
      type: Boolean,
      required: true
    },
    showAudioControls: {
      type: Boolean,
      default: true
    },
    textTracks: {
      type: Array,
      default: () => []
    },
    activeTextTrack: {
      type: Object,
      default: () => null
    }
  },
  data: () => ({
    mdiPlay,
    mdiPause,
    mdiFullscreen,
    mdiFullscreenExit,
    mdiCast,
    mdiCastConnected,
    mdiSubtitles,

    iconSize: 32,
    showVolume: false,
    showTextTrackSelector: false
  }),
  computed: {
    volumeIcon() {
      if (this.volume === 0 || this.muted) {
        return mdiVolumeOff
      } else if (this.volume < 0.25) {
        return mdiVolumeLow
      } else if (this.volume > 0.75) {
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

.volume {
  width: 40px;
}

.menu {
  position: relative;
}
</style>
