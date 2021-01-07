<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="filter-container">
      <!-- 搜索 -->
      <el-input
        v-model="queryParams.menuName"
        clearable
        placeholder="请输入菜单名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleQuery"
      />
      <el-button class="filter-item" type="success" icon="el-icon-search" @click="handleQuery">
        搜索
      </el-button>
      <el-button
        v-permission="['admin','menu:add']"
        class="filter-item"
        type="primary"
        icon="el-icon-plus"
        @click="handleAdd"
      >
        新增
      </el-button>
    </div>
    <!--表单组件-->
    <edit ref="form" :is-add="isAdd" />
    <!--表格渲染-->
    <el-table
      v-loading="loading"
      :data="menuList"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      :default-expand-all="expand"
      row-key="menuId"
    >
      <el-table-column :show-overflow-tooltip="true" label="菜单名称" prop="menuName" />
      <el-table-column prop="icon" label="图标">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="path" label="路由地址" />
      <el-table-column :show-overflow-tooltip="true" prop="perms" label="权限标识" />
      <el-table-column :show-overflow-tooltip="true" prop="component" label="组件路径" />
      <el-table-column prop="isFrame" label="外链">
        <template slot-scope="scope">
          <span v-if="scope.row.isFrame === 0">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column label="可见">
        <template slot-scope="scope">
          <span v-if="scope.row.visible === '1'">否</span>
          <span v-else>是</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" />
      <el-table-column
        v-if="checkPermission(['admin','menu:edit','menu:del'])"
        label="操作"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button v-permission="['admin','menu:edit']" size="mini" type="primary" @click="handleUpdate(scope.row)">
            编辑
          </el-button>
          <el-popover :ref="scope.row.id" v-permission="['admin','menu:del']" placement="top" width="200">
            <p>确定删除吗,如果存在下级节点则一并删除，此操作不能撤销！</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="$refs[scope.row.menuId].doClose()">取消</el-button>
              <el-button :loading="delLoading" type="primary" size="mini" @click="handelDelete(scope.row.menuId)">确定
              </el-button>
            </div>
            <el-button slot="reference" type="danger" size="mini">
              删除
            </el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import Edit from './edit'
import { listMenu, del } from '@/api/menu'
import checkPermission from '@/utils/permission' // 权限判断函数
import { parseTime } from '@/utils/index'

export default {
  components: { Edit },
  data() {
    return {
      delLoading: false,
      // 遮罩层
      loading: true,
      expand: false,
      isAdd: false,
      // 菜单表格树数据
      menuList: [],
      // 查询参数
      queryParams: {
        menuName: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    parseTime,
    checkPermission,
    /** 查询菜单列表 */
    getList() {
      this.loading = true
      listMenu(this.queryParams).then(response => {
        this.menuList = response.data
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.isAdd = true
      this.$refs.form.getMenus()
      this.$refs.form.dialog = true
    },
    /** 修改按钮操作 */
    handleUpdate(data) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.getMenus()
      _this.form = {
        menuId: data.menuId,
        component: data.component,
        componentName: data.componentName,
        menuName: data.menuName,
        sort: data.sort,
        parentId: data.parentId,
        path: data.path,
        isFrame: data.isFrame.toString(),
        roles: [],
        icon: data.icon,
        cache: data.cache,
        visible: data.visible,
        menuType: data.menuType,
        perms: data.perms
      }
      console.log(_this.form)
      _this.dialog = true
    },
    /** 删除按钮操作 */
    handelDelete(id) {
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
        console.log(err)
      })
    }
  }
}
</script>
