<template>
  <div>
    <svg-icon v-if="icon" :icon-class="icon" />
    <span v-if="title">{{ title }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  title?: string
}

defineProps<Props>()
</script>
