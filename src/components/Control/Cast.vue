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
import Common from '@/mixins/Common';
export default {
  name: 'ControlCast',
  mixins: [Common],
  props: {
    src: {
      type: String,
      required: true
    }
  },
  data: () => ({
    mdiCast,
    currentTime: 0,
    duration: 0
  }),
  mounted() {
    this.player = new cast.framework.RemotePlayer();
    this.playerController = new cast.framework.RemotePlayerController(this.player);
    this.playerController.addEventListener(
      cast.framework.RemotePlayerEventType.ANY_CHANGE,
      this.onPlayerEvent
    );
  },
  destroyed() {
    this.playerController.removeEventListener(
      cast.framework.RemotePlayerEventType.ANY_CHANGE,
      this.onPlayerEvent
    )
  },
  methods: {
    play() {
      if (this.loaded !== this.src) {
        const context = cast.framework.CastContext.getInstance();
        const session = context.getCurrentSession();
        const media = new chrome.cast.media.MediaInfo(
          this.src,
          'application/vnd.apple.mpegurl'
        );
        session.loadMedia(
          new chrome.cast.media.LoadRequest(media)
        );
        this.loaded = this.src;
      } else {
        this.playerController.playOrPause();
      }
    },
    onPlayerEvent({ field, value }) {
      this[field] = value;
      console.log(`${field}=`, value)
      switch(field) {
        case 'currentTime':
          this.$emit('timeupdate', value);
          break;
        case 'mediaInfo':
          this.$emit('durationchange', value.duration);
          this.duration = value.duration;
          break;
      }
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
