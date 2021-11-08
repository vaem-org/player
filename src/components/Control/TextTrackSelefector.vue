<template>
  <div
    class="control-text-track-selector"
  >
    Text track selector
  </div>
</template>

<script>
export default {
  name: 'ControlTextTrackSelefector',
  props: {
    value: {
      type: Object,
      required: true
    },
    textTracks: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.control-text-track-selector {
  position: absolute;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5em;
  bottom: -100%;
  left: 0;
}
</style>
