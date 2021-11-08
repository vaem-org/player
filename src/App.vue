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
    textTracks: (process.env.VUE_APP_TEST_SUBTITLES ?? '').split(',').filter(Boolean).map((subtitle, i) => {
      const [srclang,src] = subtitle.split('|')
      return {
          src,
          srclang,
          default: i===0
        }
      ;
    })
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
