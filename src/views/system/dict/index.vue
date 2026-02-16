<template>
  <div class="app-container">
    <!--表单组件-->
    <Edit ref="formRef" :is-add="isAdd" />
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10" style="margin-bottom: 10px">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <span>字典列表</span>
              <el-button
                v-if="checkPermission(['admin', 'system:dict:add'])"
                class="filter-item"
                style="float: right; padding: 4px 10px"
                type="primary"
                :icon="Plus"
                @click="add"
              >
                新增
              </el-button>
            </div>
          </template>
          <!--工具栏-->
          <div class="filter-container">
            <!-- 搜索 -->
            <el-input
              v-model="queryParams.dictName"
              clearable
              placeholder="输入字典名称"
              style="width: 200px"
              class="filter-item"
              @keyup.enter="handleQuery"
            />
            <el-button class="filter-item" type="success" :icon="Search" @click="handleQuery">搜索</el-button>
          </div>
          <!--表格渲染-->
          <el-table
            v-loading="loading"
            :data="tableData"
            highlight-current-row
            style="width: 100%"
            @current-change="handleCurrentChange"
          >
            <el-table-column :show-overflow-tooltip="true" prop="dictName" label="字典名称" />
            <el-table-column :show-overflow-tooltip="true" prop="dictType" label="字典类型" />
            <el-table-column :show-overflow-tooltip="true" prop="remark" label="描述" />
            <el-table-column
              v-if="checkPermission(['admin', 'system:dict:edit', 'system:dict:del'])"
              label="操作"
              width="150px"
              align="center"
              fixed="right"
            >
              <template #default="{ row }">
                <el-button v-if="checkPermission(['admin', 'system:dict:edit'])" type="primary" size="small" @click="edit(row)">
                  编辑
                </el-button>
                <el-button
                  v-if="checkPermission(['admin', 'system:dict:del'])"
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
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <span>字典详情</span>
              <el-button
                v-show="hasDetail && checkPermission(['admin', 'system:dict:add'])"
                class="filter-item"
                style="float: right; padding: 4px 10px"
                type="primary"
                :icon="Plus"
                @click="handleAddDetail"
              >
                新增
              </el-button>
            </div>
          </template>
          <dict-detail ref="dictDetailRef" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import Edit from './edit.vue'
import DictDetail from '../dict-detail/index.vue'
import Pagination from '@/components/Pagination/index.vue'
import { listDicts, del } from '@/api/dict'
import checkPermission from '@/utils/permission'
import type { Dict } from '@/types'

interface QueryParams {
  page: number
  limit: number
  dictName: string | null
}

const formRef = ref()
const dictDetailRef = ref()

const loading = ref(true)
const tableData = ref<Dict[]>([])
const total = ref(0)
const queryParams = ref<QueryParams>({
  page: 1,
  limit: 10,
  dictName: null
})
const isAdd = ref(false)
const hasDetail = ref(false)

onMounted(() => {
  getList()
})

// 列表数据加载
function getList() {
  loading.value = true
  listDicts(queryParams.value).then((res) => {
    tableData.value = res.data.records
    total.value = res.data.total
    loading.value = false
  })
}

// 删除
function handleDelete(row: Dict) {
  ElMessageBox.confirm(
    '此操作将删除字典与对应的字典详情，确定要删除吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    del([row.dictId]).then(() => {
      getList()
      ElNotification({
        title: '删除成功',
        type: 'success',
        duration: 2500
      })
    })
  }).catch(() => {
    // 用户取消删除
  })
}

function add() {
  isAdd.value = true
  nextTick(() => {
    const form = formRef.value
    if (form) {
      form.dialog = true
    }
  })
}

// 编辑
function edit(data: Dict) {
  isAdd.value = false
  nextTick(() => {
    const form = formRef.value
    if (form) {
      form.initForm(data)
      form.dialog = true
    }
  })
}

// 行点击事件
function handleCurrentChange(row: Dict) {
  if (row) {
    hasDetail.value = true
    const detail = dictDetailRef.value
    detail.dictType = row.dictType
    detail.dictName = row.dictName
    detail.getList()
  }
}

function handleQuery() {
  queryParams.value.page = 1
  getList()
}

function handleAddDetail() {
  dictDetailRef.value.isAdd = true
  dictDetailRef.value.resetForm()
  dictDetailRef.value.setDialog(true)
}
</script>
