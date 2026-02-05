<template>
  <span><slot>{{ displayValue }}</slot></span>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  startVal?: number
  endVal: number
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  startVal: 0,
  duration: 2000
})

const displayValue = ref(props.startVal)

function animate() {
  const start = props.startVal!
  const end = props.endVal
  const duration = props.duration!
  const startTime = performance.now()

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (easeOutQuart)
    const easeOut = 1 - Math.pow(1 - progress, 4)

    displayValue.value = Math.floor(start + (end - start) * easeOut)

    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      displayValue.value = end
    }
  }

  requestAnimationFrame(step)
}

onMounted(() => {
  animate()
})

watch(() => props.endVal, () => {
  animate()
})
</script>
