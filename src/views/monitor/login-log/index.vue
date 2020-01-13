<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.account"
        placeholder="请输入用户账号"
        clearable
        style="width: 240px;"
        class="filter-item"
        @keyup.enter.native="handleQuery"
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
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
      <el-button class="filter-item" icon="el-icon-refresh" @click="resetQuery">重置</el-button>

      <el-button
        v-permission="['admin','loginlog:remove']"
        type="danger"
        icon="el-icon-delete"
        :disabled="multiple"
        class="filter-item"
        @click="handleDelete"
      >删除
      </el-button>
      <el-button
        v-permission="['admin','loginlog:remove']"
        type="danger"
        icon="el-icon-delete"
        class="filter-item"
        @click="handleClean"
      >清空
      </el-button>
      <el-button
      v-permission="['admin','loginlog:export']"
      type="warning"
      icon="el-icon-download"
      class="filter-item"
      @click="handleExport"
      >导出
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户账号" align="center" prop="account" />
      <el-table-column label="登录地址" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column label="操作信息" align="center" prop="msg" />
      <el-table-column label="登录状态" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="登录日期" align="center" prop="loginTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { list, delLoginlog, cleanLoginlog, exportLoginlog } from '@/api/login-log'
import { parseTime, downloadFile } from '@/utils/index'
import Pagination from '@/components/Pagination'
import { getDateshortcuts, addDateRange } from '@/utils/dateutils'

export default {
  components: { Pagination },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 时间控件快捷键选项
      pickerOptions: getDateshortcuts(),
      // 表格数据
      list: [],
      // 状态数据字典
      statusOptions: [],
      // 日期参数
      dateRange: [],
      // 查询参数
      queryParams: {
        page: 1,
        limit: 10,
        account: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    downloadFile,
    parseTime,
    /** 查询登录日志列表 */
    getList() {
      this.loading = true
      list(addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.list = response.data.data
        this.total = response.data.total
        this.loading = false
      }
      )
    },
    // 登录状态字典翻译
    statusFormat(row, column) {
      return row.status === '0' ? '成功' : '失败'
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除访问编号为"' + ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delLoginlog(ids)
      }).then(() => {
        this.getList()
        this.$notify({
          title: '删除成功',
          type: 'success',
          duration: 2000
        })
      }).catch(function() {
      })
    },
    /** 清空按钮操作 */
    handleClean() {
      this.$confirm('是否确认清空所有登录日志数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return cleanLoginlog()
      }).then(() => {
        this.getList()
        this.$notify({
          title: '清空成功',
          type: 'success',
          duration: 2000
        })
      }).catch(function() {
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有操作日志数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return exportLoginlog(queryParams)
      }).then(response => {
        this.downloadFile(response, '登录日志数据', 'xlsx')
      }).catch(function() {
      })
    }
  }
}
</script>

