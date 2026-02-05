<template>
  <div :class="{ fullscreen: fullscreen }" class="tinymce-container" :style="{ width: containerWidth }">
    <textarea :id="tinymceId" class="tinymce-textarea" />
    <div class="editor-custom-btn-container">
      <EditorImage color="#1890ff" class="editor-upload-btn" @success-cbk="imageSuccessCBK" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * docs:
 * https://panjiachen.github.io/vue-element-admin-site/feature/component/rich-editor.html#tinymce
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, onActivated, onDeactivated, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import EditorImage from './components/EditorImage.vue'
import plugins from './plugins'
import toolbar from './toolbar'
import load from './dynamicLoadScript'

// why use this cdn, detail see https://github.com/PanJiaChen/tinymce-all-in-one
const tinymceCDN = 'https://cdn.jsdelivr.net/npm/tinymce-all-in-one@4.9.3/tinymce.min.js'

interface Props {
  id?: string
  modelValue?: string
  toolbar?: string[]
  menubar?: string
  height?: number | string
  width?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  id: () => 'vue-tinymce-' + +new Date() + ((Math.random() * 1000).toFixed(0) + ''),
  modelValue: '',
  toolbar: () => [],
  menubar: 'file edit insert view format table',
  height: 500,
  width: 'auto'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const hasChange = ref(false)
const hasInit = ref(false)
const tinymceId = ref(props.id)
const fullscreen = ref(false)

const languageTypeList: Record<string, string> = {
  en: 'en',
  zh: 'zh_CN',
  es: 'es_MX',
  ja: 'ja'
}

const containerWidth = computed(() => {
  const width = props.width
  if (/^[\d]+(\.[\d]+)?$/.test(width.toString())) {
    // matches `100`, `'100'`
    return `${width}px`
  }
  return width
})

watch(
  () => props.modelValue,
  (val) => {
    if (!hasChange.value && hasInit.value) {
      nextTick(() => (window as any).tinymce.get(tinymceId.value).setContent(val || ''))
    }
  }
)

onMounted(() => {
  init()
})

onActivated(() => {
  if ((window as any).tinymce) {
    initTinymce()
  }
})

onDeactivated(() => {
  destroyTinymce()
})

onBeforeUnmount(() => {
  destroyTinymce()
})

function init() {
  // dynamic load tinymce from cdn
  load(tinymceCDN, (err) => {
    if (err) {
      ElMessage.error(err.message)
      return
    }
    initTinymce()
  })
}

function initTinymce() {
  const _this = fullscreen
  ;(window as any).tinymce.init({
    selector: `#${tinymceId.value}`,
    language: languageTypeList['zh'],
    height: props.height,
    body_class: 'panel-body ',
    object_resizing: false,
    toolbar: props.toolbar.length > 0 ? props.toolbar : toolbar,
    menubar: props.menubar,
    plugins: plugins,
    end_container_on_empty_block: true,
    powerpaste_word_import: 'clean',
    code_dialog_height: 450,
    code_dialog_width: 1000,
    advlist_bullet_styles: 'square',
    advlist_number_styles: 'default',
    imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io'],
    default_link_target: '_blank',
    link_title: false,
    nonbreaking_force_tab: true, // inserting nonbreaking space &nbsp; need Nonbreaking Space Plugin
    init_instance_callback: (editor: any) => {
      if (props.modelValue) {
        editor.setContent(props.modelValue)
      }
      hasInit.value = true
      editor.on('NodeChange Change KeyUp SetContent', () => {
        hasChange.value = true
        emit('update:modelValue', editor.getContent())
      })
    },
    setup(editor: any) {
      editor.on('FullscreenStateChanged', (e: any) => {
        _this.value = e.state
      })
    }
  })
}

function destroyTinymce() {
  const tinymce = (window as any).tinymce.get(tinymceId.value)
  if (fullscreen.value) {
    tinymce.execCommand('mceFullScreen')
  }

  if (tinymce) {
    tinymce.destroy()
  }
}

function setContent(value: string) {
  ;(window as any).tinymce.get(tinymceId.value).setContent(value)
}

function getContent() {
  return (window as any).tinymce.get(tinymceId.value).getContent()
}

function imageSuccessCBK(arr: any[]) {
  arr.forEach((v) => {
    ;(window as any).tinymce.get(tinymceId.value).insertContent(`<img class="wscnph" src="${v.url}" >`)
  })
}

defineExpose({
  setContent,
  getContent
})
</script>

<style scoped>
.tinymce-container {
  position: relative;
  line-height: normal;
}
.tinymce-container :deep(.mce-fullscreen) {
  z-index: 10000;
}
.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}
.editor-custom-btn-container {
  position: absolute;
  right: 4px;
  top: 4px;
  /*z-index: 2005;*/
}
.fullscreen .editor-custom-btn-container {
  z-index: 10000;
  position: fixed;
}
.editor-upload-btn {
  display: inline-block;
}
</style>
