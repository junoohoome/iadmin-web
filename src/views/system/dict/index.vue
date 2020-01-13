<template>
  <div class="app-container">
    <!--表单组件-->
    <edit ref="form" :is-add="isAdd" />
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10" style="margin-bottom: 10px">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>字典列表</span>
            <el-button
              v-permission="['admin','dict:add']"
              class="filter-item"
              style="float: right;padding: 4px 10px"
              type="primary"
              icon="el-icon-plus"
              @click="add"
            >新增</el-button>
          </div>
          <!--工具栏-->
          <div class="filter-container">
            <!-- 搜索 -->
            <el-input v-model="queryParams.disc" clearable placeholder="输入名称或者描述搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="handleQuery" />
            <el-button class="filter-item" type="success" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          </div>
          <!--表格渲染-->
          <el-table v-loading="loading" :data="data" highlight-current-row style="width: 100%;" @current-change="handleCurrentChange">
            <el-table-column :show-overflow-tooltip="true" prop="dictName" label="名称" />
            <el-table-column :show-overflow-tooltip="true" prop="remark" label="描述" />
            <el-table-column v-if="checkPermission(['admin','dict:edit','dict:del'])" label="操作" width="150px" align="center" fixed="right">
              <template slot-scope="scope">
                <el-button v-permission="['admin','dict:edit']" type="primary" size="mini" @click="edit(scope.row)">
                  编辑
                </el-button>
                <el-popover
                  :ref="scope.row.id"
                  v-permission="['admin','dict:del']"
                  placement="top"
                  width="180"
                >
                  <p>此操作将删除字典与对应的字典详情，确定要删除吗？</p>
                  <div style="text-align: right; margin: 0">
                    <el-button type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
                    <el-button :loading="delLoading" type="primary" @click="subDelete(scope.row.id)">确定</el-button>
                  </div>
                  <el-button slot="reference" type="danger" size="mini">
                    删除
                  </el-button>
                </el-popover>
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <pagination
            v-show="total>0"
            :total="total"
            :page.sync="queryParams.page"
            :limit.sync="queryParams.limit"
            @pagination="getList"
          />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>字典详情</span>
            <el-button
              v-show="hasDetail"
              v-permission="['admin','dict:add']"
              class="filter-item"
              style="float: right;padding: 4px 10px"
              type="primary"
              icon="el-icon-plus"
              @click="$refs.dictDetail.$refs.form.dialog = true;$refs.dictDetail.isAdd = true"
            >新增</el-button>
          </div>
          <dict-detail ref="dictDetail" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>

import Edit from './edit'
import DictDetail from '../dict-detail/index'
import Pagination from '@/components/Pagination'
import { listDicts, del } from '@/api/dict'
import checkPermission from '@/utils/permission'

export default {
  components: {
    Edit,
    DictDetail,
    Pagination
  },
  data() {
    return {
      loading: true, // 表格数据加载效果
      data: [], // 表格列表数据
      total: 0,
      queryParams: {
        page: 1,
        limit: 10,
        disc: ''
      },
      isAdd: false, // 判断是否为添加、true: 添加  false：编辑
      delLoading: false, // 删除加载
      hasDetail: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    // 列表数据加载
    getList() {
      this.loading = true
      listDicts(this.queryParams).then(res => {
        this.data = res.data.data
        this.total = res.data.total
        this.loading = false
      })
    },
    // 删除
    subDelete(id) {
      this.delLoading = true
      del(id).then(res => {
        this.delLoading = false
        this.$refs[id].doClose()
        this.dleChangePage()
        this.getList()
        this.$notify({
          title: '删除成功',
          type: 'success',
          duration: 2500
        })
      }).catch(err => {
        this.delLoading = false
        this.$refs[id].doClose()
        console.log(err.response.data.message)
      })
    },
    add() {
      this.isAdd = true
      const _this = this.$refs.form
      _this.dialog = true
    },
    // 编辑
    edit(data) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.initForm(data)
      _this.dialog = true
    },
    // 行点击事件
    handleCurrentChange(row) {
      if (row) {
        this.hasDetail = true
        this.$refs.dictDetail.dictId = row.id
        this.$refs.dictDetail.dictName = row.dictName
        this.$refs.dictDetail.getList()
      }
    },
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    }
  }
}
</script>
