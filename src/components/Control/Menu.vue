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
    class="control-menu"
    tabindex="0"
    @keyup.esc.prevent="visible=false"
  >
    <div
      v-if="visible"
      class="outside"
      @click="visible=false"
    />
    <transition name="fade">
      <div
        v-if="visible"
        class="items"
      >
        <button
          v-for="({ text, value: itemValue }, i) of items"
          :key="i"
          :class="{ active: itemValue === value }"
          type="button"
          @click="click(itemValue)"
        >
          {{ text }}
        </button>
      </div>
    </transition>
    <slot
      name="activator"
      v-bind="{ on }"
    />
  </div>
</template>

<script>
export default {
  name: 'ControlMenu',
  props: {
    value: {
      type: Object,
      default: () => null
    },
    items: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      visible: false,
      on: {
        click: () => {
          this.visible = !this.visible
        }
      }
    };
  },
  methods: {
    click(value) {
      this.$emit('input', value);
      this.visible = false;
    }
  }
}
</script>

<style scoped>
.control-menu {
  position: relative;
  line-height: 0;
}

.items {
  position: absolute;
  background: rgba(64, 64, 64, 0.9);
  top: -100%;
  left: 0;
  z-index: 1;
  transform: translate(0, -40px);
  line-height: 1.25;
}

.items button {
  padding: 0.5em 1em;
  transition: background 0.2s;
  font-size: 16px;
  display: block;
  width: 100%;
}

.items button:hover {
  background: rgb(128, 128, 128);
}

.active {
  background: rgb(128, 128, 128);
}

.outside {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: transparent;
}
</style>
