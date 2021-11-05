<template>
  <div id="app">
    <div class="container">
      <vaem-player
        src="http://10.1.0.139:3050/618270edfcf174f387f6268d.5800k.m3u8"
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
  text-align: center;
  color: #2c3e50;
}

html, body {
  margin: 0;
  padding: 0;
}

.container {
  width: 100%;
}
</style>
