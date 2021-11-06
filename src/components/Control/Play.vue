<template>
  <button @click="$emit('click')">
    <svg-icon
      type="mdi"
      :path="paused ? mdiPlay : mdiPause"
      :size="64"
    />
  </button>
</template>
<script>
import { mdiPlay, mdiPause } from '@mdi/js';

export default {
  name: 'ControlPlay',
  props: {
    paused: {
      type: Boolean,
      required: true
    }
  },
  data: () => ({
    mdiPlay,
    mdiPause
  })
}
</script>
