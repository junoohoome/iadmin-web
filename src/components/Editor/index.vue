<template>
  <div>
    <!-- 图片上传组件辅助 -->
    <el-upload
      ref="uploadRef"
      class="avatar-uploader tinymce-img"
      :action="uploadImgUrl"
      name="file"
      :headers="headers"
      :show-file-list="false"
      :on-success="tinymceImgSuccess"
      :before-upload="tinymceImgBefore"
      accept=".jpg,.jpeg,.png,.gif"
    />
    <!-- 富文本组件 -->
    <Tinymce
      ref="tinymceEditorRef"
      v-model:value="content"
      :toolbar="toolbar"
      :style="{ width: '100%', height: height + 'px' }"
      @blur="onEditorBlur"
      @focus="onEditorFocus"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import Tinymce from './Tinymce/index.vue'
import { getToken } from '@/utils/auth'

interface Props {
  modelValue: string
  maxSize?: number // kb
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 400
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const content = ref(props.modelValue)
const uploadRef = ref()
const tinymceEditorRef = ref()

// TinyMCE toolbar configuration
const toolbar = [
  'bold italic underline strikethrough',
  'alignleft aligncenter alignright',
  'bullist numlist outdent indent',
  'link image',
  'formatselect fontselect fontsizeselect',
  'removeformat'
]

const uploadImgUrl = import.meta.env.VITE_APP_BASE_API + '/file/upload'
const headers = ref({
  accessToken: getToken()
})

const height = ref(500)

watch(
  () => props.modelValue,
  function (val) {
    content.value = val
  }
)

function onEditorBlur() {
  // 失去焦点事件
}

function onEditorFocus() {
  // 获得焦点事件
}

function onEditorChange(value: string) {
  // 内容改变事件
  emit('update:modelValue', value)
}

// 富文本图片上传前
function tinymceImgBefore(file: File) {
  const fileType = file.type
  if (fileType === 'image/jpeg' || fileType === 'image/png') {
    return true
  } else {
    ElMessage.error('请插入图片类型文件(jpg/jpeg/png)')
    return false
  }
}

function tinymceImgSuccess(res: ApiResponse<{ filePath: string }>) {
  // 图片上传成功回调
  if (res.code === 200) {
    const editor = tinymceEditorRef.value
    if (editor && editor.insertContent) {
      editor.insertContent(`<img src="${import.meta.env.VITE_APP_BASE_API}/file/${res.data.filePath}" style="max-width:100%">`)
    }
  } else {
    ElMessage.error('图片插入失败')
  }
}

// 富文本图片上传失败
function uploadError() {
  ElMessage.error('图片插入失败')
}
</script>

<style scoped>
.editor {
  line-height: normal !important;
}
.el-upload {
  display: none;
}
</style>
