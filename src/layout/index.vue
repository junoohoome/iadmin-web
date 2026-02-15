<template>
  <div class="app-wrapper">
    <Sidebar class="sidebar-container" />
    <div class="main-container">
      <Navbar />
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from "./components/Sidebar/index.vue";
import AppMain from "./components/AppMain.vue";
import Navbar from "./components/Navbar.vue";
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
}
.sidebar-container {
  width: 210px;
}
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
