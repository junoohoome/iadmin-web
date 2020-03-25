<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="filter-container">
      <el-input v-model="queryParams.account" clearable placeholder="请输入用户账号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleQuery" />
      <el-select v-model="queryParams.status" clearable placeholder="请输入状态" class="filter-item" style="width: 130px">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.text" :value="item.value" />
      </el-select>
      <el-button class="filter-item" type="success" icon="el-icon-search" @click="handleQuery">
        搜索
      </el-button>
      <el-button v-permission="['admin','system:user:add']" class="filter-item" type="primary" icon="el-icon-plus" @click="handleAdd">
        新增
      </el-button>
      <el-button v-permission="['admin','system:user:delete']" class="filter-item" type="danger" icon="el-icon-delete" :disabled="multiple" @click="handleDelete">
        删除
      </el-button>
    </div>

    <el-table v-loading="loading" :data="data" style="width: 100%;" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="用户账号" prop="userName" align="center" />
      <el-table-column label="用户名称" prop="nickName" align="center" />
      <el-table-column label="手机号码" prop="mobile" />
      <el-table-column label="用户邮箱" prop="email" align="center" />
<!--      <el-table-column label="角色" prop="roleNames" align="center" />-->
      <el-table-column label="状态" prop="status" align="center" width="110">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" :active-value="0" :inactive-value="1" @change="handleStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column v-if="checkPermission(['admin','system:user:edit', 'system:user:del'])" label="操作" width="300px" align="center">
        <template slot-scope="{row}">
          <el-button v-permission="['admin','system:user:edit']" type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.userId !== 1" v-permission="['admin','system:user:del']" type="danger" size="mini" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页组件-->
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.page" :limit.sync="queryParams.limit" @pagination="getList" />

    <!-- 编辑弹窗 -->
    <edit ref="form" :is-add="isAdd" :status-options="statusOptions" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import Edit from './edit'
import { getList, delUser, updateUserStatus } from '@/api/user'
// import { getDictOptions } from '@/api/dict'
import checkPermission from '@/utils/permission'

export default {
  components: {
    Pagination,
    Edit
  },
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
      // 用户表格数据
      data: [],
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        page: 1,
        limit: 10,
        account: undefined,
        status: undefined
      },
      isAdd: false // 判断是否为新增
    }
  },
  created() {
    this.getList()
    // getDictOptions('userStatus').then(res => {
    //   this.statusOptions = res.data
    // })
  },
  methods: {
    checkPermission,
    /** 查询用户列表 */
    getList() {
      this.loading = true
      getList(this.queryParams).then(res => {
        this.data = res.data.records
        this.total = res.data.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.isAdd = true
      const _this = this.$refs.form
      _this.dialog = true
      _this.initForm()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.initForm(row)
      _this.dialog = true
    },
    /** 用户状态修改 */
    handleStatusChange(row) {
      const currentStatus = row.status
      debugger
      row.status = row.status === 1 ? 0 : 1
      const text = currentStatus === 0 ? '启用' : '停用'

      this.$confirm('是否"' + text + '" 用户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return updateUserStatus(row.id, currentStatus)
      }).then(res => {
        if (res.code === 200) {
          row.status = currentStatus
          this.$notify({
            title: text + '成功',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.id || this.ids
      this.$confirm('是否删除用户?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delUser(userIds)
      }).then(res => {
        this.$notify({
          title: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      })
    }
  }
}
</script>
