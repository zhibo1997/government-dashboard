<template>
  <div class="map-toolbar-demo">
    <Map />
  </div>
</template>

<script setup lang="ts">
import Map from '@/mapComponents/Map.vue'
</script>

<style lang="scss" scoped>
.map-toolbar-demo {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #0a1929;
}
</style>
