<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.jobName"
        placeholder="请输入任务名称"
        clearable
        style="width: 200px"
        class="filter-item"
        @keyup.enter="handleQuery"
      />
      <el-select
        v-model="queryParams.jobGroup"
        placeholder="任务分组"
        clearable
        style="width: 150px"
        class="filter-item"
      >
        <el-option label="默认" value="DEFAULT" />
        <el-option label="系统" value="SYSTEM" />
      </el-select>
      <el-select
        v-model="queryParams.status"
        placeholder="执行状态"
        clearable
        style="width: 150px"
        class="filter-item"
      >
        <el-option label="成功" value="0" />
        <el-option label="失败" value="1" />
      </el-select>
      <el-button class="filter-item" type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
      <el-button class="filter-item" :icon="Refresh" @click="resetQuery">重置</el-button>
      <el-button
        v-if="checkPermission(['admin', 'monitor:job:remove'])"
        type="danger"
        :icon="Delete"
        :disabled="multiple"
        class="filter-item"
        @click="handleDelete"
      >
        删除
      </el-button>
      <el-button
        v-if="checkPermission(['admin', 'monitor:job:remove'])"
        type="danger"
        :icon="Delete"
        class="filter-item"
        @click="handleClean"
      >
        清空
      </el-button>
      <el-button
        type="warning"
        :icon="Back"
        class="filter-item"
        @click="handleBack"
      >
        返回
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="日志编号" align="center" prop="jobLogId" width="80" />
      <el-table-column label="任务名称" align="center" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column label="任务分组" align="center" prop="jobGroup" />
      <el-table-column label="调用目标" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column label="日志信息" align="center" prop="jobMessage" :show-overflow-tooltip="true" />
      <el-table-column label="执行状态" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ row.status === '0' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="执行时间" align="center" prop="createTime" width="180">
        <template #default="{ row }">
          <span>{{ formatTime(row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template #default="{ row }">
          <el-button size="small" @click="handleView(row)">详细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.limit"
      :total="total"
      @pagination="getList"
    />

    <!-- 日志详细对话框 -->
    <el-dialog v-model="open" title="任务日志详细" width="700px">
      <el-form label-width="100px" size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item label="日志序号：">{{ form.jobLogId }}</el-form-item>
            <el-form-item label="任务名称：">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组：">{{ form.jobGroup }}</el-form-item>
            <el-form-item label="执行时间：">{{ formatTime(form.createTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用目标：">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="日志信息：">{{ form.jobMessage }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行状态：">
              <el-tag :type="form.status === '0' ? 'success' : 'danger'">
                {{ form.status === '0' ? '成功' : '失败' }}
              </el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.status === '1'" label="异常信息：">
              <div class="exception-info">{{ form.exceptionInfo }}</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElNotification } from 'element-plus'
import { Search, Refresh, Delete, Back } from '@element-plus/icons-vue'
import { list as listJobLog, getJobLog, delJobLog, cleanJobLog, type JobLog } from '@/api/job-log'
import Pagination from '@/components/Pagination/index.vue'
import checkPermission from '@/utils/permission'

const router = useRouter()

interface QueryParams {
  page: number
  limit: number
  jobName?: string
  jobGroup?: string
  status?: string
}

const loading = ref(true)
const multiple = ref(true)
const total = ref(0)
const list = ref<JobLog[]>([])
const open = ref(false)
const ids = ref<number[]>([])
const form = ref<JobLog>({
  jobLogId: 0,
  jobName: '',
  jobGroup: '',
  invokeTarget: '',
  jobMessage: '',
  status: '0',
  exceptionInfo: '',
  createTime: ''
})
const queryParams = ref<QueryParams>({
  page: 1,
  limit: 10,
  jobName: undefined,
  jobGroup: undefined,
  status: undefined
})

onMounted(() => {
  getList()
})

/** 查询任务日志列表 */
function getList() {
  loading.value = true
  listJobLog(queryParams.value).then((response) => {
    list.value = response.data.records
    total.value = response.data.total
    loading.value = false
  })
}

/** 格式化时间 */
function formatTime(time: string) {
  if (!time) return ''
  return time.replace('T', ' ')
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.page = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  queryParams.value = {
    page: 1,
    limit: 10,
    jobName: undefined,
    jobGroup: undefined,
    status: undefined
  }
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: JobLog[]) {
  ids.value = selection.map((item) => item.jobLogId)
  multiple.value = !selection.length
}

/** 查看详细 */
function handleView(row: JobLog) {
  getJobLog(row.jobLogId).then((response) => {
    form.value = response.data
    open.value = true
  })
}

/** 删除按钮操作 */
function handleDelete(row?: JobLog) {
  const jobLogIds = row?.jobLogId || ids.value
  ElMessageBox.confirm(`是否确认删除日志编号为"${jobLogIds}"的数据项?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      return delJobLog(Array.isArray(jobLogIds) ? jobLogIds : [jobLogIds])
    })
    .then(() => {
      getList()
      ElNotification({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
    })
}

/** 清空按钮操作 */
function handleClean() {
  ElMessageBox.confirm('是否确认清空所有任务日志数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      return cleanJobLog()
    })
    .then(() => {
      getList()
      ElNotification({
        title: '成功',
        message: '清空成功',
        type: 'success',
        duration: 2000
      })
    })
}

/** 返回按钮 */
function handleBack() {
  router.push('/monitor/job/')
}
</script>

<style scoped>
.exception-info {
  max-height: 300px;
  overflow-y: auto;
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
