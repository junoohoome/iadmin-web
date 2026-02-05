<template>
  <div>
    <!-- 图片上传组件辅助 -->
    <el-upload
      ref="uploadRef"
      class="avatar-uploader quill-img"
      :action="uploadImgUrl"
      name="file"
      :headers="headers"
      :show-file-list="false"
      :on-success="quillImgSuccess"
      :on-error="uploadError"
      :before-upload="quillImgBefore"
      accept=".jpg,.jpeg,.png,.gif"
    />

    <!-- 富文本组件 -->
    <QuillEditor
      ref="quillEditorRef"
      v-model:content="content"
      content-type="html"
      :options="editorOption"
      style="height: 500px"
      @blur="onEditorBlur"
      @focus="onEditorFocus"
      @update:content="onEditorChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { getToken } from '@/utils/auth'

// 工具栏配置
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
  ['blockquote', 'code-block'], // 引用  代码块
  [{ list: 'ordered' }, { list: 'bullet' }], // 有序、无序列表
  [{ indent: '-1' }, { indent: '+1' }], // 缩进
  [{ size: ['small', false, 'large', 'huge'] }], // 字体大小
  [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题
  [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
  [{ align: [] }], // 对齐方式
  ['clean'], // 清除文本格式
  ['link', 'image', 'video'] // 链接、图片、视频
]

interface Props {
  modelValue: string
  maxSize?: number // kb
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 4000
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const content = ref(props.modelValue)
const uploadRef = ref()
const quillEditorRef = ref()

const editorOption = {
  theme: 'snow',
  placeholder: '请输入内容',
  modules: {
    toolbar: {
      container: toolbarOptions,
      handlers: {
        image: function (value: any) {
          if (value) {
            // 触发input框选择图片文件
            const uploadInput = document.querySelector('.quill-img input') as HTMLInputElement
            uploadInput?.click()
          } else {
            const quill = quillEditorRef.value?.quill
            quill?.format('image', false)
          }
        }
      }
    }
  }
}

const uploadImgUrl = import.meta.env.VITE_APP_BASE_API + '/file/upload'
const headers = ref({
  accessToken: getToken()
})

watch(
  () => props.modelValue,
  function () {
    content.value = props.modelValue
  }
)

function onEditorBlur() {
  // 失去焦点事件
}

function onEditorFocus() {
  // 获得焦点事件
}

function onEditorChange() {
  // 内容改变事件
  emit('update:modelValue', content.value)
}

// 富文本图片上传前
function quillImgBefore(file: File) {
  const fileType = file.type
  if (fileType === 'image/jpeg' || fileType === 'image/png') {
    return true
  } else {
    ElMessage.error('请插入图片类型文件(jpg/jpeg/png)')
    return false
  }
}

function quillImgSuccess(res: any) {
  // res为图片服务器返回的数据
  // 获取富文本组件实例
  const quill = quillEditorRef.value?.quill
  // 如果上传成功
  if (res.code === 200) {
    // 获取光标所在位置
    const length = quill?.getSelection()?.index || 0
    // 插入图片
    quill?.insertEmbed(length, 'image', import.meta.env.VITE_APP_BASE_API + '/file/' + res.data.filePath)
    // 调整光标到最后
    quill?.setSelection(length + 1)
  } else {
    ElMessage.error('图片插入失败')
  }
}

// 富文本图片上传失败
function uploadError() {
  ElMessage.error('图片插入失败')
}
</script>

<style>
.editor {
  line-height: normal !important;
  height: 500px;
}
.el-upload {
  display: none;
}
.ql-snow .ql-tooltip[data-mode='link']::before {
  content: '请输入链接地址:';
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0px;
  content: '保存';
  padding-right: 0px;
}

.ql-snow .ql-tooltip[data-mode='video']::before {
  content: '请输入视频地址:';
}

.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: '14px';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='small']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='small']::before {
  content: '10px';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='large']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='large']::before {
  content: '18px';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='huge']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='huge']::before {
  content: '32px';
}

.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: '文本';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='1']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before {
  content: '标题1';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='2']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before {
  content: '标题2';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='3']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before {
  content: '标题3';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='4']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before {
  content: '标题4';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='5']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before {
  content: '标题5';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='6']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='6']::before {
  content: '标题6';
}

.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: '标准字体';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value='serif']::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value='serif']::before {
  content: '衬线字体';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value='monospace']::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value='monospace']::before {
  content: '等宽字体';
}
</style>
