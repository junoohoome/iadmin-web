<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="filter-container">
      <el-input
        v-model="queryParams.account"
        clearable
        placeholder="请输入用户账号"
        style="width: 200px"
        class="filter-item"
        @keyup.enter="handleQuery"
      />
      <el-select
        v-model="queryParams.status"
        clearable
        placeholder="请输入状态"
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in statusOptions"
          :key="item.dictValue"
          :label="item.dictLabel"
          :value="item.dictValue"
        />
      </el-select>
      <el-button class="filter-item" type="success" :icon="Search" @click="handleQuery">
        搜索
      </el-button>
      <el-button
        v-permission="['admin', 'system:user:add']"
        class="filter-item"
        type="primary"
        :icon="Plus"
        @click="handleAdd"
      >
        新增
      </el-button>
      <el-button
        v-permission="['admin', 'system:user:delete']"
        class="filter-item"
        type="danger"
        :icon="Delete"
        :disabled="multiple"
        @click="handleDelete()"
      >
        删除
      </el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="用户账号" prop="userName" align="center" />
      <el-table-column label="用户名称" prop="nickName" align="center" />
      <el-table-column label="手机号码" prop="mobile" />
      <el-table-column label="用户邮箱" prop="email" align="center" />
      <el-table-column label="角色" align="center">
        <template #default="{ row }">
          <el-tag v-for="item in row.roles" :key="item.roleId" style="margin-left: 5px">
            {{ item.roleName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="110">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="'0'"
            :inactive-value="'1'"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        v-if="checkPermission(['admin', 'system:user:edit', 'system:user:del'])"
        label="操作"
        width="300px"
        align="center"
      >
        <template #default="{ row }">
          <el-button
            v-permission="['admin', 'system:user:edit']"
            type="primary"
            size="small"
            @click="handleUpdate(row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="row.userId !== 1"
            v-permission="['admin', 'system:user:del']"
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
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

    <!-- 编辑弹窗 -->
    <edit ref="formRef" :is-add="isAdd" :status-options="statusOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import Pagination from '@/components/Pagination/index.vue'
import Edit from './edit.vue'
import { getList as getUserList, delUser, updateUserStatus } from '@/api/user'
import { fetchDetailList } from '@/api/dict-detail'
import checkPermission from '@/utils/permission'
import type { User, DictItem } from '@/types'

interface QueryParams {
  page: number
  limit: number
  account?: string
  status?: string
}

const formRef = ref()
const loading = ref(true)
const ids = ref<number[]>([])
const multiple = ref(true)
const total = ref(0)
const tableData = ref<User[]>([])
const statusOptions = ref<DictItem[]>([])
const isAdd = ref(false)

const queryParams = ref<QueryParams>({
  page: 1,
  limit: 10,
  account: undefined,
  status: undefined
})

onMounted(() => {
  getList()
  fetchDetailList('sys_user_status').then((res) => {
    statusOptions.value = res.data
  })
})

/** 查询用户列表 */
function getList() {
  loading.value = true
  getUserList(queryParams.value).then((res) => {
    tableData.value = res.data.records
    total.value = res.data.total
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.page = 1
  getList()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: User[]) {
  ids.value = selection.map((item) => item.id!)
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  isAdd.value = true
  const form = formRef.value
  form.dialog = true
  form.initForm()
}

/** 修改按钮操作 */
function handleUpdate(row: User) {
  isAdd.value = false
  const form = formRef.value
  form.initForm(row)
  form.dialog = true
}

/** 用户状态修改 */
function handleStatusChange(row: User) {
  const currentStatus = row.status
  row.status = row.status === '1' ? '0' : '1' // 手动修改状态取反
  const text = currentStatus === '0' ? '启用' : '停用'
  ElMessageBox.confirm('是否"' + text + '" 用户吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return updateUserStatus(row.userId!, currentStatus)
    })
    .then((res) => {
      if (res.code === 200) {
        row.status = currentStatus
        ElNotification({
          title: text + '成功',
          type: 'success',
          duration: 2000
        })
      }
    })
}

/** 删除按钮操作 */
function handleDelete(row?: User) {
  const userIds = row?.id || ids.value
  ElMessageBox.confirm('是否删除用户?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return delUser(userIds)
    })
    .then(() => {
      ElNotification({
        title: '删除成功',
        type: 'success',
        duration: 2000
      })
      getList()
    })
}
</script>
