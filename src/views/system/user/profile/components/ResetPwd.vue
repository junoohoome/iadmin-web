<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="form.oldPassword" placeholder="请输入旧密码" type="password" />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="form.newPassword" placeholder="请输入新密码" type="password" />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="form.confirmPassword" placeholder="请确认密码" type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="small" @click="submit">保存</el-button>
      <el-button type="danger" size="small" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { updateUserPwd } from '@/api/user'
import { useTagsViewStore } from '@/stores/tagsView'

interface User {
  oldPassword?: string
  newPassword?: string
  confirmPassword?: string
}

interface Props {
  user: User
}

defineProps<Props>()

const router = useRouter()
const tagsViewStore = useTagsViewStore()
const formRef = ref()

const form = reactive<User>({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
})

const equalToPassword = (_rule: any, value: string, callback: any) => {
  if (form.newPassword !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { validator: equalToPassword, trigger: 'blur' }
  ]
}

function submit() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      updateUserPwd(form.oldPassword, form.newPassword).then((response) => {
        if (response.code === 200) {
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
      })
    }
  })
}

function close() {
  tagsViewStore.delView(router.currentRoute.value)
  router.push({ path: '/index' })
}
</script>
