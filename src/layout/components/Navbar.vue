<template>
  <div class="navbar">
    <Hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggle-click="toggleSideBar"
    />

    <Breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device !== 'mobile'">
        <HeaderSearch id="header-search" class="right-menu-item hover-effect" />

        <Screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <SizeSelect id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click" @command="handleCommand">
        <div class="avatar-wrapper">
          <el-avatar :src="avatar" class="user-avatar" />
          <CaretBottom class="el-icon-caret-bottom" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="setting">
              布局设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CaretBottom } from '@element-plus/icons-vue'
import { useUserStore, useAppStore, useSettingsStore } from '@/stores'
import { removeToken } from '@/utils/auth'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import Screenfull from '@/components/Screenfull/index.vue'
import SizeSelect from '@/components/SizeSelect/index.vue'
import HeaderSearch from '@/components/HeaderSearch/index.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()
const settingsStore = useSettingsStore()

const sidebar = computed(() => appStore.sidebar)
const device = computed(() => appStore.device)
const avatar = computed(() => userStore.avatar)

const setting = computed({
  get: () => settingsStore.showSettings,
  set: (val) => {
    settingsStore.changeSetting({
      key: 'showSettings',
      value: val
    })
  }
})

const toggleSideBar = () => {
  appStore.toggleSidebar()
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile/index')
      break
    case 'setting':
      setting.value = true
      break
    case 'logout':
      logout()
      break
  }
}

const logout = async () => {
  try {
    await userStore.logout()
    removeToken()
    router.push(`/login?redirect=${route.fullPath}`)
  } catch (error) {
    ElMessage.error('退出登录失败')
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: middle;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
