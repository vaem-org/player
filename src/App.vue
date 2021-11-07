<template>
  <div id="app">
    <div class="container">
      <label>
        <input
          v-model="controls"
          type="checkbox"
        >
        Show controls
      </label>
      <vaem-player
        :src="src"
        :controls="controls"
        :text-tracks="textTracks"
      />
    </div>
  </div>
</template>

<script>
import VaemPlayer from '@/components/VaemPlayer';

export default {
  name: 'App',
  components: { VaemPlayer },
  data: () => ({
    src: process.env.VUE_APP_TEST_VIDEO ?? 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    controls: true,
    textTracks: [
      {
        src: 'https://assets.cinetree.nl/api/streams/1636310713697/641045e23df3e14e18ba70642904f068eaba28fef84549938fb562a7992ff75d/617ba005338218001c6904e8.nl.vtt',
        srclang: 'nl',
        default: true
      }
    ]
  })
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
