<template>
  <div>
    <div v-if="!dictType">
      <div class="my-code">点击字典查看详情</div>
    </div>
    <div v-else>
      <!--表单组件-->
      <Edit ref="formRef" :is-add="isAdd" :dict-type="dictType" />
      <!--表格渲染-->
      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column label="字典类型">
          <template #default>
            {{ dictType }}
          </template>
        </el-table-column>
        <el-table-column prop="dictLabel" label="字典标签" />
        <el-table-column prop="dictValue" label="字典值" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            {{ row.status === '0' ? '正常' : '停用' }}
          </template>
        </el-table-column>
        <el-table-column prop="dictSort" label="排序" />
        <el-table-column prop="remark" label="描述" />
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElNotification, ElMessageBox } from 'element-plus'
import Edit from './edit.vue'
import { del, fetchDetailList } from '@/api/dict-detail'
import checkPermission from '@/utils/permission'
import type { DictDetail } from '@/types'

const formRef = ref()

const dictType = ref('')
const dictName = ref('')
const loading = ref(false)
const tableData = ref<DictDetail[]>([])
const isAdd = ref(false)

function getList() {
  if (!dictType.value) return
  loading.value = true
  fetchDetailList(dictType.value).then((res) => {
    tableData.value = res.data
    loading.value = false
  })
}

// 删除
function handleDelete(row: DictDetail) {
  ElMessageBox.confirm(
    '确定删除本条数据吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    del([row.id]).then(() => {
      getList()
      ElNotification({
        title: '删除成功',
        type: 'success',
        duration: 2500
      })
    })
  }).catch(() => {
    // 用户取消
  })
}

function edit(data: DictDetail) {
  isAdd.value = false
  nextTick(() => {
    const form = formRef.value
    if (form) {
      form.form = {
        id: data.id,
        dictType: data.dictType,
        dictLabel: data.dictLabel,
        dictValue: data.dictValue,
        status: data.status,
        remark: data.remark,
        dictSort: data.dictSort
      }
      form.dialog = true
    }
  })
}

function resetForm() {
  formRef.value?.resetForm()
}

function getDialog() {
  return formRef.value?.dialog
}

function setDialog(val: boolean) {
  if (formRef.value) {
    formRef.value.dialog = val
  }
}

defineExpose({
  dictType,
  dictName,
  getList,
  isAdd,
  resetForm,
  getDialog,
  setDialog
})
</script>

<style scoped>
.my-code {
  padding: 15px;
  line-height: 20px;
  border-left: 3px solid #ddd;
  color: #333;
  font-family: Courier New;
  font-size: 12px;
}
</style>
