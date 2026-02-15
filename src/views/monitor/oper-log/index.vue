<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.title"
        placeholder="请输入系统模块"
        clearable
        style="width: 240px"
        class="filter-item"
        @keyup.enter="handleQuery"
      />
      <el-input
        v-model="queryParams.operName"
        placeholder="请输入操作人员"
        clearable
        style="width: 240px"
        class="filter-item"
        @keyup.enter="handleQuery"
      />
      <el-date-picker
        v-model="dateRange"
        style="width: 240px"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="datetimerange"
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        class="filter-item"
      />
      <el-button class="filter-item" type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
      <el-button class="filter-item" :icon="Refresh" @click="resetQuery">重置</el-button>
      <el-button
        v-if="checkPermission(['admin', 'operlog:remove'])"
        type="danger"
        :icon="Delete"
        :disabled="multiple"
        class="filter-item"
        @click="handleDelete"
      >
        删除
      </el-button>
      <el-button
        v-if="checkPermission(['admin', 'operlog:remove'])"
        type="danger"
        :icon="Delete"
        class="filter-item"
        @click="handleClean"
      >
        清空
      </el-button>
      <el-button
        v-if="checkPermission(['admin', 'operlog:export'])"
        type="warning"
        :icon="Download"
        class="filter-item"
        @click="handleExport"
      >
        导出
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="系统模块" align="center" prop="title" />
      <el-table-column label="操作类型" align="center" prop="businessType" :formatter="typeFormat" />
      <el-table-column label="请求方式" align="center" prop="requestMethod" />
      <el-table-column label="操作人员" align="center" prop="operName" />
      <el-table-column label="主机" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="操作状态" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="操作日期" align="center" prop="operTime" width="180">
        <template #default="{ row }">
          <span>{{ parseTime(row.operTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
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

    <!-- 操作日志详细 -->
    <el-dialog v-model="open" title="操作日志详细" width="700px">
      <el-form ref="formRef" :model="form" label-width="100px" size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作模块：">{{ form.title }} / 修改</el-form-item>
            <el-form-item label="登录信息："
              >{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
            <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">{{ form.operParam }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="返回参数：">{{ form.jsonResult }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作状态：">
              <div v-if="form.status === 0">正常</div>
              <div v-else-if="form.status === 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作时间：">{{ parseTime(form.operTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.status === 1" label="异常信息：">{{ form.errorMsg }}</el-form-item>
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
import { ElMessageBox, ElNotification } from 'element-plus'
import { Search, Refresh, Delete, Download } from '@element-plus/icons-vue'
import { list, delOperlog, cleanOperlog, exportOperlog } from '@/api/oper-log'
import { parseTime, downloadFile, getDateshortcuts, addDateRange } from '@/utils/index'
import Pagination from '@/components/Pagination/index.vue'
import checkPermission from '@/utils/permission'

interface QueryParams {
  page: number
  limit: number
  title?: string
  operName?: string
  businessType?: string
  status?: string
}

interface OperLog {
  id?: number
  title?: string
  businessType?: string
  requestMethod?: string
  operName?: string
  operIp?: string
  operLocation?: string
  operUrl?: string
  method?: string
  operParam?: string
  jsonResult?: string
  status?: number
  operTime?: string
  errorMsg?: string
}

const loading = ref(true)
const ids = ref<number[]>([])
const multiple = ref(true)
const total = ref(0)
const list = ref<OperLog[]>([])
const pickerOptions = getDateshortcuts()
const open = ref(false)
const form = ref<OperLog>({})
const dateRange = ref<[Date, Date] | []>([])
const queryParams = ref<QueryParams>({
  page: 1,
  limit: 10,
  title: undefined,
  operName: undefined,
  businessType: undefined,
  status: undefined
})

onMounted(() => {
  getList()
})

/** 查询操作日志 */
function getList() {
  loading.value = true
  list(addDateRange(queryParams.value, dateRange.value)).then((response) => {
    list.value = response.data.records
    total.value = response.data.total
    loading.value = false
  })
}

// 操作日志状态字典翻译
function statusFormat(row: OperLog) {
  return row.status === 0 ? '成功' : '失败'
}

// 操作日志类型字典翻译
function typeFormat(row: OperLog) {
  return row.businessType === '1' ? '新增' : '修改'
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.page = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection: OperLog[]) {
  ids.value = selection.map((item) => item.id!)
  multiple.value = !selection.length
}

/** 详细按钮操作 */
function handleView(row: OperLog) {
  open.value = true
  form.value = row
}

/** 删除按钮操作 */
function handleDelete(row?: OperLog) {
  const operIds = row?.id || ids.value
  ElMessageBox.confirm('是否确认删除日志编号为"' + operIds + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return delOperlog(operIds)
    })
    .then(() => {
      getList()
      ElNotification({
        title: '删除成功',
        type: 'success',
        duration: 2000
      })
    })
}

/** 清空按钮操作 */
function handleClean() {
  ElMessageBox.confirm('是否确认清空所有操作日志数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return cleanOperlog()
    })
    .then(() => {
      getList()
      ElNotification({
        title: '清空成功',
        type: 'success',
        duration: 2000
      })
    })
}

/** 导出按钮操作 */
function handleExport() {
  const requestParams = queryParams.value
  ElMessageBox.confirm('是否确认导出所有操作日志数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return exportOperlog(requestParams)
    })
    .then((response) => {
      downloadFile(response, '操作日志数据', 'xlsx')
    })
}
</script>
