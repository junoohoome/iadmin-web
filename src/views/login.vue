<template>
  <div class="login">
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-position="left" label-width="0px" class="login-form">
      <h3 class="title">IAdmin后台管理</h3>
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" id="username" name="username" type="text" auto-complete="off" placeholder="账号">
          <template #prefix>
            <svg-icon icon-class="user" class="el-input__icon input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          id="password" name="password"
          type="password"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix>
            <svg-icon icon-class="password" class="el-input__icon input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <el-input
          v-model="loginForm.code"
          id="code" name="code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix>
            <svg-icon icon-class="validCode" class="el-input__icon input-icon" />
          </template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode">
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin: 0px 0px 25px 0px">
        记住我
      </el-checkbox>
      <el-form-item style="width: 100%">
        <el-button :loading="loading" type="primary" style="width: 100%" @click="handleLogin">
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div v-if="settingsStore.showFooter" id="el-login-footer">
      <span v-html="settingsStore.footerTxt" />
      <span> ⋅ </span>
      <a href="http://www.beian.miit.gov.cn" target="_blank">{{ settingsStore.caseNumber }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { encrypt } from '@/utils/rsaEncrypt'
import Config from '@/settings'
import { getCodeImg } from '@/api/login'
import Cookies from 'js-cookie'
import { useUserStore } from '@/stores'
import { useSettingsStore } from '@/stores'

interface LoginForm {
  username: string
  password: string
  rememberMe: boolean
  code: string
  uuid: string
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

const loginFormRef = ref()
const codeUrl = ref('')
const cookiePass = ref('')
const loading = ref(false)
const redirect = ref<string>('')

const loginForm = ref<LoginForm>({
  username: 'admin',
  password: 'admin123',
  rememberMe: false,
  code: '',
  uuid: ''
})

const loginRules = {
  username: [{ required: true, trigger: 'blur', message: '用户名不能为空' }],
  password: [{ required: true, trigger: 'blur', message: '密码不能为空' }],
  code: [{ required: true, trigger: 'change', message: '验证码不能为空' }]
}

watch(
  () => route.query,
  (query) => {
    redirect.value = (query.redirect as string) || ''
  },
  { immediate: true }
)

onMounted(() => {
  getCode()
  getCookie()
})

function getCode() {
  getCodeImg().then((res) => {
    const data = res.data
    codeUrl.value = data.img
    loginForm.value.uuid = data.uuid
  })
}

function getCookie() {
  const username = Cookies.get('username')
  const password = Cookies.get('password')
  const rememberMe = Cookies.get('rememberMe')
  // 保存cookie里面的加密后的密码（仅用于比较，不用于表单显示）
  cookiePass.value = password === undefined ? '' : password
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: loginForm.value.password, // 始终使用表单明文密码
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
    code: '',
    uuid: loginForm.value.uuid
  }
}

function handleLogin() {
  loginFormRef.value?.validate((valid: boolean) => {
    const user = {
      username: loginForm.value.username,
      password: loginForm.value.password,
      rememberMe: loginForm.value.rememberMe,
      code: loginForm.value.code,
      uuid: loginForm.value.uuid
    }

    if (user.password !== cookiePass.value) {
      user.password = encrypt(user.password)
    }

    if (valid) {
      loading.value = true
      if (user.rememberMe) {
        Cookies.set('username', user.username, { expires: Config.passCookieExpires })
        Cookies.set('password', user.password, { expires: Config.passCookieExpires })
        Cookies.set('rememberMe', String(user.rememberMe), { expires: Config.passCookieExpires })
      } else {
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }
      userStore
        .login(user)
        .then(() => {
          loading.value = false
          router.push({ path: redirect.value || '/' })
        })
        .catch(() => {
          loading.value = false
          getCode()
        })
    } else {
      console.log('error submit!!')
      return false
    }
  })
}
</script>

<style rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url(../assets/image/login.jpg);
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 385px;
  padding: 25px 25px 5px 25px;
  :deep(.el-input) {
    height: 38px;
    input {
      height: 38px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  display: inline-block;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
</style>
