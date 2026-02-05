<template>
  <div class="upload-container">
    <el-upload
      :data="dataObj"
      :multiple="false"
      :show-file-list="false"
      :on-success="handleImageSuccess"
      :before-upload="beforeUpload"
      class="image-uploader"
      :headers="headers"
      action="/file/upload"
      accept="image/jpeg,image/gif,image/png"
      drag
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <div class="image-preview">
      <div v-show="imageUrl.length > 1" class="image-preview-wrapper">
        <img :src="modelValue">
        <div class="image-preview-action">
          <el-icon @click="rmImage"><Delete /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElNotification } from 'element-plus'
import { UploadFilled, Delete } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'
import { validFile } from '@/utils/index'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const tempUrl = ref('')
const dataObj = ref({ token: '', key: '' })
const headers = ref({
  accessToken: getToken()
})

const imageUrl = computed(() => props.modelValue)

function rmImage() {
  emitInput('')
}

function emitInput(val: string) {
  emit('update:modelValue', val)
}

function handleImageSuccess(response: any) {
  if (response.code === 200) {
    emitInput(response.data.filePath)
  } else {
    ElNotification({
      title: response.msg,
      type: 'error',
      duration: 2000
    })
  }
}

function beforeUpload(file: File) {
  return validFile(file)
}
</script>

<style lang="scss" scoped>
@import '@/styles/mixin.scss';

.upload-container {
  width: 50%;
  position: relative;
  @include clearfix;

  .image-uploader {
    width: 35%;
    float: left;
  }

  .image-preview {
    width: 200px;
    height: 200px;
    position: relative;
    border: 1px dashed #d9d9d9;
    float: left;
    margin-left: 50px;

    .image-preview-wrapper {
      position: relative;
      width: 100%;
      height: 100%;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .image-preview-action {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      cursor: default;
      text-align: center;
      color: #fff;
      opacity: 0;
      font-size: 20px;
      background-color: rgba(0, 0, 0, 0.5);
      transition: opacity 0.3s;
      cursor: pointer;
      text-align: center;
      line-height: 200px;

      .el-icon {
        font-size: 36px;
      }
    }

    &:hover {
      .image-preview-action {
        opacity: 1;
      }
    }
  }

  .image-app-preview {
    width: 320px;
    height: 180px;
    position: relative;
    border: 1px dashed #d9d9d9;
    float: left;
    margin-left: 50px;

    .app-fake-conver {
      height: 44px;
      position: absolute;
      width: 100%;
      text-align: center;
      line-height: 64px;
      color: #fff;
    }
  }
}
</style>
