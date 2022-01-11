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
    class="vaem-player"
    :style="style"
    @mousemove="setUserActivity"
    @mousedown="setUserActivity"
    @mouseleave="onmouseleave"
  >
    <component
      :is="tech"
      ref="video"
      :muted="isMuted"
      :src="tech!=='video' && src"
      :autoplay="autoplay2"
      :initial-time="initialTime"
      crossorigin="anonymous"
      :custom-data="castCustomData"
      :poster="poster"
      v-bind="$attrs"
      @muted="isMuted=$event"
      @playing="paused=false;error=false"
      @pause="paused=true"
      @durationchange="ondurationchange"
      @timeupdate="ontimeupdate"
      @ended="$emit('ended')"
      @volumechange="volume=$refs.video.volume"
      @webkitplaybacktargetavailabilitychanged="showCastButton=true"
      @webkitcurrentplaybacktargetiswirelesschanged="onAirplay"
      @waiting="waiting=true"
      @canplay="waiting=false"
      @progress="onprogress"
      @error="onerror"
      @click.self="play"
    />
    <div
      v-if="error"
      class="error-message"
    >
      {{ messages.error }}
    </div>
    <control-text-track
      v-if="activeTextTrack && tech==='video'"
      :src="activeTextTrack.src"
      :time="currentTime"
      :style="textTrackStyle"
    />
    <transition
      name="fade"
      @after-enter="controlsShown=true"
      @after-leave="controlsShown=false"
    >
      <div
        v-if="showControls"
        class="controls"
        @click.self="play"
      >
        <slot name="controls" />
        <div class="gradient" />
        <div class="bottom">
          <transition name="fade">
            <div
              v-if="seekInfo !== null"
              class="seek-info"
              :style="{ left: `${seekInfoLeft}px` }"
            >
              {{ seekInfo | format }}
            </div>
          </transition>
          <control-slider
            ref="seekSlider"
            v-model="currentTime"
            :max="duration"
            :ranges="bufferedRanges"
            minimal
            @input="seek($event)"
            @hover="seekInfo=$event"
            @mouseleave="seekInfo=null"
          />
          <control-bar
            :paused="paused"
            :current-time="currentTime"
            :duration="duration"
            :volume="volume"
            :muted="isMuted"
            :fullscreen="fullscreen"
            :cast-connected="castConnected"
            :show-cast-button="showCastButton"
            :waiting="waiting"
            :show-audio-controls="tech!=='video' || !castConnected"
            :text-tracks="textTracks"
            :active-text-track="activeTextTrack"
            :messages="messages"
            @fullscreen="toggleFullscreen"
            @play="play"
            @toggle-mute="toggleMute"
            @volume="setVolume"
            @cast="selectCastDevice"
            @select-text-track="onSelectTextTrack"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Hls from 'hls.js';
import ControlBar from './Control/Bar';
import ControlSlider from './Control/Slider';
import Common from '../mixins/Common';
import { init } from '../cast';
import ControlCast from './Control/Cast';
import ControlTextTrack from './Control/TextTrack';

