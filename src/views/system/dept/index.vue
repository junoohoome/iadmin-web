<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="filter-container">
      <el-input
        v-model="deptName"
        clearable
        placeholder="请输入部门名称"
        style="width: 200px"
        class="filter-item"
        @keyup.enter="handleQuery"
      />
      <el-button class="filter-item" type="success" :icon="Search" @click="handleQuery">
        搜索
      </el-button>
      <el-button
        v-permission="['admin', 'system:dept:add']"
        class="filter-item"
        type="primary"
        :icon="Plus"
        @click="handleAdd"
      >
        新增
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      row-key="deptId"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      style="width: 100%"
    >
      <el-table-column label="部门名称" prop="deptName" min-width="200" />
      <el-table-column label="排序" prop="orderNum" width="100" align="center" />
      <el-table-column label="负责人" prop="leader" width="120" align="center" />
      <el-table-column label="联系电话" prop="phone" width="130" align="center" />
      <el-table-column label="邮箱" prop="email" min-width="160" align="center" />
      <el-table-column label="状态" align="center" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="checkPermission(['admin', 'system:dept:edit', 'system:dept:del'])"
        label="操作"
        width="200px"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            v-permission="['admin', 'system:dept:edit']"
            type="primary"
            size="small"
            @click="handleUpdate(row)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="['admin', 'system:dept:del']"
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑弹窗 -->
    <edit ref="formRef" :is-add="isAdd" :dept-options="deptTree" @refresh="getList" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import Edit from './edit.vue'
import { getTreeList, del } from '@/api/dept'
import checkPermission from '@/utils/permission'
import type { Dept } from '@/types'

const loading = ref(true)
const deptName = ref('')
const tableData = ref<Dept[]>([])
const isAdd = ref(false)

// 部门树形列表（用于父部门选择）
const deptTree = computed(() => {
  // 添加一个顶级选项
  return [{ deptId: 0, deptName: '顶级部门', parentId: -1, children: tableData.value, orderNum: 0, status: '0' }]
})

onMounted(() => {
  getList()
})

/** 查询部门列表 */
function getList() {
  loading.value = true
  getTreeList().then((res) => {
    tableData.value = buildTree(res.data, 0)
    loading.value = false
  })
}

/** 构建树形结构 */
function buildTree(depts: Dept[], parentId: number): Dept[] {
  const tree: Dept[] = []
  depts.forEach((dept) => {
    if (dept.parentId === parentId) {
      const children = buildTree(depts, dept.deptId)
      if (children.length > 0) {
        dept.children = children
      }
      tree.push(dept)
    }
  })
  return tree
}

/** 搜索按钮操作 */
function handleQuery() {
  if (deptName.value) {
    const filterByName = (depts: Dept[]): Dept[] => {
      return depts
        .filter((dept) => dept.deptName.includes(deptName.value))
        .map((dept) => ({
          ...dept,
          children: dept.children ? filterByName(dept.children) : undefined
        }))
    }
    tableData.value = filterByName(buildTree(JSON.parse(JSON.stringify(tableData.value)), 0))
  } else {
    getList()
  }
}

/** 新增按钮操作 */
function handleAdd() {
  isAdd.value = true
  const form = formRef.value
  form.dialog = true
  form.initForm()
}

/** 修改按钮操作 */
function handleUpdate(row: Dept) {
  isAdd.value = false
  const form = formRef.value
  form.initForm(row)
  form.dialog = true
}

/** 删除按钮操作 */
function handleDelete(row: Dept) {
  ElMessageBox.confirm('是否确认删除名称为"' + row.deptName + '"的数据项？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return del([row.deptId])
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

const formRef = ref()
</script>
