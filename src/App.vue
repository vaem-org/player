<template>
  <div id="app">
    <div class="container">
      <vaem-player
        src="https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8"
      />
    </div>
  </div>
</template>

<script>
import VaemPlayer from '@/components/VaemPlayer';

export default {
  name: 'App',
  components: { VaemPlayer }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

html, body {
  margin: 0;
  padding: 0;
}

.container {
  width: 640px;
}
</style>
