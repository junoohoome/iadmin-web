<template>
  <el-dialog :append-to-body="true" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog" :title="isAdd ? '新增字典' : '编辑字典'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="form.dictName" style="width: 370px;"/>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.remark" style="width: 370px;"/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { submitDict } from '@/api/dict'
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
        id: '',
        dictName: '',
        remark: ''
      },
      rules: {
        dictName: [
          { required: true, message: '请输入名称', trigger: 'blur' }
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
          if (this.isAdd) {
            this.doAdd()
          } else {
            this.doEdit()
          }
        }
      })
    },
    doAdd() {
      submitDict(this.form).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.resetForm()
          this.$notify({
            title: '添加成功',
            type: 'success',
            duration: 2500
          })
          this.$parent.getList()
        } else {
          this.$notify({
            title: '添加失败',
            type: 'error',
            duration: 2500
          })
        }
      }).catch(err => {
        this.loading = false
        console.log(err.response.data.message)
      })
    },
    doEdit() {
      submitDict(this.form).then(res => {
        if (res.code === 200) {
          this.resetForm()
          const data = this.$parent.data
          const index = data.findIndex((item) => item.id === res.data.id)
          data.splice(index, 1, res.data)
          this.$notify({
            title: '修改成功',
            type: 'success',
            duration: 2500
          })
        } else {
          this.$notify({
            title: '修改失败',
            type: 'error',
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
      if (!data) {
        data = {}
      }
      this.form = {
        id: data.id,
        dictName: data.dictName,
        remark: data.remark
      }
    },
    resetForm() {
      this.dialog = false
      this.$refs['form'].resetFields()
      this.form = {
        id: '',
        dictName: '',
        remark: ''
      }
    }
  }
}
</script>

<style scoped>

</style>