export default {
  name: 'VaemPlayer',
  components: {
    ControlTextTrack,
    ControlCast,
    ControlSlider,
    ControlBar
  },
  mixins: [Common],
  props: {
    src: {
      type: String,
      required: true
    },
    primaryColor: {
      type: String,
      default: 'red'
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    controls: {
      type: Boolean,
      default: true
    },
    textTracks: {
      type: Array,
      default: () => []
    },
    messages: {
      type: Object,
      default: () => ({
        error: 'Unable to play content',
        off: 'Off'
      })
    },
    aspectRatio: {
      type: Number,
      default: 16 / 9
    },
    handleMouseLeave: {
      type: Boolean,
      default: true
    },
    castCustomData: {
      type: Object,
      default: () => ({})
    },
    start: {
      type: Number,
      default: 0
    },
    muted: {
      type: Boolean,
      default: false
    },
    poster: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      userActivity: false,
      duration: 0,
      currentTime: 0,
      paused: !this.autoplay,
      ended: false,
      isMuted: this.muted,
      volume: 1,
      fullscreen: false,
      castConnected: false,
      seekInfo: null,
      showCastButton: false,
      tech: 'video',
      buffered: null,
      waiting: true,
      autoplay2: this.autoplay,
      initialTime: 0,
      activeTextTrack: null,
      error: false,
      controlsOffset: 0,
      controlsShown: true
    };
  },
  computed: {
    showControls() {
      return (this.paused || this.userActivity || this.castConnected || this.waiting)
        && !this.error && this.controls
      ;
    },
    seekInfoLeft() {
      let width = this.$el.clientWidth;
      return Math.min(
        Math.max(
          this.seekInfo / this.duration * width,
          40
        ),
        width - 40
      );
    },
    bufferedRanges() {
      if (!this.buffered) {
        return [];
      }
      const ret = [];
      for (let i = 0; i < this.buffered.length; i++) {
        ret.push({
          start: this.buffered.start(i),
          end: this.buffered.end(i)
        })
      }
      return ret;
    },
    style() {
      return {
        '--primary-color': this.primaryColor,
        'paddingTop': this.aspectRatio ? 1 / this.aspectRatio * 100 + '%' : null
      }
    },
    textTrackStyle() {
      return {
        bottom: (this.showControls ? this.controlsOffset : 0) + 'px'
      }
    }
  },
  watch: {
    textTracks: {
      immediate: true,
      handler(textTracks) {
        this.activeTextTrack = textTracks?.find?.((track) => track.default)
      }
    },
    src(src) {
      if (this.tech !== 'video') {
        return;
      }

      if (this.hls) {
        this.hls.loadSource(src);
      } else {
        this.$refs.video.src = src;
        this.$refs.video.currentTime = this.start;
      }
    },
    paused(value) {
      this.$emit(value ? 'paused' : 'playing');
    },
    waiting(value) {
      this.$emit(value ? 'waiting' : 'canplay');
    },
    showControls: {
      immediate: true,
      handler(value) {
        this.$emit('controls-visibility', value);
      }
    },
    controlsShown: {
      immediate: true,
      async handler(value) {
        if (value) {
          await this.$nextTick();
          const seekSliderTop = this.$refs.seekSlider?.$el?.getBoundingClientRect?.()?.top;
          const { top, height } = this.$el.getBoundingClientRect();
          this.controlsOffset = top + height - seekSliderTop;
        }
      }
    },
    muted(newValue) {
      this.muted = newValue
    }
  },
  async mounted() {
    await init();
    this.initHls();
    document.addEventListener('fullscreenchange', this.onfullscreenchange);
    document.addEventListener('webkitfullscreenchange', this.onfullscreenchange);
    if (window.cast) {
      this.castContext = cast.framework.CastContext.getInstance();
      this.castContext.addEventListener(
        cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        this.updateCastState
      );
      return this.updateCastState();
    }
  },
  destroyed() {
    if (this.castContext) {
      this.castContext.removeEventListener(
        cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        this.updateCastState
      );
    }
    document.removeEventListener('fullscreenchange', this.onfullscreenchange);
    document.removeEventListener('webkitfullscreenchange', this.onfullscreenchange);
  },
  methods: {
    initHls() {
      if (!this.$refs.video) {
        return;
      }

      if (this.$refs.video.canPlayType('application/vnd.apple.mpegurl')) {
        this.$refs.video.src = this.src;
      } else if (Hls.isSupported()) {
        this.hls = new Hls();
        this.hls.loadSource(this.src);
        this.hls.attachMedia(this.$refs.video);
        this.hls.on(Hls.Events.ERROR, (event, error) => {
          if (error.fatal) {
            switch (error.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // try to recover network error
                console.log('fatal network error encountered, try to recover');
                this.hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('fatal media error encountered, try to recover');
                this.hls.recoverMediaError();
                break;
              default:
                // cannot recover
                this.onerror(error);
                break;
            }
          }
        });
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const { level } = this.hls.levels.reduce(
            (prev, { bitrate }, level) => {
              if (bitrate > prev.bitrate) {
                return {
                  bitrate,
                  level
                }
              } else {
                return prev
              }
            },
            { bitrate: 0 })

          if (level) {
            this.hls.startLevel = level
          }
          this.$refs.video.currentTime = this.initialTime || this.start;

          if (this.autoplay) {
            this.$refs.video.play();
          }
        });

        this.$refs.video.currentTime = this.initialTime;
      }
    },
    async updateCastState() {
      this.castConnected = this.castContext.getCastState() === 'CONNECTED';
      this.showCastButton = this.castContext.getCastState() !== 'NO_DEVICES_AVAILABLE';

      this.autoplay2 = !this.paused;
      this.initialTime = this.currentTime;
      if (!this.castConnected && this.tech !== 'video') {
        this.tech = 'video';
        // re-initialise hls
        await this.$nextTick();
        this.initHls();
        this.buffered = [];
      } else if (this.castConnected && this.tech !== 'control-cast') {
        if (this.hls) {
          // remove hls
          this.hls.destroy();
          this.hls = null;
        }
        await this.$nextTick();
        this.tech = 'control-cast';
        this.buffered = [];
      }
    },
    onfullscreenchange() {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        this.fullscreen = false;
      }
    },
    setUserActivity() {
      clearTimeout(this.timer);
      this.userActivity = true;
      this.timer = setTimeout(() => {
        this.userActivity = false;
      }, 4000);
    },
    clearUserActivity() {
      this.userActivity = false;
      clearTimeout(this.timer);
    },
    play() {
      if (this.paused) {
        this.$refs.video.play();
      } else {
        this.$refs.video.pause();
      }
    },
    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.tech === 'video') {
        this.$refs.video.muted = this.isMuted;
      }
    },
    async toggleFullscreen() {
      if (!this.fullscreen) {
        if (this.$el.requestFullscreen) {
          await this.$el.requestFullscreen();
        } else {
          await this.$el.webkitRequestFullscreen();
        }
        this.fullscreen = true;
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else {
          await document.webkitExitFullscreen();
        }
        this.fullscreen = false;
      }
    },
    setVolume(volume) {
      if (this.tech === 'video') {
        this.$refs.video.volume = volume;
      } else {
        this.$refs.video.setVolume(volume);
      }
      this.isMuted = false;
    },
    seek(time) {
      if (this.tech === 'video') {
        this.$refs.video.currentTime = time;
      } else {
        this.$refs.video.setCurrentTime(time);
      }
    },
    selectCastDevice() {
      if (this.$refs.video.webkitShowPlaybackTargetPicker) {
        this.$refs.video.webkitShowPlaybackTargetPicker();
      } else {
        // start Google cast session
        this.castContext.requestSession();
      }
    },
    onAirplay() {
      this.castConnected = this.$refs.video?.webkitCurrentPlaybackTargetIsWireless
    },
    onerror(event) {
      console.error(event);
      this.error = true;
    },
    onSelectTextTrack(textTrack) {
      this.activeTextTrack = textTrack;
    },
    onmouseleave() {
      if (this.handleMouseLeave) {
        this.clearUserActivity();
      }
    },
    ontimeupdate() {
      this.currentTime = this.$refs.video?.currentTime;
      this.$emit('timeupdate', this.currentTime)
    },
    onprogress() {
      this.buffered = this.$refs.video?.buffered
    },
    ondurationchange() {
      this.duration = this.$refs.video?.duration
    }
  }
}
</script>

<style scoped>
.vaem-player {
  position: relative;
  background: black;
}

.vaem-player video {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(0, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0));
  pointer-events: none;
}

.bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

>>> button {
  appearance: none;
  background: transparent;
  outline: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
}

>>> .fade-enter-active, >>> .fade-leave-active {
  transition: opacity .5s
}

>>> .fade-enter, >>> .fade-leave-to {
  opacity: 0
}

>>> .scale-x-enter-active, >>> .scale-x-leave-active {
  transition: all .3s ease-in-out;
}

>>> .scale-x-enter, >>> .scale-x-leave-to {
  width: 0;
  opacity: 0;
}

.seek-info {
  position: absolute;
  transform: translate(-50%, -100%);
  color: white;
  margin-bottom: 10px;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}

.control-text-track {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translate(0, -50%);
  text-align: center;
  color: #b00020;
}
</style>
