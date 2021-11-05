<template>
  <div class="vaem-player">
    <video
      ref="video"
      @playing="playing=true"
      @pause="playing=false"
    />
    <div
      v-if="!playing"
      class="controls"
    >
      <button
        @click="play"
      >
        <svg-icon
          type="mdi"
          :path="mdiPlay"
          :size="64"
        />
      </button>
    </div>
  </div>
</template>

<script>
import Hls from 'hls.js';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiPlay } from '@mdi/js';

export default {
  name: 'VaemPlayer',
  components: {
    SvgIcon
  },
  props: {
    src: {
      type: String,
      required: true
    }
  },
  data: () => ({
    mdiPlay,

    playing: false
  }),
  async mounted() {
    const castSenderUrl = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
    if (!document.querySelector(`script[src="${castSenderUrl}"]`)) {
      await new Promise((resolve, reject) => {
        window.__onGCastApiAvailable = resolve;
        const script = document.createElement('script');
        script.src = castSenderUrl;
        script.addEventListener('error', reject);
        document.querySelector('head').appendChild(script);
      });
    }

    const context = cast.framework.CastContext.getInstance();
    context.setOptions({
      receiverApplicationId: 'C0507A6F',
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });
    this.castContext = context;

    context.addEventListener(
      cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
      this.updateCastContext
    )

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(this.src);
      this.hls.attachMedia(this.$refs.video);
    } else {
      this.$refs.video.src = this.src;
    }
  },
  destroyed() {
    this.castContext.removeEventListener(
      cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
      this.updateCastContext
    )
  },
  methods: {
    updateCastContext({ sessionState }) {
      if ([
        cast.framework.SessionState.SESSION_STARTED,
        cast.framework.SessionState.SESSION_RESUMED,
      ].includes(sessionState)) {
        console.log('Session available');
        const request = new chrome.cast.media.LoadRequest(
          new chrome.cast.media.MediaInfo(
            this.src,
            'application/x-mpegURL'
          )
        )
        this.castContext.getCurrentSession().loadMedia(
          request
        );
      }
    },

    play() {
      this.$refs.video.play();
    }
  }
}
</script>

<style>
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

.controls button {
  appearance: none;
  background: transparent;
  outline: none;
  border: none;
  color: white;
  cursor: pointer;
}
</style>
