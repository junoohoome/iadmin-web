<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="filter-container">
      <!-- 搜索 -->
      <el-input
        v-model="queryParams.menuName"
        clearable
        placeholder="请输入菜单名称"
        style="width: 200px"
        class="filter-item"
        @keyup.enter="handleQuery"
      />
      <el-button class="filter-item" type="success" :icon="Search" @click="handleQuery">
        搜索
      </el-button>
      <el-button
        v-if="checkPermission(['admin', 'menu:add'])"
        class="filter-item"
        type="primary"
        :icon="Plus"
        @click="handleAdd"
      >
        新增
      </el-button>
    </div>
    <!--表单组件-->
    <edit ref="formRef" :is-add="isAdd" />
    <!--表格渲染-->
    <el-table
      v-loading="loading"
      :data="menuList"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      :default-expand-all="expand"
      row-key="menuId"
    >
      <el-table-column :show-overflow-tooltip="true" label="菜单名称" prop="menuName" />
      <el-table-column prop="icon" label="图标">
        <template #default="{ row }">
          <svg-icon :icon-class="row.icon" />
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="path" label="路由地址" />
      <el-table-column :show-overflow-tooltip="true" prop="perms" label="权限标识" />
      <el-table-column :show-overflow-tooltip="true" prop="component" label="组件路径" />
      <el-table-column prop="isFrame" label="外链">
        <template #default="{ row }">
          <span v-if="row.isFrame === 0">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column label="可见">
        <template #default="{ row }">
          <span v-if="row.visible === '1'">否</span>
          <span v-else>是</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" />
      <el-table-column
        v-if="checkPermission(['admin', 'menu:edit', 'menu:del'])"
        label="操作"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button v-if="checkPermission(['admin', 'menu:edit'])" size="small" type="primary" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-popover
            v-if="checkPermission(['admin', 'menu:del'])"
            :ref="(el: any) => popoverRefs[row.menuId] = el"
            placement="top"
            width="200"
          >
            <p>确定删除吗,如果存在下级节点则一并删除，此操作不能撤销！</p>
            <div style="text-align: right; margin: 0">
              <el-button size="small" type="text" @click="closePopover(row.menuId)">取消</el-button>
              <el-button :loading="delLoading" type="primary" size="small" @click="handelDelete(row.menuId)">
                确定
              </el-button>
            </div>
            <template #reference>
              <el-button type="danger" size="small">
                删除
              </el-button>
            </template>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElNotification } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import Edit from './edit.vue'
import { listMenu, del } from '@/api/menu'
import checkPermission from '@/utils/permission'
import type { Menu } from '@/types'

const formRef = ref()
const popoverRefs = ref<Record<string, any>>({})

const delLoading = ref(false)
const loading = ref(true)
const expand = ref(false)
const isAdd = ref(false)
const menuList = ref<Menu[]>([])
const queryParams = ref({
  menuName: ''
})

onMounted(() => {
  getList()
})

/** 查询菜单列表 */
function getList() {
  loading.value = true
  listMenu(queryParams.value).then((response) => {
    menuList.value = response.data
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  getList()
}

/** 新增按钮操作 */
function handleAdd() {
  isAdd.value = true
  const form = formRef.value
  form.getMenus()
  form.dialog = true
}

/** 修改按钮操作 */
function handleUpdate(data: Menu) {
  isAdd.value = false
  const form = formRef.value
  form.getMenus()
  form.form = {
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
  form.dialog = true
}

function closePopover(menuId: string) {
  popoverRefs.value[menuId]?.doClose()
}

/** 删除按钮操作 */
function handelDelete(id: string) {
  delLoading.value = true
  del(id).then((res) => {
    delLoading.value = false
    closePopover(id)
    if (res.code === 200) {
      getList()
      ElNotification({
        title: '删除成功',
        type: 'success',
        duration: 2500
      })
    }
  })
}
</script>
