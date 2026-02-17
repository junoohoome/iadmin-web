<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="searchName"
        placeholder="请输入用户名称"
        clearable
        style="width: 240px"
        class="filter-item"
        @keyup.enter="handleSearch"
      />
      <el-button class="filter-item" type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      <el-button class="filter-item" :icon="Refresh" @click="handleRefresh">重置</el-button>
    </div>

    <el-table v-loading="loading" :data="filteredList">
      <el-table-column label="会话编号" align="center" prop="token" :show-overflow-tooltip="true" />
      <el-table-column label="用户名称" align="center" prop="username" />
      <el-table-column label="用户昵称" align="center" prop="nickName" />
      <el-table-column label="部门" align="center" prop="deptName" />
      <el-table-column label="主机" align="center" prop="ipaddr" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="浏览器" align="center" prop="browser" :show-overflow-tooltip="true" />
      <el-table-column label="操作系统" align="center" prop="os" />
      <el-table-column label="登录时间" align="center" prop="loginTime" width="180">
        <template #default="{ row }">
          <span>{{ formatTime(row.loginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后访问" align="center" prop="lastAccessTime" width="180">
        <template #default="{ row }">
          <span>{{ formatTime(row.lastAccessTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template #default="{ row }">
          <el-button
            v-if="checkPermission(['admin', 'monitor:online:forceLogout'])"
            size="small"
            type="danger"
            @click="handleForceLogout(row)"
          >
            强退
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { list as listOnline, forceLogout } from '@/api/online'
import checkPermission from '@/utils/permission'

interface OnlineUser {
  token: string
  userId: number
  username: string
  nickName: string
  deptId: number
  deptName: string
  ipaddr: string
  loginLocation: string
  browser: string
  os: string
  loginTime: string
  lastAccessTime: string
}

const loading = ref(true)
const list = ref<OnlineUser[]>([])
const searchName = ref('')

// 过滤后的列表
const filteredList = computed(() => {
  if (!searchName.value) {
    return list.value
  }
  return list.value.filter((item) =>
    item.username.toLowerCase().includes(searchName.value.toLowerCase())
  )
})

onMounted(() => {
  getList()
})

/** 查询在线用户列表 */
function getList() {
  loading.value = true
  listOnline()
    .then((response) => {
      list.value = response.data
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/** 格式化时间 */
function formatTime(time: string) {
  if (!time) return ''
  return time.replace('T', ' ')
}

/** 搜索按钮操作 */
function handleSearch() {
  // 前端过滤，不需要重新请求
}

/** 重置按钮操作 */
function handleRefresh() {
  searchName.value = ''
  getList()
}

/** 强制退下按钮操作 */
function handleForceLogout(row: OnlineUser) {
  ElMessageBox.confirm('是否确认强制用户"' + row.username + '"下线?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return forceLogout(row.token)
    })
    .then(() => {
      getList()
      ElNotification({
        title: '成功',
        message: '强制下线成功',
        type: 'success',
        duration: 2000
      })
    })
}
</script>
