<template>
  <el-dialog
    v-model="dialog"
    :append-to-body="true"
    :close-on-click-modal="false"
    :before-close="cancel"
    :title="isAdd ? '新增字典详情' : '编辑字典详情'"
    width="500px"
  >
    <el-form ref="formRef" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input v-model="form.dictLabel" style="width: 370px" />
      </el-form-item>
      <el-form-item label="字典值" prop="dictValue">
        <el-input v-model="form.dictValue" style="width: 370px" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio value="0">正常</el-radio>
          <el-radio value="1">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="描述" prop="remark">
        <el-input v-model="form.remark" />
      </el-form-item>
      <el-form-item label="排序" prop="dictSort">
        <el-input-number
          v-model.number="form.dictSort"
          :min="0"
          :max="999"
          controls-position="right"
          style="width: 370px"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button link @click="cancel">取消</el-button>
        <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import { add, edit } from '@/api/dict-detail'

interface Props {
  isAdd: boolean
  dictType: string
}

const props = defineProps<Props>()

const loading = ref(false)
const dialog = ref(false)
const formRef = ref()
const form = ref({
  id: undefined as number | undefined,
  dictLabel: '',
  dictType: '',
  dictValue: '',
  status: '0',
  dictSort: 1,
  remark: ''
})

const rules = {
  dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dictSort: [{ required: true, message: '请输入序号', trigger: 'blur', type: 'number' }]
}

function cancel() {
  resetForm()
}

function doSubmit() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      form.value.dictType = props.dictType
      if (props.isAdd) {
        doAdd()
      } else {
        doEdit()
      }
    }
  })
}

function doAdd() {
  add(form.value).then((res) => {
    if (res.code === 200) {
      ElNotification({
        title: '添加成功',
        type: 'success',
        duration: 2500
      })
      emit('refresh')
      resetForm()
    }
    loading.value = false
  })
}

function doEdit() {
  edit(form.value).then((res) => {
    if (res.code === 200) {
      resetForm()
      ElNotification({
        title: '修改成功',
        type: 'success',
        duration: 2500
      })
    }
    loading.value = false
  })
}

function resetForm() {
  dialog.value = false
  formRef.value?.resetFields()
  form.value = {
    id: undefined,
    dictType: '',
    dictLabel: '',
    dictValue: '',
    status: '0',
    remark: '',
    dictSort: 1
  }
}

const emit = defineEmits<{
  refresh: []
}>()

defineExpose({
  dialog,
  resetForm
})
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>
