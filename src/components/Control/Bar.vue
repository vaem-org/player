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
    class="control-bar"
    @mouseleave.self="showVolume=false"
  >
    <button
      v-if="!waiting"
      type="button"
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
      type="button"
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
      {{ currentTime | format }}/{{ duration | format }}
    </span>
    <div class="spacer" />
    <control-menu
      v-if="textTracks.length > 0"
      :items="textTrackItems"
      :value="activeTextTrack"
      @input="$emit('select-text-track', $event)"
    >
      <template #activator="{ on }">
        <button
          :class="{ inactive: activeTextTrack === null }"
          type="button"
          v-on="on"
        >
          <svg-icon
            type="mdi"
            :size="iconSize"
            :path="mdiSubtitles"
          />
        </button>
      </template>
    </control-menu>
    <button
      v-if="showCastButton"
      type="button"
      @click="$emit('cast')"
    >
      <svg-icon
        type="mdi"
        :size="iconSize"
        :path="castConnected ? mdiCastConnected : mdiCast"
      />
    </button>
    <button
      type="button"
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
import ControlSlider from './Slider';
import Common from '../../mixins/Common';
import ControlLoader from './Loader';
import ControlMenu from './Menu';

export default {
  name: 'ControlBar',
  components: { ControlMenu, ControlLoader, ControlSlider },
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
    },
    messages: {
      type: Object,
      required: true
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
    showVolume: false
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
    },
    textTrackItems() {
      if (this.textTracks.length === 0) {
        return [];
      }

      return [...this.textTracks.map(value => ({
        value,
        text: value.srclang.toUpperCase()
      })), {
        value: null,
        text: this.messages.off
      }];
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
  line-height: 0;
}

.control-bar button.inactive {
  color: grey;
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
