<template>
  <div :style="{ height: height + 'px', zIndex: zIndex }">
    <div
      :class="className"
      :style="{
        top: isSticky ? stickyTop + 'px' : '',
        zIndex: zIndex,
        position: position,
        width: width,
        height: height + 'px',
      }"
    >
      <slot>
        <div>sticky</div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onActivated } from "vue";

interface Props {
  stickyTop?: number;
  zIndex?: number;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  stickyTop: 0,
  zIndex: 1,
  className: "",
});

const active = ref(false);
const position = ref<string>("");
const width = ref<string | number>("auto");
const height = ref<number>(0);
const isSticky = ref(false);

onMounted(() => {
  height.value =
    document.querySelector(".sticky")?.getBoundingClientRect().height || 0;
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleResize);
});

onActivated(() => {
  handleScroll();
});

function sticky() {
  if (active.value) {
    return;
  }
  position.value = "fixed";
  active.value = true;
  width.value = width.value + "px";
  isSticky.value = true;
}

function handleReset() {
  if (!active.value) {
    return;
  }
  reset();
}

function reset() {
  position.value = "";
  width.value = "auto";
  active.value = false;
  isSticky.value = false;
}

function handleScroll() {
  const el = document.querySelector(".sticky");
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const w = rect.width;
  width.value = w || "auto";
  const offsetTop = rect.top;
  if (offsetTop < props.stickyTop) {
    sticky();
    return;
  }
  handleReset();
}

function handleResize() {
  const el = document.querySelector(".sticky");
  if (!el) return;

  if (isSticky.value) {
    width.value = el.getBoundingClientRect().width + "px";
  }
}
</script>
