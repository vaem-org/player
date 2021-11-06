<template>
  <div class="control-progress">
    <div
      class="progress"
      :style="{ width }"
    />
  </div>
</template>

<script>
export default {
  name: 'ControlProgress',
  props: {
    duration: {
      type: Number,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    }
  },
  computed: {
    width() {
      return this.currentTime/this.duration*100 + '%';
    }
  }
}
</script>

<style scoped>
.control-progress {
  height: 5px;
  background: rgba(255, 255, 255, 0.2);
  width: 100%;
}

.progress {
  height: 100%;
  background: red;
}
</style>
