<template>
  <div
    class="vaem-player"
    @mousemove="onmousemove"
    @mouseleave="clearUserActivity"
  >
    <video
      ref="video"
      :muted="muted"
      @playing="paused=false"
      @pause="paused=true"
      @durationchange="duration=$refs.video.duration"
      @timeupdate="currentTime=$refs.video.currentTime"
      @volumechange="volume=$refs.video.volume"
      @webkitplaybacktargetavailabilitychanged="showCastButton=true"
      @webkitcurrentplaybacktargetiswirelesschanged="onAirplay"
    />
    <transition name="fade">
      <div
        v-if="showControls"
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
            @fullscreen="toggleFullscreen"
            @play="play"
            @toggle-mute="toggleMute"
            @volume="setVolume"
            @cast="selectCastDevice"
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

export default {
  name: 'VaemPlayer',
  components: {
    ControlSlider,
    ControlBar
  },
  mixins: [Common],
  props: {
    src: {
      type: String,
      required: true
    }
  },
  data: () => ({
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
    showCastButton: false
  }),
  computed: {
    showControls() {
      return this.paused || this.userActivity;
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
    }
  },
  mounted() {
    if (this.$refs.video.canPlayType('application/vnd.apple.mpegurl')) {
      this.$refs.video.src = this.src;
    } else if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(this.src);
      this.hls.attachMedia(this.$refs.video);
    }
    document.addEventListener('fullscreenchange', this.onfullscreenchange);
    document.addEventListener('webkitfullscreenchange', this.onfullscreenchange);
  },
  destroyed() {
    document.removeEventListener('fullscreenchange', this.onfullscreenchange);
    document.removeEventListener('webkitfullscreenchange', this.onfullscreenchange);
  },
  methods: {
    onfullscreenchange() {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        this.fullscreen = false;
      }
    },
    onmousemove() {
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
      this.$refs.video.volume = volume;
      this.muted = false;
    },
    seek(time) {
      this.$refs.video.currentTime = time;
    },
    selectCastDevice() {
      this.$refs.video.webkitShowPlaybackTargetPicker?.();
    },
    onAirplay() {
      this.castConnected = this.$refs.video?.webkitCurrentPlaybackTargetIsWireless
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
</style>
