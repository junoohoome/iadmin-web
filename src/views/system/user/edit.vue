<template>
  <el-dialog v-model="dialog" :title="isAdd ? '新增用户' : '编辑用户'" append-to-body width="760px" @close="cancel">
    <el-form ref="formRef" :model="form" :inline="true" :rules="rules" label-width="120px">
      <el-form-item label="用户账号" prop="userName">
        <el-input v-model="form.userName" placeholder="请输入登录账号" :disabled="!isAdd" />
      </el-form-item>
      <el-form-item v-if="isAdd" label="用户密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入登录密码" />
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickName">
        <el-input v-model="form.nickName" placeholder="请输入用户姓名" />
      </el-form-item>
      <el-form-item label="联系电话" prop="mobile">
        <el-input v-model="form.mobile" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="电子邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入电子邮箱" />
      </el-form-item>
      <el-form-item label="用户状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择用户状态" style="width: 184px">
          <el-option
            v-for="item in statusOptions"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用户角色" prop="roles">
        <el-select v-model="form.roleIds" placeholder="请选择用户角色" multiple style="width: 184px">
          <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.text"
            :value="item.value.toString()"
          />
        </el-select>
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
import { addUser, updateUser } from '@/api/user'
import { getRoleOptions } from '@/api/role'
import type { DictItem } from '@/types'

interface RoleOption {
  value: string
  text: string
}

interface UserForm {
  userId?: string
  userName?: string
  nickName?: string
  password?: string
  mobile?: string
  email?: string
  status?: string
  roleIds?: string[]
}

interface Props {
  isAdd: boolean
  statusOptions: DictItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'refresh': []
}>()

const dialog = ref(false)
const loading = ref(false)
const roleOptions = ref<RoleOption[]>([])
const formRef = ref()
const form = ref<UserForm>({})

const rules = {
  nickName: [
    { required: true, message: '请输入用户姓名', trigger: 'blur' },
    { min: 3, max: 16, message: '长度在3-16个字符以内', trigger: 'change' }
  ],
  userName: [
    { required: true, message: '请输入用户账号', trigger: 'blur' },
    { min: 3, max: 16, message: '长度在3-16个字符以内', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入用户密码', trigger: 'blur' },
    { min: 6, message: '至少6位字符', trigger: 'change' }
  ],
  mobile: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
  roleIds: [{ required: true, message: '请选择用户角色', trigger: 'blur' }]
}

getRoleOptions().then((response) => {
  roleOptions.value = response.data
})

function cancel() {
  resetForm()
}

function doSubmit() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      const submitForm = { ...form.value, roleIds: (form.value.roleIds || []).join(',') }
      if (props.isAdd) {
        doAdd(submitForm)
      } else {
        doEdit(submitForm)
      }
    } else {
      return false
    }
  })
}

function doAdd(data: any) {
  addUser(data).then((res) => {
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
      title: res.msg,
      type: 'error',
      duration: 2500
    })
  })
}

function doEdit(data: any) {
  updateUser(data).then((res) => {
    if (res.code === 200) {
      resetForm()
      ElNotification({
        title: '修改成功',
        type: 'success',
        duration: 2500
      })
      emit('refresh')
    }
    loading.value = false
  })
}

function initForm(data?: any) {
  if (!data) {
    data = {}
  }
  const roleIds: string[] = []
  if (data.roleIds && data.roleIds.length > 0) {
    roleIds.push(...data.roleIds.split(','))
  }
  form.value = {
    userId: data.userId,
    userName: data.userName,
    nickName: data.nickName,
    password: data.password,
    mobile: data.mobile,
    email: data.email,
    status: data.status,
    roleIds: roleIds
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
