<template>
  <div
    class="vaem-player"
    :style="{ '--primary-color': primaryColor }"
    @mousemove="setUserActivity"
    @mousedown="setUserActivity"
    @mouseleave="clearUserActivity"
  >
    <component
      :is="tech"
      ref="video"
      :muted="muted"
      :src="tech!=='video' && src"
      :autoplay="autoplay2"
      :initial-time="initialTime"
      crossorigin="anonymous"
      @muted="muted=$event"
      @playing="paused=false"
      @pause="paused=true"
      @durationchange="duration=$refs.video.duration"
      @timeupdate="currentTime=$refs.video.currentTime"
      @volumechange="volume=$refs.video.volume"
      @webkitplaybacktargetavailabilitychanged="showCastButton=true"
      @webkitcurrentplaybacktargetiswirelesschanged="onAirplay"
      @waiting="waiting=true"
      @canplay="waiting=false"
      @progress="buffered=$refs.video.buffered"
      @error="onerror"
      @click.self="play"
    />
    <control-text-track
      v-if="activeTextTrack"
      :src="activeTextTrack.src"
      :time="currentTime"
    />
    <transition name="fade">
      <div
        v-if="controls && showControls"
        class="controls"
        @click.self="play"
      >
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
            :muted="muted"
            :fullscreen="fullscreen"
            :cast-connected="castConnected"
            :show-cast-button="showCastButton"
            :waiting="waiting"
            :show-audio-controls="tech!=='video' || !castConnected"
            :text-tracks="textTracks"
            :active-text-track="activeTextTrack"
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
import ControlBar from '@/components/Control/Bar';
import ControlSlider from '@/components/Control/Slider';
import Common from '@/mixins/Common';
import { init } from '@/cast';
import ControlCast from '@/components/Control/Cast';
import ControlSubtitles from '@/components/Control/TextTrack';
import ControlTextTrack from '@/components/Control/TextTrack';

export default {
  name: 'VaemPlayer',
  components: {
    ControlTextTrack,
    ControlSubtitles,
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
    }
  },
  data() {
    return {
      userActivity: false,
      duration: 0,
      currentTime: 0,
      paused: true,
      ended: false,
      muted: false,
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
      activeTextTrack: null
    };
  },
  computed: {
    showControls() {
      return this.paused || this.userActivity || this.castConnected;
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
      for(let i=0; i<this.buffered.length; i++) {
        ret.push({
          start: this.buffered.start(i),
          end: this.buffered.end(i)
        })
      }
      return ret;
    }
  },
  watch: {
    textTracks: {
      immediate: true,
      handler(textTracks) {
        this.activeTextTrack = textTracks?.find?.((track) => track.default)
      }
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
      if (this.$refs.video.canPlayType('application/vnd.apple.mpegurl')) {
        this.$refs.video.src = this.src;
      } else if (Hls.isSupported()) {
        this.hls = new Hls();
        this.hls.loadSource(this.src);
        this.hls.attachMedia(this.$refs.video);
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
      this.muted = !this.muted;
      if (this.tech === 'video') {
        this.$refs.video.muted = this.muted;
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
      this.muted = false;
    },
    seek(time) {
      if (this.tech ==='video') {
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
    },
    onSelectTextTrack(textTrack) {
      this.activeTextTrack = textTrack;
    }
  }
}
</script>

<style scoped>
.vaem-player {
  position: relative;
  padding-top: 52.6%;
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

.control-subtitle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
