<template>
  <div>
    <img :src="options.img" title="点击上传头像" class="img-circle img-lg" @click="editCropper()" />
    <el-dialog v-model="open" :title="title" width="800px">
      <el-row>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <vue-cropper
            ref="cropper"
            :img="options.img"
            :info="true"
            :auto-crop="options.autoCrop"
            :auto-crop-width="options.autoCropWidth"
            :auto-crop-height="options.autoCropHeight"
            :fixed-box="options.fixedBox"
            @real-time="realTime"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <div class="avatar-upload-preview">
            <img :src="previews.url" :style="previews.img" />
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload :show-file-list="false" :before-upload="beforeUpload" action="String">
            <el-button size="small">
              上传
              <Upload class="el-icon--right" />
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button :icon="Plus" size="small" @click="changeScale(1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="Minus" size="small" @click="changeScale(-1)" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="RefreshLeft" size="small" @click="rotateLeft()" />
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button :icon="RefreshRight" size="small" @click="rotateRight()" />
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" size="small" @click="uploadImg()">上 传</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { VueCropper } from 'vue-cropper'
import { ElNotification } from 'element-plus'
import { Upload, Plus, Minus, RefreshLeft, RefreshRight } from '@element-plus/icons-vue'
import { uploadAvatar } from '@/api/user'
import { useUserStore } from '@/stores/user'

interface User {
  avatar?: string
}

interface Props {
  user: User
}

const props = defineProps<Props>()

const userStore = useUserStore()
const cropper = ref()

const open = ref(false)
const title = ref('修改头像')
const options = reactive({
  img: userStore.avatar || '',
  autoCrop: true,
  autoCropWidth: 200,
  autoCropHeight: 200,
  fixedBox: true
})
const previews = ref<any>({})

function editCropper() {
  open.value = true
}

function rotateLeft() {
  cropper.value.rotateLeft()
}

function rotateRight() {
  cropper.value.rotateRight()
}

function changeScale(num: number) {
  const scale = num || 1
  cropper.value.changeScale(scale)
}

function beforeUpload(file: File) {
  if (file.type.indexOf('image/') === -1) {
    ElNotification({
      title: '文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。',
      type: 'error',
      duration: 2000
    })
  } else {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      options.img = reader.result as string
    }
  }
}

function uploadImg() {
  cropper.value.getCropBlob((data: Blob) => {
    const formData = new FormData()
    formData.append('avatarfile', data)
    uploadAvatar(formData).then((response) => {
      if (response.code === 200) {
        open.value = false
        options.img = '/avatar/' + response.data
        ElNotification({
          title: '修改成功',
          type: 'success',
          duration: 2000
        })
      } else {
        ElNotification({
          title: response.msg,
          type: 'error',
          duration: 2000
        })
      }
      cropper.value.clearCrop()
    })
  })
}

function realTime(data: any) {
  previews.value = data
}
</script>

<style scoped>
.avatar-upload-preview {
  position: absolute;
  top: 50%;
  transform: translate(50%, -50%);
  width: 180px;
  height: 180px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;
}

.img-circle {
  border-radius: 50%;
}

.img-lg {
  width: 120px;
  height: 120px;
}
</style>
