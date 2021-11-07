<template>
  <div
    class="control-loader"
    :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
  >
    <div
      v-for="i of 4"
      :key="i"
      :style="style"
    />
  </div>
</template>

<script>
export default {
  name: 'ControlLoader',
  props: {
    size: {
      type: Number,
      default: 80
    },
    width: {
      type: Number,
      default: 8
    },
    color: {
      type: String,
      default: '#fff'
    }
  },
  computed: {
    style() {
      return {
        borderWidth: `${this.width}px`,
        borderColor: `${this.color} transparent transparent transparent`
      }
    }
  }
}
</script>

<style scoped>
.control-loader {
  display: inline-block;
  position: relative;
}

.control-loader div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  border: solid;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.control-loader div:nth-child(1) {
  animation-delay: -0.45s;
}

.control-loader div:nth-child(2) {
  animation-delay: -0.3s;
}

.control-loader div:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>
