<template>
  <div ref="rightPanel" :class="{ show: showVal }" class="rightPanel-container">
    <div class="rightPanel-background" />
    <div class="rightPanel">
      <div class="rightPanel-items">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'
import { useSettingsStore } from '@/stores'

interface Props {
  clickNotClose?: boolean
  buttonTop?: number
}

const props = withDefaults(defineProps<Props>(), {
  clickNotClose: false,
  buttonTop: 250
})

const settingsStore = useSettingsStore()
const rightPanel = ref<HTMLElement>()

const showVal = computed({
  get: () => settingsStore.showSettings,
  set: (val) => {
    settingsStore.changeSetting({
      key: 'showSettings',
      value: val
    })
  }
})

const theme = computed(() => settingsStore.theme)

const addClass = (element: HTMLElement, className: string) => {
  element.classList.add(className)
}

const removeClass = (element: HTMLElement, className: string) => {
  element.classList.remove(className)
}

function closeSidebar(evt: Event) {
  const parent = (evt.target as HTMLElement).closest('.rightPanel')
  if (!parent) {
    showVal.value = false
    window.removeEventListener('click', closeSidebar)
  }
}

function addEventClick() {
  window.addEventListener('click', closeSidebar)
}

function insertToBody() {
  if (rightPanel.value) {
    const body = document.querySelector('body')
    body?.insertBefore(rightPanel.value, body.firstChild)
  }
}

watch(
  showVal,
  (value) => {
    if (value && !props.clickNotClose) {
      addEventClick()
    }
    if (value) {
      addClass(document.body, 'showRightPanel')
    } else {
      removeClass(document.body, 'showRightPanel')
    }
  }
)

onMounted(() => {
  insertToBody()
  if (showVal.value && !props.clickNotClose) {
    addEventClick()
  }
})

onBeforeUnmount(() => {
  const elx = rightPanel.value
  elx?.remove()
})
</script>

<style>
.showRightPanel {
  overflow: hidden;
  position: relative;
  width: calc(100% - 15px);
}
</style>

<style lang="scss" scoped>
.rightPanel-background {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);
  background: rgba(0, 0, 0, 0.2);
  z-index: -1;
}

.rightPanel {
  width: 100%;
  max-width: 260px;
  height: 100vh;
  position: fixed;
  top: 0;
  right: 0;
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.05);
  transition: all 0.25s cubic-bezier(0.7, 0.3, 0.1, 1);
  transform: translate(100%);
  background: #fff;
  z-index: 40000;
}

.show {
  transition: all 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);

  .rightPanel-background {
    z-index: 20000;
    opacity: 1;
    width: 100%;
    height: 100%;
  }

  .rightPanel {
    transform: translate(0);
  }
}

.handle-button {
  width: 48px;
  height: 48px;
  position: absolute;
  left: -48px;
  text-align: center;
  font-size: 24px;
  border-radius: 6px 0 0 6px !important;
  z-index: 0;
  pointer-events: auto;
  cursor: pointer;
  color: #fff;
  line-height: 48px;

  i {
    font-size: 24px;
    line-height: 48px;
  }
}
</style>
