<template>
  <div>
    <div v-if="dictName === ''">
      <div class="my-code">点击字典查看详情</div>
    </div>
    <div v-else>
      <!--表单组件-->
      <Edit ref="formRef" :is-add="isAdd" :dict-type="dictType" />
      <!--表格渲染-->
      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column label="字典类型">
          <template>
            {{ dictType }}
          </template>
        </el-table-column>
        <el-table-column prop="dictLabel" label="字典标签" />
        <el-table-column prop="dictValue" label="字典值" />
        <el-table-column prop="status" label="状态" />
        <el-table-column prop="dictSort" label="排序" />
        <el-table-column prop="remark" label="描述" />
        <el-table-column
          v-if="checkPermission(['admin', 'dict:edit', 'dict:del'])"
          label="操作"
          width="150px"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button v-if="checkPermission(['admin', 'dict:edit'])" type="primary" size="small" @click="edit(row)">
              编辑
            </el-button>
            <el-popover
              v-if="checkPermission(['admin', 'dict:del'])"
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
                <el-button type="danger" size="small">
                  删除
                </el-button>
              </template>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElNotification } from 'element-plus'
import Edit from './edit.vue'
import { del, fetchDetailList } from '@/api/dict-detail'
import checkPermission from '@/utils/permission'
import type { DictDetail } from '@/types'

const formRef = ref()
const popoverRefs = ref<Record<string, any>>({})

const dictType = ref('')
const dictName = ref('')
const loading = ref(false)
const tableData = ref<DictDetail[]>([])
const isAdd = ref(false)
const delLoading = ref(false)

function getList() {
  loading.value = true
  fetchDetailList(dictType.value).then((res) => {
    tableData.value = res.data
    loading.value = false
  })
}

function closePopover(id: string) {
  popoverRefs.value[id]?.doClose()
}

function subDelete(id: number) {
  delLoading.value = true
  del([id]).then((res) => {
    delLoading.value = false
    closePopover(id)
    getList()
    ElNotification({
      title: '删除成功',
      type: 'success',
      duration: 2500
    })
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

function handleQuery() {
  getList()
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
