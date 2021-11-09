<template>
  <div class="control-cast">
    <svg-icon
      type="mdi"
      :path="mdiCast"
      :size="64"
    />
  </div>
</template>

<script>
import { mdiCast } from '@mdi/js';
import Common from '../../mixins/Common';

export default {
  name: 'ControlCast',
  mixins: [Common],
  props: {
    src: {
      type: String,
      required: true
    },
    muted: {
      type: Boolean,
      default: false
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    initialTime: {
      type: Number,
      default: 0
    },
    customData: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    mdiCast,
    currentTime: 0,
    duration: 0,
    paused: null,
    volume: 0,
    playerState: null
  }),
  watch: {
    muted(muted) {
      if (muted !== this.player.isMuted) {
        this.playerController.muteOrUnmute();
      }
    },
    src() {
      this.updateSrc();
    }
  },
  mounted() {
    this.context = cast.framework.CastContext.getInstance();
    this.context.addEventListener(
      cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
      this.onStateChanged
    )

    if (this.context.getCurrentSession()) {
      this.init();
    }
  },
  destroyed() {
    this.context.removeEventListener(
      cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
      this.onStateChanged
    );

    this.playerController?.removeEventListener?.(
      cast.framework.RemotePlayerEventType.ANY_CHANGE,
      this.onPlayerEvent
    );

  },
  methods: {
    onStateChanged({ sessionState }) {
      if ([
        cast.framework.SessionState.SESSION_RESUMED,
        cast.framework.SessionState.SESSION_STARTED,
      ].includes(sessionState)) {
        this.init();
      }
    },
    init() {
      this.player = new cast.framework.RemotePlayer();
      window.player = this.player;

      this.initPlayerController();
      this.updateData();
      this.updateSrc();
    },
    initPlayerController() {
      if (this.playerController) {
        this.playerController.removeEventListener(
          cast.framework.RemotePlayerEventType.ANY_CHANGE,
          this.onPlayerEvent
        );
      }

      this.playerController = new cast.framework.RemotePlayerController(this.player);
      this.playerController.addEventListener(
        cast.framework.RemotePlayerEventType.ANY_CHANGE,
        this.onPlayerEvent
      );
    },
    updateSrc() {
      if (this.player?.mediaInfo?.contentId !== this.src) {
        this.$emit('waiting');
        const session = this.context.getCurrentSession();
        const mediaInfo = new chrome.cast.media.MediaInfo(
          this.src,
          'application/vnd.apple.mpegurl'
        );
        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
        mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
        mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
        mediaInfo.customData = this.customData;
        const request = new chrome.cast.media.LoadRequest(mediaInfo);
        request.autoplay = this.autoplay;
        request.currentTime = this.initialTime;
        session.loadMedia(request).then(() => {
          this.$emit('canplay');
          this.initPlayerController();

          this.updateData();
        });
      }
    },
    play() {
      if (!this.paused) {
        return;
      }

      this.playerController.playOrPause();
    },
    pause() {
      if (this.player.isPaused) {
        return;
      }
      this.playerController.playOrPause();
    },
    updateData() {
      const duration = this.player.mediaInfo?.duration;
      if (this.duration !== duration) {
        this.duration = duration ?? 0;
        this.$emit('durationchange', duration);
      }

      const isPaused = this.player.isPaused || this.player.playerState === 'IDLE';
      if (this.paused !== isPaused) {
        this.paused = isPaused;
        this.$emit(isPaused ? 'pause' : 'playing');
      }

      if (this.currentTime !== this.player.currentTime) {
        this.currentTime = this.player.currentTime;
        this.$emit('timeupdate', this.currentTime);
      }

      if (this.volume !== this.player.volumeLevel) {
        this.volume = this.player.volumeLevel;
        this.$emit('volumechange', this.volume);
      }

      if (this.player.isMuted !== this.muted) {
        this.$emit('muted', this.player.isMuted);
      }

      if (this.player.playerState !== this.playerState) {
        this.playerState = this.player.playerState;
        if (this.playerState === 'BUFFERING') {
          this.$emit('waiting')
        } else if (['PLAYING', 'PAUSED'].includes(this.playerState)) {
          this.$emit('canplay')
        }
      }
    },
    onPlayerEvent() {
      this.updateData();
    },
    setVolume(volume) {
      this.player.volumeLevel = volume;
      this.playerController.setVolumeLevel();
    },
    setCurrentTime(time) {
      this.player.currentTime = time;
      this.playerController.seek();
    }
  }
}
</script>

<style scoped>
.control-cast {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
