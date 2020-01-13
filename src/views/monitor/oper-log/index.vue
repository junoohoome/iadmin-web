<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.title"
        placeholder="请输入系统模块"
        clearable
        style="width: 240px;"
        class="filter-item"
        @keyup.enter.native="handleQuery"
      />
      <el-input
        v-model="queryParams.operName"
        placeholder="请输入操作人员"
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
        v-permission="['admin','operlog:remove']"
        type="danger"
        icon="el-icon-delete"
        :disabled="multiple"
        class="filter-item"
        @click="handleDelete"
      >删除
      </el-button>
      <el-button
        v-permission="['admin','operlog:remove']"
        type="danger"
        icon="el-icon-delete"
        class="filter-item"
        @click="handleClean"
      >清空
      </el-button>
      <el-button
        v-permission="['admin','operlog:export']"
        type="warning"
        icon="el-icon-download"
        class="filter-item"
        @click="handleExport"
      >导出
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
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.operTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleView(scope.row,scope.index)"
          >详细
          </el-button>
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

    <!-- 操作日志详细 -->
    <el-dialog title="操作日志详细" :visible.sync="open" width="700px">
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作模块：">{{ form.title }} / 修改</el-form-item>
            <el-form-item
              label="登录信息："
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { list, delOperlog, cleanOperlog, exportOperlog } from '@/api/oper-log'
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
      // 表格数据
      list: [],
      // 时间控件快捷键选项
      pickerOptions: getDateshortcuts(),
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      typeOptions: [],
      // 类型数据字典
      statusOptions: [],
      // 表单参数
      form: {},
      // 日期参数
      dateRange: [],
      // 查询参数
      queryParams: {
        page: 1,
        limit: 10,
        title: undefined,
        operName: undefined,
        businessType: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    parseTime,
    downloadFile,
    /** 查询登录日志 */
    getList() {
      this.loading = true
      list(addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.list = response.data.data
        this.total = response.data.total
        this.loading = false
      })
    },
    // 操作日志状态字典翻译
    statusFormat(row, column) {
      return row.status === '0' ? '成功' : '失败'
    },
    // 操作日志类型字典翻译
    typeFormat(row, column) {
      return row.businessType === '1' ? '新增' : '修改'
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
    /** 详细按钮操作 */
    handleView(row) {
      this.open = true
      this.form = row
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const operIds = row.id || this.ids
      this.$confirm('是否确认删除日志编号为"' + operIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delOperlog(operIds)
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
      this.$confirm('是否确认清空所有操作日志数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return cleanOperlog()
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
        return exportOperlog(queryParams)
      }).then(response => {
        this.downloadFile(response, '操作日志数据', 'xlsx')
      }).catch(function() {
      })
    }
  }
}
</script>

