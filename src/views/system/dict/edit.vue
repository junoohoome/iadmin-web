<template>
  <el-dialog
    :append-to-body="true"
    :close-on-click-modal="false"
    :before-close="cancel"
    :visible.sync="dialog"
    :title="isAdd ? '新增字典' : '编辑字典'"
    width="500px"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="form.dictName" style="width: 370px;" />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="form.dictType" style="width: 370px;" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.remark" style="width: 370px;" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, edit } from '@/api/dict'

export default {
  props: {
    isAdd: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      dialog: false,
      form: {
        dictId: '',
        dictName: '',
        dictType: '',
        remark: ''
      },
      rules: {
        dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
        dictType: [{ required: true, message: '请输入字典类型', trigger: 'blur' }]
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
        this.loading = false
        if (res.code === 200) {
          this.resetForm()
          this.$notify({
            title: '添加成功',
            type: 'success',
            duration: 2500
          })
          this.$parent.getList()
        }
      }).catch(err => {
        this.loading = false
        console.log(err)
      })
    },
    doEdit() {
      console.info('1: ', this.form)
      edit(this.form).then(res => {
        if (res.code === 200) {
          console.info('2: ', this.form)
          const data = this.$parent.data
          const _form = this.form
          const index = data.findIndex(item => item.dictId === this.form.dictId)
          data.splice(index, 1, {
            dictId: _form.dictId,
            dictName: _form.dictName,
            dictType: _form.dictType,
            remark: _form.remark
          })

          console.info(data)
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
    initForm(data) {
      this.form = {
        dictId: data.dictId,
        dictName: data.dictName,
        dictType: data.dictType,
        remark: data.remark
      }
    },
    resetForm() {
      this.dialog = false
      this.$refs['form'].resetFields()
      this.form = {
        dictId: '',
        dictName: '',
        dictType: '',
        remark: ''
      }
    }
  }
}
</script>

<style scoped>

</style>
