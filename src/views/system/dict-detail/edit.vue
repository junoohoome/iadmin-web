<template>
  <el-dialog
    :append-to-body="true"
    :close-on-click-modal="false"
    :before-close="cancel"
    :visible.sync="dialog"
    :title="isAdd ? '新增字典详情' : '编辑字典详情'"
    width="500px"
  >
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input v-model="form.dictLabel" style="width: 370px;" />
      </el-form-item>
      <el-form-item label="字典值" prop="dictValue">
        <el-input v-model="form.dictValue" style="width: 370px;" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-input-number v-model.number="form.status" />
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
          style="width: 370px;"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, edit } from '@/api/dict-detail'

export default {
  props: {
    isAdd: {
      type: Boolean,
      required: true
    },
    dictType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false, dialog: false,
      form: {
        id: '',
        dictLabel: '',
        dictType: '',
        dictValue: '',
        status: '',
        dictSort: 1,
        remark: ''
      },
      rules: {
        label: [
          { required: true, message: '请输入字典标签', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ]
      }
    }
  },
  methods: {
    cancel() {
      this.resetForm()
    },
    doSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true
          this.form.dictType = this.dictType
          if (this.isAdd) {
            this.doAdd()
          } else {
            this.doEdit()
          }
        }
      })
    },
    doAdd() {
      add(this.form).then(res => {
        if (res.code === 200) {
          this.$notify({
            title: '添加成功',
            type: 'success',
            duration: 2500
          })
          // this.$parent.data.push(this.form)
          this.$parent.getList()
          this.resetForm()
        }
        this.loading = false
      }).catch(err => {
        this.loading = false
        console.log(err.response.data.message)
      })
    },
    doEdit() {
      edit(this.form).then(res => {
        if (res.code === 200) {
          const data = this.$parent.data
          const index = data.findIndex((item) => item.id === this.form.id)
          data.splice(index, 1, this.form)
          this.resetForm()
          this.$notify({
            title: '修改成功',
            type: 'success',
            duration: 2500
          })
        }
        this.loading = false
      }).catch(err => {
        this.loading = false
        console.log(err.response.data.message)
      })
    },
    resetForm() {
      this.dialog = false
      this.$refs['form'].resetFields()
      this.form = {
        id: '',
        dictType: '',
        dictLabel: '',
        dictValue: '',
        status: '',
        remark: '',
        dictSort: '999'
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  /deep/ .el-input-number .el-input__inner {
    text-align: left;
  }
</style>
