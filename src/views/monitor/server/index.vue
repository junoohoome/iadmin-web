<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- CPU 信息 -->
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>CPU</span>
              <el-button
                type="primary"
                :icon="Refresh"
                size="small"
                @click="handleRefresh"
              >
                刷新
              </el-button>
            </div>
          </template>
          <div v-loading="loading" class="card-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="核心数">{{ server.cpu?.cpuNum }}</el-descriptions-item>
              <el-descriptions-item label="用户使用率">{{ server.cpu?.used }}%</el-descriptions-item>
              <el-descriptions-item label="系统使用率">{{ server.cpu?.sys }}%</el-descriptions-item>
              <el-descriptions-item label="当前空闲率">{{ server.cpu?.free }}%</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <!-- 内存信息 -->
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>内存</span>
            </div>
          </template>
          <div v-loading="loading" class="card-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="总内存">{{ server.mem?.total }}</el-descriptions-item>
              <el-descriptions-item label="已用内存">{{ server.mem?.used }}</el-descriptions-item>
              <el-descriptions-item label="剩余内存">{{ server.mem?.free }}</el-descriptions-item>
              <el-descriptions-item label="使用率">
                <el-tag :type="getUsageTagType(server.mem?.usage)">{{ server.mem?.usage }}%</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <!-- JVM 信息 -->
      <el-col :span="24" style="margin-top: 20px">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>Java 虚拟机信息</span>
            </div>
          </template>
          <div v-loading="loading" class="card-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Java 版本">{{ server.jvm?.version }}</el-descriptions-item>
              <el-descriptions-item label="JVM 名称">{{ server.jvm?.name }}</el-descriptions-item>
              <el-descriptions-item label="JVM 最大内存">{{ server.jvm?.max }}</el-descriptions-item>
              <el-descriptions-item label="JVM 总内存">{{ server.jvm?.total }}</el-descriptions-item>
              <el-descriptions-item label="JVM 已用内存">{{ server.jvm?.used }}</el-descriptions-item>
              <el-descriptions-item label="JVM 空闲内存">{{ server.jvm?.free }}</el-descriptions-item>
              <el-descriptions-item label="JVM 使用率">
                <el-tag :type="getUsageTagType(server.jvm?.usage)">{{ server.jvm?.usage }}%</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="JVM 启动时间">{{ server.jvm?.startTime }}</el-descriptions-item>
              <el-descriptions-item label="JVM 运行时长">{{ server.jvm?.runTime }}</el-descriptions-item>
              <el-descriptions-item label="Java 安装路径">{{ server.jvm?.home }}</el-descriptions-item>
              <el-descriptions-item label="项目路径" :span="2">{{ server.sys?.userDir }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <!-- 服务器信息 -->
      <el-col :span="24" style="margin-top: 20px">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>服务器信息</span>
            </div>
          </template>
          <div v-loading="loading" class="card-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="服务器名称">{{ server.sys?.computerName }}</el-descriptions-item>
              <el-descriptions-item label="服务器 IP">{{ server.sys?.computerIp }}</el-descriptions-item>
              <el-descriptions-item label="操作系统">{{ server.sys?.osName }}</el-descriptions-item>
              <el-descriptions-item label="系统架构">{{ server.sys?.osArch }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <!-- 磁盘信息 -->
      <el-col :span="24" style="margin-top: 20px">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>磁盘信息</span>
            </div>
          </template>
          <div v-loading="loading" class="card-content">
            <el-table :data="server.sysFiles" border style="width: 100%">
              <el-table-column prop="dirName" label="盘符路径" />
              <el-table-column prop="typeName" label="文件系统" />
              <el-table-column prop="sysTypeName" label="盘符类型" />
              <el-table-column prop="total" label="总大小" />
              <el-table-column prop="free" label="可用大小" />
              <el-table-column prop="used" label="已用大小" />
              <el-table-column prop="usage" label="已用占比">
                <template #default="{ row }">
                  <el-tag :type="getUsageTagType(row.usage)">{{ row.usage }}%</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getServerInfo, type ServerInfo } from '@/api/server'

const loading = ref(true)
const server = ref<ServerInfo>({
  cpu: { cpuNum: 0, total: 0, sys: 0, used: 0, wait: 0, free: 0 },
  mem: { total: '', used: '', free: '', usage: 0 },
  jvm: { total: '', max: '', free: '', version: '', home: '', name: '', usage: 0, used: '', startTime: '', runTime: '', inputArgs: '' },
  sys: { computerName: '', computerIp: '', osName: '', osArch: '', userDir: '' },
  sysFiles: []
})

let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  getList()
  // 每 30 秒自动刷新
  refreshTimer = setInterval(() => {
    getList(false)
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

/** 查询服务器信息 */
function getList(showLoading = true) {
  if (showLoading) {
    loading.value = true
  }
  getServerInfo()
    .then((response) => {
      server.value = response.data
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/** 刷新按钮操作 */
function handleRefresh() {
  getList()
}

/** 根据使用率获取标签类型 */
function getUsageTagType(usage: number | undefined) {
  if (!usage) return 'success'
  if (usage < 50) return 'success'
  if (usage < 80) return 'warning'
  return 'danger'
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-content {
  min-height: 100px;
}
</style>
