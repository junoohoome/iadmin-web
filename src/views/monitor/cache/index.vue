<template>
  <div class="app-container">
    <!-- 统计信息卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #40c9c6">
              <el-icon><Key /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalKeys }}</div>
              <div class="stat-label">缓存键总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #36a3f7">
              <el-icon><Coin /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatMemory(stats.memory?.used_memory) }}</div>
              <div class="stat-label">已用内存</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #f4516c">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatMemory(stats.memory?.used_memory_peak) }}</div>
              <div class="stat-label">内存峰值</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和操作栏 -->
    <div class="filter-container">
      <el-input
        v-model="searchPattern"
        placeholder="请输入键名前缀（支持 * 通配符）"
        clearable
        style="width: 300px"
        class="filter-item"
        @keyup.enter="handleSearch"
      />
      <el-button class="filter-item" type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      <el-button class="filter-item" :icon="Refresh" @click="handleRefresh">重置</el-button>
      <el-button
        v-if="checkPermission(['admin', 'monitor:cache:remove'])"
        type="danger"
        :icon="Delete"
        :disabled="multiple"
        class="filter-item"
        @click="handleDelete"
      >
        删除
      </el-button>
      <el-button
        v-if="checkPermission(['admin', 'monitor:cache:remove'])"
        type="danger"
        :icon="Delete"
        class="filter-item"
        @click="handleClear"
      >
        清空全部
      </el-button>
    </div>

    <!-- 缓存列表 -->
    <el-table v-loading="loading" :data="cacheList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="键名" align="left" prop="key" :show-overflow-tooltip="true" />
      <el-table-column label="类型" align="center" prop="type" width="100">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="TTL(秒)" align="center" prop="ttl" width="100">
        <template #default="{ row }">
          <span v-if="row.ttl === -1">永不过期</span>
          <span v-else-if="row.ttl === -2">已过期</span>
          <span v-else>{{ row.ttl }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
        <template #default="{ row }">
          <el-button size="small" @click="handleView(row)">详细</el-button>
          <el-button
            v-if="checkPermission(['admin', 'monitor:cache:remove'])"
            size="small"
            type="danger"
            @click="handleDeleteSingle(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 缓存详细对话框 -->
    <el-dialog v-model="detailOpen" title="缓存详细信息" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="键名">{{ detailInfo.key }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="getTypeTagType(detailInfo.type)">{{ detailInfo.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="TTL">
          <span v-if="detailInfo.ttl === -1">永不过期</span>
          <span v-else-if="detailInfo.ttl === -2">已过期</span>
          <span v-else>{{ detailInfo.ttl }} 秒</span>
        </el-descriptions-item>
        <el-descriptions-item label="大小">{{ detailInfo.size }} 字节</el-descriptions-item>
        <el-descriptions-item label="值">
          <div class="cache-value">{{ detailInfo.value }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import { Key, Coin, Warning, Search, Refresh, Delete } from '@element-plus/icons-vue'
import {
  list as listCache,
  getCacheInfo,
  getStats,
  delCache,
  delBatch,
  clearCache,
  type CacheInfo,
  type CacheStats
} from '@/api/cache'
import checkPermission from '@/utils/permission'

const loading = ref(true)
const multiple = ref(true)
const cacheList = ref<CacheInfo[]>([])
const selectedKeys = ref<string[]>([])
const searchPattern = ref('')
const stats = ref<CacheStats>({
  totalKeys: 0,
  keyTypes: {},
  memory: {}
})
const detailOpen = ref(false)
const detailInfo = ref<CacheInfo>({
  key: '',
  type: '',
  ttl: 0,
  value: '',
  size: 0
})

onMounted(() => {
  getList()
  getStatsInfo()
})

/** 查询缓存列表 */
function getList() {
  loading.value = true
  listCache()
    .then((response) => {
      cacheList.value = response.data
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/** 查询统计信息 */
function getStatsInfo() {
  getStats().then((response) => {
    stats.value = response.data
  })
}

/** 格式化内存大小（转换为 MB） */
function formatMemory(memory: string | undefined) {
  if (!memory) return '0 MB'
  const bytes = parseInt(memory, 10)
  if (isNaN(bytes) || bytes === 0) return '0 MB'
  const mb = bytes / (1024 * 1024)
  return mb.toFixed(2) + ' MB'
}

/** 根据类型获取标签样式 */
function getTypeTagType(type: string) {
  const typeMap: Record<string, string> = {
    string: 'success',
    list: 'primary',
    set: 'warning',
    zset: 'danger',
    hash: 'info'
  }
  return typeMap[type] || 'info'
}

/** 搜索按钮操作 */
function handleSearch() {
  if (!searchPattern.value) {
    getList()
    return
  }
  // 前端过滤
  loading.value = true
  listCache()
    .then((response) => {
      const pattern = searchPattern.value.replace(/\*/g, '.*')
      const regex = new RegExp(pattern, 'i')
      cacheList.value = response.data.filter((item: CacheInfo) => regex.test(item.key))
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/** 重置按钮操作 */
function handleRefresh() {
  searchPattern.value = ''
  getList()
  getStatsInfo()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: CacheInfo[]) {
  selectedKeys.value = selection.map((item) => item.key)
  multiple.value = !selection.length
}

/** 查看缓存详细 */
function handleView(row: CacheInfo) {
  getCacheInfo(row.key).then((response) => {
    detailInfo.value = response.data
    detailOpen.value = true
  })
}

/** 删除单个缓存 */
function handleDeleteSingle(row: CacheInfo) {
  ElMessageBox.confirm('是否确认删除键名为"' + row.key + '"的缓存?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return delCache(row.key)
    })
    .then(() => {
      getList()
      getStatsInfo()
      ElNotification({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
    })
}

/** 批量删除缓存 */
function handleDelete() {
  ElMessageBox.confirm('是否确认删除选中的 ' + selectedKeys.value.length + ' 个缓存?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return delBatch(selectedKeys.value)
    })
    .then(() => {
      getList()
      getStatsInfo()
      ElNotification({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
    })
}

/** 清空所有缓存 */
function handleClear() {
  ElMessageBox.confirm('是否确认清空所有缓存? 此操作不可恢复!', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return clearCache()
    })
    .then(() => {
      getList()
      getStatsInfo()
      ElNotification({
        title: '成功',
        message: '清空成功',
        type: 'success',
        duration: 2000
      })
    })
}
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  padding: 10px;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}
.stat-info {
  margin-left: 16px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}
.cache-value {
  max-height: 300px;
  overflow-y: auto;
  word-break: break-all;
  white-space: pre-wrap;
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
}
</style>
