<template>
  <el-dialog v-model="dialog" :title="isAdd ? '新增部门' : '编辑部门'" append-to-body width="600px" @close="cancel">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="上级部门" prop="parentId">
        <el-tree-select
          v-model="form.parentId"
          :data="deptOptions"
          :props="{ label: 'deptName', value: 'deptId' }"
          placeholder="选择上级部门"
          check-strictly
          :render-after-expand="false"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model="form.deptName" placeholder="请输入部门名称" />
      </el-form-item>
      <el-form-item label="显示排序" prop="orderNum">
        <el-input-number v-model="form.orderNum" :min="0" controls-position="right" style="width: 100%" />
      </el-form-item>
      <el-form-item label="负责人" prop="leader">
        <el-input v-model="form.leader" placeholder="请输入负责人" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="部门状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="0">正常</el-radio>
          <el-radio label="1">停用</el-radio>
        </el-radio-group>
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
import { ref, computed } from 'vue'
import { ElNotification } from 'element-plus'
import { add, update } from '@/api/dept'
import type { Dept } from '@/types'

interface DeptForm {
  deptId?: number
  parentId: number
  deptName: string
  orderNum: number
  leader?: string
  phone?: string
  email?: string
  status: string
}

interface Props {
  isAdd: boolean
  deptOptions: Dept[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const dialog = ref(false)
const loading = ref(false)
const formRef = ref()
const form = ref<DeptForm>({
  parentId: 0,
  deptName: '',
  orderNum: 0,
  status: '0'
})

const rules = {
  deptName: [
    { required: true, message: '请输入部门名称', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '请输入显示排序', trigger: 'blur' }
  ],
  parentId: [
    { required: true, message: '请选择上级部门', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
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
    loading.value = false
    if (res.code === 200) {
      ElNotification({
        title: '添加成功',
        type: 'success',
        duration: 2500
      })
      dialog.value = false
      emit('refresh')
      return
    }
    ElNotification({
      title: res.msg || '添加失败',
      type: 'error',
      duration: 2500
    })
  }).catch(() => {
    loading.value = false
  })
}

function doEdit() {
  update(form.value).then((res) => {
    loading.value = false
    if (res.code === 200) {
      resetForm()
      ElNotification({
        title: '修改成功',
        type: 'success',
        duration: 2500
      })
      emit('refresh')
    } else {
      ElNotification({
        title: res.msg || '修改失败',
        type: 'error',
        duration: 2500
      })
    }
  }).catch(() => {
    loading.value = false
  })
}

function initForm(data?: Dept) {
  if (!data) {
    form.value = {
      parentId: 0,
      deptName: '',
      orderNum: 0,
      status: '0'
    }
  } else {
    form.value = {
      deptId: data.deptId,
      parentId: data.parentId || 0,
      deptName: data.deptName,
      orderNum: data.orderNum || 0,
      leader: data.leader,
      phone: data.phone,
      email: data.email,
      status: data.status || '0'
    }
  }
}

function resetForm() {
  dialog.value = false
  loading.value = false
  formRef.value?.resetFields()
  initForm()
}

defineExpose({
  dialog,
  initForm,
  resetForm
})
</script>
