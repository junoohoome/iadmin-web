<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.account"
        placeholder="请输入用户账号"
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
        v-permission="['admin', 'loginlog:remove']"
        type="danger"
        :icon="Delete"
        :disabled="multiple"
        class="filter-item"
        @click="handleDelete()"
      >
        删除
      </el-button>
      <el-button
        v-permission="['admin', 'loginlog:remove']"
        type="danger"
        :icon="Delete"
        class="filter-item"
        @click="handleClean"
      >
        清空
      </el-button>
      <el-button
        v-permission="['admin', 'loginlog:export']"
        type="warning"
        :icon="Download"
        class="filter-item"
        @click="handleExport"
      >
        导出
      </el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户账号" align="center" prop="account" />
      <el-table-column label="登录地址" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column label="操作信息" align="center" prop="msg" />
      <el-table-column label="登录状态" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="登录日期" align="center" prop="loginTime">
        <template #default="{ row }">
          <span>{{ parseTime(row.loginTime) }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import { Search, Refresh, Delete, Download } from '@element-plus/icons-vue'
import { list, delLoginlog, cleanLoginlog, exportLoginlog } from '@/api/login-log'
import { parseTime, downloadFile, getDateshortcuts, addDateRange } from '@/utils/index'
import Pagination from '@/components/Pagination/index.vue'

interface QueryParams {
  page: number
  limit: number
  account?: string
  status?: string
}

const loading = ref(true)
const ids = ref<number[]>([])
const multiple = ref(true)
const total = ref(0)
const pickerOptions = getDateshortcuts()
const tableData = ref<any[]>([])
const dateRange = ref<[Date, Date] | []>([])
const queryParams = ref<QueryParams>({
  page: 1,
  limit: 10,
  account: undefined,
  status: undefined
})

onMounted(() => {
  getList()
})

/** 查询登录日志列表 */
function getList() {
  loading.value = true
  list(addDateRange(queryParams.value, dateRange.value)).then((response) => {
    tableData.value = response.data.records
    total.value = response.data.total
    loading.value = false
  })
}

// 登录状态字典翻译
function statusFormat(row: any, column: any) {
  return row.status === '0' ? '成功' : '失败'
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
function handleSelectionChange(selection: any[]) {
  ids.value = selection.map((item) => item.id)
  multiple.value = !selection.length
}

/** 删除按钮操作 */
function handleDelete() {
  const idsToDelete = ids.value
  ElMessageBox.confirm('是否确认删除访问编号为"' + idsToDelete + '"的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return delLoginlog(idsToDelete)
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
  ElMessageBox.confirm('是否确认清空所有登录日志数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return cleanLoginlog()
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
      return exportLoginlog(requestParams)
    })
    .then((response) => {
      downloadFile(response, '登录日志数据', 'xlsx')
    })
}
</script>

<style lang="scss"></style>
