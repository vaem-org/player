<template>
  <div
    class="vaem-player"
    @mousemove="onmousemove"
  >
    <video
      ref="video"
      :muted="muted"
      @playing="paused=false"
      @pause="paused=true"
      @durationchange="duration=$refs.video.duration"
      @timeupdate="currentTime=$refs.video.currentTime"
      @volumechange="volume=$refs.video.volume"
    />
    <div
      v-if="showControls"
      class="controls"
    >
      <control-play
        :paused="paused"
        @click="play"
      />
      <div class="gradient" />
      <div class="bottom">
        <control-progress
          :current-time="currentTime"
          :duration="duration"
        />
        <control-bar
          :paused="paused"
          :current-time="currentTime"
          :duration="duration"
          :volume="volume"
          :muted="muted"
          :fullscreen="fullscreen"
          @fullscreen="toggleFullscreen"
          @play="play"
          @toggle-mute="toggleMute"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Hls from 'hls.js';
import ControlPlay from '@/components/Control/Play';
import ControlBar from '@/components/Control/Bar';
import ControlProgress from '@/components/Control/Progress';

export default {
  name: 'VaemPlayer',
  components: {
    ControlProgress,
    ControlBar,
    ControlPlay
  },
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
    fullscreen: false
  }),
  computed: {
    showControls() {
      return this.paused || this.userActivity;
    }
  },
  mounted() {
    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(this.src);
      this.hls.attachMedia(this.$refs.video);
    } else {
      this.$refs.video.src = this.src;
    }
    document.addEventListener('fullscreenchange', this.onfullscreenchange);
  },
  destroyed() {
    document.removeEventListener('fullscreenchange', this.onfullscreenchange);
  },
  methods: {
    onfullscreenchange() {
      if (!document.fullscreenElement) {
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
        await this.$el.requestFullscreen();
        this.fullscreen = true;
      } else {
        await document.exitFullscreen();
        this.fullscreen = false;
      }
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
  background: linear-gradient(0, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0));
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
</style>
