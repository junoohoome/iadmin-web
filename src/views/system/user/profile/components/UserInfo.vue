<template>
  <el-form ref="formRef" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="用户昵称" prop="username">
      <el-input v-model="user.username" />
    </el-form-item>
    <el-form-item label="手机号码" prop="mobile">
      <el-input v-model="user.mobile" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="user.email" maxlength="50" />
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
import { updateUserProfile } from '@/api/user'
import { useTagsViewStore } from '@/stores/tagsView'

interface User {
  username?: string
  mobile?: string
  email?: string
}

interface Props {
  user: User
}

const props = defineProps<Props>()

const router = useRouter()
const tagsViewStore = useTagsViewStore()
const formRef = ref()

const user = reactive<User>({
  username: props.user.username,
  mobile: props.user.mobile,
  email: props.user.email
})

const rules = {
  username: [
    { required: true, message: '用户昵称不能为空', trigger: 'blur' },
    { min: 2, max: 32, message: '长度在 2 到 32 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  mobile: [
    { required: true, message: '手机号码不能为空', trigger: 'blur' },
    { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

function submit() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      updateUserProfile(user).then((response) => {
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
