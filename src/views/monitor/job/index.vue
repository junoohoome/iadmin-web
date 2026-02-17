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
        placeholder="任务状态"
        clearable
        style="width: 150px"
        class="filter-item"
      >
        <el-option label="正常" value="0" />
        <el-option label="暂停" value="1" />
      </el-select>
      <el-button class="filter-item" type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
      <el-button class="filter-item" :icon="Refresh" @click="resetQuery">重置</el-button>
      <el-button
        v-if="checkPermission(['admin', 'monitor:job:add'])"
        type="primary"
        :icon="Plus"
        class="filter-item"
        @click="handleAdd"
      >
        新增
      </el-button>
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
        type="info"
        :icon="List"
        class="filter-item"
        @click="handleJobLog"
      >
        日志
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务编号" align="center" prop="jobId" width="80" />
      <el-table-column label="任务名称" align="center" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column label="任务分组" align="center" prop="jobGroup" />
      <el-table-column label="调用目标" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column label="cron表达式" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="{ row }">
          <span>{{ formatTime(row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="{ row }">
          <el-button
            v-if="checkPermission(['admin', 'monitor:job:edit'])"
            size="small"
            link
            type="primary"
            @click="handleEdit(row)"
          >
            修改
          </el-button>
          <el-button
            v-if="checkPermission(['admin', 'monitor:job:remove'])"
            size="small"
            link
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
          <el-button
            v-if="checkPermission(['admin', 'monitor:job:run'])"
            size="small"
            link
            type="warning"
            @click="handleRun(row)"
          >
            执行一次
          </el-button>
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

    <!-- 新增/修改任务对话框 -->
    <el-dialog v-model="open" :title="title" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="任务名称" prop="jobName">
          <el-input v-model="form.jobName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务分组" prop="jobGroup">
          <el-select v-model="form.jobGroup" placeholder="请选择任务分组">
            <el-option label="默认" value="DEFAULT" />
            <el-option label="系统" value="SYSTEM" />
          </el-select>
        </el-form-item>
        <el-form-item label="调用目标" prop="invokeTarget">
          <el-input v-model="form.invokeTarget" placeholder="请输入调用目标字符串" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="cron表达式" prop="cronExpression">
          <el-input v-model="form.cronExpression" placeholder="请输入cron表达式" />
        </el-form-item>
        <el-form-item label="执行策略" prop="misfirePolicy">
          <el-radio-group v-model="form.misfirePolicy">
            <el-radio label="1">立即执行</el-radio>
            <el-radio label="2">执行一次</el-radio>
            <el-radio label="3">放弃执行</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否并发" prop="concurrent">
          <el-radio-group v-model="form.concurrent">
            <el-radio label="0">允许</el-radio>
            <el-radio label="1">禁止</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">暂停</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElNotification } from 'element-plus'
import { Search, Refresh, Plus, Delete, List } from '@element-plus/icons-vue'
import { list as listJob, getJob, addJob, updateJob, delJob, changeStatus, runJob, type Job, type JobFormData } from '@/api/job'
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
const list = ref<Job[]>([])
const open = ref(false)
const title = ref('')
const ids = ref<number[]>([])
const form = ref<JobFormData>({
  jobId: undefined,
  jobName: '',
  jobGroup: 'DEFAULT',
  invokeTarget: '',
  cronExpression: '',
  misfirePolicy: '1',
  concurrent: '1',
  status: '0'
})
const queryParams = ref<QueryParams>({
  page: 1,
  limit: 10,
  jobName: undefined,
  jobGroup: undefined,
  status: undefined
})

const rules = {
  jobName: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
  jobGroup: [{ required: true, message: '任务分组不能为空', trigger: 'blur' }],
  invokeTarget: [{ required: true, message: '调用目标不能为空', trigger: 'blur' }],
  cronExpression: [{ required: true, message: 'cron表达式不能为空', trigger: 'blur' }]
}

onMounted(() => {
  getList()
})

/** 查询定时任务列表 */
function getList() {
  loading.value = true
  listJob(queryParams.value).then((response) => {
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
function handleSelectionChange(selection: Job[]) {
  ids.value = selection.map((item) => item.jobId)
  multiple.value = !selection.length
}

/** 任务状态修改 */
function handleStatusChange(row: Job) {
  const text = row.status === '0' ? '启用' : '停用'
  ElMessageBox.confirm(`确认要${text}${row.jobName}任务吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      return changeStatus({ jobId: row.jobId, status: row.status })
    })
    .then(() => {
      ElNotification({
        title: '成功',
        message: `${text}成功`,
        type: 'success',
        duration: 2000
      })
    })
    .catch(() => {
      row.status = row.status === '0' ? '1' : '0'
    })
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '新增定时任务'
}

/** 修改按钮操作 */
function handleEdit(row: Job) {
  reset()
  getJob(row.jobId).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改定时任务'
  })
}

/** 表单重置 */
function reset() {
  form.value = {
    jobId: undefined,
    jobName: '',
    jobGroup: 'DEFAULT',
    invokeTarget: '',
    cronExpression: '',
    misfirePolicy: '1',
    concurrent: '1',
    status: '0'
  }
}

/** 提交按钮 */
function submitForm() {
  // @ts-ignore
  const formEl = document.querySelector('form')
  // 简化验证
  if (!form.value.jobName || !form.value.invokeTarget || !form.value.cronExpression) {
    ElNotification({
      title: '错误',
      message: '请填写必填项',
      type: 'error',
      duration: 2000
    })
    return
  }

  if (form.value.jobId) {
    updateJob(form.value).then(() => {
      ElNotification({
        title: '成功',
        message: '修改成功',
        type: 'success',
        duration: 2000
      })
      open.value = false
      getList()
    })
  } else {
    addJob(form.value).then(() => {
      ElNotification({
        title: '成功',
        message: '新增成功',
        type: 'success',
        duration: 2000
      })
      open.value = false
      getList()
    })
  }
}

/** 删除按钮操作 */
function handleDelete(row?: Job) {
  const jobIds = row?.jobId || ids.value
  ElMessageBox.confirm(`是否确认删除任务编号为"${jobIds}"的数据项?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      return delJob(Array.isArray(jobIds) ? jobIds : [jobIds])
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

/** 立即执行一次 */
function handleRun(row: Job) {
  ElMessageBox.confirm(`确认要立即执行一次"${row.jobName}"任务吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      return runJob(row.jobId)
    })
    .then(() => {
      ElNotification({
        title: '成功',
        message: '执行成功',
        type: 'success',
        duration: 2000
      })
    })
}

/** 任务日志 */
function handleJobLog() {
  router.push('/monitor/job-log/')
}
</script>
