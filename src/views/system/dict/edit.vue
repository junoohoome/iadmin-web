<template>
  <el-dialog
    v-model="dialog"
    :append-to-body="true"
    :close-on-click-modal="false"
    :before-close="cancel"
    :title="isAdd ? '新增字典' : '编辑字典'"
    width="500px"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="form.dictName" style="width: 370px" />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="form.dictType" style="width: 370px" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.remark" style="width: 370px" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="text" @click="cancel">取消</el-button>
        <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import { add, edit } from '@/api/dict'

interface Props {
  isAdd: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const loading = ref(false)
const dialog = ref(false)
const formRef = ref()
const form = ref({
  dictId: '',
  dictName: '',
  dictType: '',
  remark: ''
})

const rules = {
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dictType: [{ required: true, message: '请输入字典类型', trigger: 'blur' }]
}

function cancel() {
  resetForm()
}

function doSubmit() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      if (props.isAdd) {
        doAdd()
      } else {
        doEdit()
      }
    }
  })
}

function doAdd() {
  add(form.value).then((res) => {
    loading.value = false
    if (res.code === 200) {
      resetForm()
      ElNotification({
        title: '添加成功',
        type: 'success',
        duration: 2500
      })
      emit('refresh')
    }
  })
}

function doEdit() {
  edit(form.value).then((res) => {
    if (res.code === 200) {
      resetForm()
      ElNotification({
        title: '修改成功',
        type: 'success',
        duration: 2500
      })
    }
    loading.value = false
  })
}

function initForm(data: any) {
  form.value = {
    dictId: data.dictId,
    dictName: data.dictName,
    dictType: data.dictType,
    remark: data.remark
  }
}

function resetForm() {
  dialog.value = false
  formRef.value?.resetFields()
  form.value = {
    dictId: '',
    dictName: '',
    dictType: '',
    remark: ''
  }
}

defineExpose({
  dialog,
  initForm,
  resetForm
})
</script>

<style scoped></style>
