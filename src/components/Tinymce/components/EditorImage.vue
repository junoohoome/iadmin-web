<template>
  <div class="upload-container">
    <el-button
      :style="{ background: color, borderColor: color }"
      :icon="Upload"
      size="small"
      type="primary"
      @click="dialogVisible = true"
    >
      上传
    </el-button>
    <el-dialog v-model="dialogVisible" title="上传图片" width="40%">
      <el-upload
        :multiple="true"
        :file-list="fileList"
        :show-file-list="true"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
        class="editor-slide-upload"
        :headers="headers"
        accept="image/jpeg,image/gif,image/png"
        action="/file/upload"
        list-type="picture-card"
      >
        <el-button size="small" type="primary"> 点击上传 </el-button>
      </el-upload>
      <template #footer>
        <el-button @click="dialogVisible = false"> 取消 </el-button>
        <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import type { UploadUserFile, UploadProps, UploadRawFile } from "element-plus";
import { Upload } from "@element-plus/icons-vue";
import { getToken } from "@/utils/auth";
import { validFile } from "@/utils/index";

interface Props {
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: "#1890ff",
});

const emit = defineEmits<{
  successCBK: [arr: ListObjItem[]];
}>();

interface ListObjItem {
  hasSuccess: boolean;
  uid: number;
  url?: string;
  width?: number;
  height?: number;
}

interface UploadResponse {
  data: {
    filePath: string;
  };
}

const dialogVisible = ref(false);
const listObj: Record<string, ListObjItem> = {};
const fileList = ref<UploadUserFile[]>([]);
const headers = ref({
  accessToken: getToken(),
});

function checkAllSuccess() {
  return Object.keys(listObj).every((item) => listObj[item].hasSuccess);
}

function handleSubmit() {
  const arr = Object.keys(listObj).map((v) => listObj[v]);
  if (!checkAllSuccess()) {
    ElMessage("请等待所有图片上传成功。如果有网络问题，请刷新页面并重新上传!");
    return;
  }
  emit("successCBK", arr);
  // Reset
  for (const key in listObj) {
    delete listObj[key];
  }
  fileList.value = [];
  dialogVisible.value = false;
}

function handleSuccess(response: UploadResponse, file: UploadUserFile) {
  const uid = file.uid;
  const objKeyArr = Object.keys(listObj);
  for (let i = 0, len = objKeyArr.length; i < len; i++) {
    if (listObj[objKeyArr[i]].uid === uid) {
      listObj[objKeyArr[i]].url = response.data.filePath;
      listObj[objKeyArr[i]].hasSuccess = true;
      return;
    }
  }
}

function handleRemove(file: UploadUserFile) {
  const uid = file.uid;
  const objKeyArr = Object.keys(listObj);
  for (let i = 0, len = objKeyArr.length; i < len; i++) {
    if (listObj[objKeyArr[i]].uid === uid) {
      delete listObj[objKeyArr[i]];
      return;
    }
  }
}

function beforeUpload(file: UploadRawFile) {
  if (!validFile(file)) {
    return false;
  }
  const _URL = window.URL || window.webkitURL;
  const fileName = file.uid.toString();
  listObj[fileName] = {} as ListObjItem;
  return new Promise<boolean>((resolve) => {
    const img = new Image();
    img.src = _URL.createObjectURL(file);
    img.onload = function () {
      listObj[fileName] = {
        hasSuccess: false,
        uid: file.uid,
        width: (this as HTMLImageElement).width,
        height: (this as HTMLImageElement).height,
      };
    };
    resolve(true);
  });
}
</script>

<style lang="scss" scoped>
.upload-container {
  display: inline-block;
}

.editor-slide-upload {
  margin-bottom: 20px;

  :deep(.el-upload--picture-card) {
    width: 100%;
  }
}
</style>
