<template>
  <div class="app-container">
    <!--表单组件-->
    <Edit ref="formRef" :is-add="isAdd" @refresh="getList" />
    <!--工具栏-->
    <div class="filter-container">
      <!-- 搜索 -->
      <el-input
        v-model="queryParams.roleName"
        clearable
        placeholder="输入名称搜索"
        style="width: 200px"
        class="filter-item"
        @keyup.enter="handleQuery"
      />
      <el-button class="filter-item" type="success" :icon="Search" @click="handleQuery">搜索</el-button>
      <!-- 新增 -->
      <el-button v-if="checkPermission(['admin', 'role:add'])" class="filter-item" type="primary" :icon="Plus" @click="add">
        新增
      </el-button>
    </div>
    <el-row :gutter="15">
      <!--角色管理-->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" style="margin-bottom: 10px">
        <el-card class="box-card" shadow="never">
          <template #header>
            <div class="clearfix">
              <span class="role-span">角色列表</span>
            </div>
          </template>
          <el-table
            v-loading="loading"
            :data="tableData"
            highlight-current-row
            style="width: 100%"
            @current-change="handleCurrentChange"
          >
            <el-table-column prop="roleName" label="角色名称" />
            <el-table-column prop="roleKey" label="权限字符" />
            <el-table-column :show-overflow-tooltip="true" prop="remark" label="描述" />
            <el-table-column
              v-if="checkPermission(['admin', 'roles:edit', 'roles:del'])"
              label="操作"
              width="150px"
              align="center"
              fixed="right"
            >
              <template #default="{ row }">
                <el-button
                  v-if="row.roleId !== 'superadmin' && checkPermission(['admin', 'role:edit'])"
                  type="primary"
                  size="small"
                  @click="edit(row)"
                >
                  编辑
                </el-button>
                <el-popover
                  v-if="checkPermission(['admin', 'role:del'])"
                  :ref="(el: any) => popoverRefs[row.id] = el"
                  placement="top"
                  width="180"
                >
                  <p>确定删除本条数据吗？</p>
                  <div style="text-align: right; margin: 0">
                    <el-button link size="small" @click="closePopover(row.id)">取消</el-button>
                    <el-button :loading="delLoading" type="primary" size="small" @click="subDelete(row.id)">
                      确定
                    </el-button>
                  </div>
                  <template #reference>
                    <el-button v-if="row.id !== 'superadmin'" type="danger" size="small">
                      删除
                    </el-button>
                  </template>
                </el-popover>
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <pagination
            v-show="total > 0"
            v-model:page="queryParams.page"
            v-model:limit="queryParams.limit"
            :total="total"
            @pagination="getList"
          />
        </el-card>
      </el-col>
      <!-- 授权 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7">
        <el-card class="box-card" shadow="never">
          <template #header>
            <div class="clearfix">
              <el-tooltip class="item" effect="dark" content="选择指定角色分配菜单" placement="top">
                <span class="role-span">菜单分配</span>
              </el-tooltip>
              <el-button
                v-if="checkPermission(['admin', 'role:edit'])"
                :disabled="!showButton"
                :loading="menuLoading"
                :icon="Check"
                style="float: right; padding: 6px 9px"
                type="primary"
                @click="saveMenu"
              >
                保存
              </el-button>
            </div>
          </template>
          <el-tree
            ref="menuTreeRef"
            :data="menus"
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

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { Search, Plus, Check } from '@element-plus/icons-vue'
import Edit from './edit.vue'
import Pagination from '@/components/Pagination/index.vue'
import checkPermission from '@/utils/permission'
import { listRoles, updatePermissions, del, getMenuIdsByRoleId } from '@/api/role'
import { getMenusTree } from '@/api/menu'
import type { Role } from '@/types'

interface QueryParams {
  page: number
  limit: number
  roleName: string | null
}

const formRef = ref()
const menuTreeRef = ref()
const popoverRefs = ref<Record<string, any>>({})

const loading = ref(true)
const total = ref(0)
const tableData = ref<Role[]>([])
const queryParams = ref<QueryParams>({
  page: 1,
  limit: 10,
  roleName: null
})
const isAdd = ref(false)
const delLoading = ref(false)
const defaultProps = {
  children: 'children',
  label: 'label'
}
const currentRoleId = ref('')
const menuLoading = ref(false)
const showButton = ref(false)
const menus = ref<any[]>([])
const menuIds = ref<string[]>([])

onMounted(() => {
  getMenus()
  getList()
})

function getList() {
  loading.value = true
  listRoles(queryParams.value).then((response) => {
    tableData.value = response.data.records
    total.value = response.data.total
    loading.value = false
  })
}

function closePopover(id: string) {
  popoverRefs.value[id]?.doClose()
}

function subDelete(id: string) {
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

function add() {
  isAdd.value = true
  const form = formRef.value
  if (!form) return
  form.dialog = true
  form.initForm()
}

function edit(row: Role) {
  isAdd.value = false
  const form = formRef.value
  if (!form) return
  form.initForm(row)
  form.dialog = true
}

function handleQuery() {
  queryParams.value.page = 1
  getList()
}

function handleCurrentChange(row: Role) {
  if (row) {
    showButton.value = false
    menuTreeRef.value?.setCheckedKeys([])
    currentRoleId.value = row.roleId
    if (currentRoleId.value === 'superadmin') {
      menuTreeRef.value?.setCheckedNodes(menus.value)
      return
    }
    showButton.value = true
    getMenuIds(row.roleId)
  }
}

function getMenuIds(roleId: string) {
  getMenuIdsByRoleId(roleId).then((res) => {
    menuIds.value = res.data
    nextTick(() => {
      menuTreeRef.value?.setCheckedKeys(menuIds.value)
    })
  })
}

function getMenus() {
  getMenusTree().then((res) => {
    menus.value = res.data
  })
}

function saveMenu() {
  if (!currentRoleId.value || currentRoleId.value === '0') {
    ElMessage.error('请选择角色')
    return
  }

  const checkedMenuIds = menuTreeRef.value?.getCheckedKeys()
  if (!checkedMenuIds || checkedMenuIds.length === 0) {
    ElMessage.error('请选择菜单')
    return
  }
  menuLoading.value = true
  const submitData = {
    roleId: currentRoleId.value,
    menuIds: checkedMenuIds.join(',')
  }
  updatePermissions(submitData).then((res) => {
    if (res.code === 200) {
      tableData.value.forEach((item) => {
        if (item.id === currentRoleId.value) {
          item.menuIds = submitData.menuIds
        }
      })
      ElNotification({
        title: '保存成功',
        type: 'success',
        duration: 2500
      })
    } else {
      ElNotification({
        title: res.msg,
        type: 'error',
        duration: 2500
      })
    }
    menuLoading.value = false
  })
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
:deep(.el-tree-node__label) {
  margin-left: 5px;
}
</style>
