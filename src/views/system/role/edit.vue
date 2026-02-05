<template>
  <el-dialog
    v-model="dialog"
    :close-on-click-modal="false"
    :before-close="cancel"
    :title="isAdd ? '新增角色' : '编辑角色'"
    append-to-body
    width="520px"
  >
    <el-form ref="formRef" :inline="true" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" style="width: 145px" />
      </el-form-item>
      <el-form-item label="角色权限" prop="roleKey">
        <el-input v-model="form.roleKey" style="width: 145px" />
      </el-form-item>
      <el-form-item label="描述信息" prop="remark">
        <el-input v-model="form.remark" style="width: 380px" :rows="5" type="textarea" />
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
import { ref, watch } from 'vue'
import { ElNotification } from 'element-plus'
import { add, edit } from '@/api/role'

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
const form = ref<any>({})

const rules = {
  roleName: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 4, max: 16, message: '长度在4-16个字符以内', trigger: 'change' }
  ],
  roleKey: [
    { required: true, message: '请输入权限', trigger: 'blur' },
    { min: 4, max: 16, message: '长度在4-16个字符以内', trigger: 'change' }
  ],
  remark: [{ max: 120, message: '长度在120个字符以内', trigger: 'change' }]
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
    } else {
      return false
    }
  })
}

function doAdd() {
  add(form.value).then((res) => {
    resetForm()
    ElNotification({
      title: '添加成功',
      type: 'success',
      duration: 2500
    })
    loading.value = false
    emit('refresh')
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
    } else {
      ElNotification({
        title: '修改失败',
        type: 'error',
        duration: 2500
      })
    }
    loading.value = false
  })
}

function initForm(data?: any) {
  if (!data) {
    data = {}
  }
  form.value = {
    roleId: data.roleId,
    roleName: data.roleName,
    remark: data.remark,
    roleKey: data.roleKey
  }
}

function resetForm() {
  dialog.value = false
  formRef.value?.resetFields()
  initForm()
}

defineExpose({
  dialog,
  initForm,
  resetForm
})
</script>
