<template>
  <div class="app-container">
    <!--表单组件-->
    <edit ref="form" :is-add="isAdd" />
    <!--工具栏-->
    <div class="filter-container">
      <!-- 搜索 -->
      <el-input
        v-model="queryParams.roleName"
        clearable
        placeholder="输入名称搜索"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleQuery"
      />
      <el-button class="filter-item" type="success" icon="el-icon-search" @click="handleQuery">搜索</el-button>
      <!-- 新增 -->
      <div v-permission="['admin','role:add']" style="display: inline-block;margin: 0px 2px;">
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-plus"
          @click="add"
        >新增
        </el-button>
      </div>
    </div>
    <el-row :gutter="15">
      <!--角色管理-->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" style="margin-bottom: 10px">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">角色列表</span>
          </div>
          <el-table
            v-loading="loading"
            :data="data"
            highlight-current-row
            style="width: 100%;"
            @current-change="handleCurrentChange"
          >
            <el-table-column prop="roleName" label="角色名称" />
            <el-table-column prop="roleKey" label="权限字符" />
            <el-table-column :show-overflow-tooltip="true" prop="remark" label="描述" />
            <el-table-column
              v-if="checkPermission(['admin','roles:edit','roles:del'])"
              label="操作"
              width="150px"
              align="center"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  v-if="scope.row.roleId !== 'superadmin'"
                  v-permission="['admin','role:edit']"
                  type="primary"
                  size="mini"
                  @click="edit(scope.row)"
                >
                  编辑
                </el-button>
                <el-popover
                  :ref="scope.row.id"
                  v-permission="['admin','role:del']"
                  placement="top"
                  width="180"
                >
                  <p>确定删除本条数据吗？</p>
                  <div style="text-align: right; margin: 0">
                    <el-button type="text" size="mini" @click="$refs[scope.row.id].doClose()">取消</el-button>
                    <el-button :loading="delLoading" type="primary" size="mini" @click="subDelete(scope.row.id)">确定
                    </el-button>
                  </div>
                  <el-button v-if="scope.row.id !== 'superadmin'" slot="reference" type="danger" size="mini">
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
      <!-- 授权 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <el-tooltip class="item" effect="dark" content="选择指定角色分配菜单" placement="top">
              <span class="role-span">菜单分配</span>
            </el-tooltip>
            <el-button
              v-permission="['admin','role:edit']"
              :disabled="!showButton"
              :loading="menuLoading"
              icon="el-icon-check"
              style="float: right; padding: 6px 9px"
              type="primary"
              @click="saveMenu"
            >保存
            </el-button>
          </div>
          <el-tree
            ref="menu"
            :data="menus"
            :default-checked-keys="menuIds"
            :props="defaultProps"
            check-strictly
            accordion
            show-checkbox
            node-key="id"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Edit from './edit'
import Pagination from '@/components/Pagination'
import checkPermission from '@/utils/permission'
import { listRoles, updatePermissions, del, getMenuIdsByRoleId } from '@/api/role'
import { getMenusTree } from '@/api/menu'
import { parseTime } from '@/utils'

export default {
  components: {
    Edit,
    Pagination
  },
  data() {
    return {
      loading: true, // 列表数据加载
      total: 0,
      data: [], // 列表数据
      queryParams: {
        page: 1,
        limit: 10,
        roleName: null
      },
      isAdd: false, // 是否新增，true: 新增  false: 编辑
      delLoading: false,
      defaultProps: { // 菜单树的属性
        children: 'children',
        label: 'label'
      },
      currentRoleId: '', // 当前选中的角色id
      menuLoading: false, // 菜单加载
      showButton: false, // 权限保存按钮是启用
      menus: [],
      menuIds: [] // 角色对应的菜单id
    }
  },
  created() {
    this.getMenus()
    this.getList()
  },
  methods: {
    parseTime,
    checkPermission,
    getList() {
      this.loading = true
      listRoles(this.queryParams).then(response => {
        this.data = response.data.records
        this.total = response.data.total
        this.loading = false
      })
    },
    subDelete(id) {
      this.delLoading = true
      del(id).then(res => {
        this.delLoading = false
        this.$refs[id].doClose()
        if (res.code === 200) {
          this.getList()
          this.$notify({
            title: '删除成功',
            type: 'success',
            duration: 2500
          })
        }
      }).catch(err => {
        this.delLoading = false
        this.$refs[id].doClose()
        console.log(err.response)
      })
    },
    add() {
      this.isAdd = true
      const _this = this.$refs.form
      _this.dialog = true
      _this.initForm()
    },
    edit(row) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.initForm(row)
      _this.dialog = true
    },
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    handleCurrentChange(row) {
      if (row) {
        const _this = this
        _this.showButton = false
        // 清空菜单的选中
        _this.$refs.menu.setCheckedKeys([])
        // 保存当前的角色id
        _this.currentRoleId = row.roleId
        if (_this.currentRoleId === 'superadmin') {
          _this.$refs.menu.setCheckedNodes(_this.menus)
          return
        }

        // 激活保存按钮
        _this.showButton = true
        // 初始化
        _this.menuIds = _this.getMenuIds(row.roleId)
        // if (row.menuIds && row.menuIds.length > 0) {
        // .forEach(item => {
        //    _this.menuIds.push(item)
        //  })
        // }
      }
    },
    getMenuIds(roleId) {
      getMenuIdsByRoleId(roleId).then(res => {
        this.menuIds = res.data
      })
    },
    getMenus() {
      getMenusTree().then(res => {
        this.menus = res.data
      })
    },
    saveMenu() {
      if (!this.currentRoleId || this.currentRoleId === '0') {
        this.$message.error('请选择角色')
        return
      }

      // 得到已选中的 key 值
      const menuIds = this.$refs.menu.getCheckedKeys()
      console.log('菜单ID: ', menuIds)
      if (!menuIds || menuIds.length === 0) {
        this.$message.error('请选择菜单')
        return
      }
      this.menuLoading = true
      const submitData = {
        roleId: this.currentRoleId,
        menuIds: menuIds.join(',')
      }
      updatePermissions(submitData).then(res => {
        if (res.code === 200) {
          this.data.forEach(item => {
            if (item.id === this.currentRoleId) {
              item.menuIds = submitData.menuIds
            }
          })
          this.$notify({
            title: '保存成功',
            type: 'success',
            duration: 2500
          })
        } else {
          this.$notify({
            title: res.msg,
            type: 'error',
            duration: 2500
          })
        }
        this.menuLoading = false
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  .role-span {
    font-weight: bold;
    color: #303133;
    font-size: 15px;
  }
</style>

<style scoped>
  /deep/ .el-tree-node__label {
    margin-left: 5px;
  }
</style>
