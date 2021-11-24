<!--
  - VAEM - Asset manager
  - Copyright (C) 2021  Wouter van de Molengraft
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU General Public License for more details.
  -
  - You should have received a copy of the GNU General Public License
  - along with this program.  If not, see <https://www.gnu.org/licenses/>.
  -->

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
