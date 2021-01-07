<template>
  <el-dialog :visible.sync="dialog" :close-on-click-modal="false" :before-close="cancel" :title="isAdd ? '新增角色' : '编辑角色'" append-to-body width="520px">
    <el-form ref="form" :inline="true" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" style="width: 145px;" />
      </el-form-item>
      <el-form-item label="角色权限" prop="roleKey">
        <el-input v-model="form.roleKey" style="width: 145px;" />
      </el-form-item>
      <el-form-item label="描述信息" prop="remark">
        <el-input v-model="form.remark" style="width: 380px;" rows="5" type="textarea" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, edit } from '@/api/role'

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
      form: {},
      rules: {
        roleName: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在4-16个字符以内', trigger: 'change' }
        ],
        roleKey: [
          { required: true, message: '请输入权限', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在4-16个字符以内', trigger: 'change' }
        ],
        remark: [{ max: 120, message: '长度在120个字符以内', trigger: 'change' }]
      }
    }
  },
  created() {
    this.initForm()
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
        } else {
          return false
        }
      })
    },
    doAdd() {
      add(this.form).then(res => {
        this.resetForm()
        this.$notify({
          title: '添加成功',
          type: 'success',
          duration: 2500
        })
        this.loading = false
        this.$parent.getList()
      }).catch(err => {
        this.loading = false
        console.log(err.response.data.message)
      })
    },
    doEdit() {
      edit(this.form).then(res => {
        if (res.code === 200) {
          const data = this.$parent.data
          const index = data.findIndex((item) => item.roleId === this.form.roleId)
          data.splice(index, 1, this.form)
          this.resetForm()
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
        roleId: data.roleId,
        roleName: data.roleName,
        remark: data.remark,
        roleKey: data.roleKey
      }
    },
    resetForm() {
      this.dialog = false
      this.$refs['form'].resetFields()
      this.initForm()
    }
  }
}
</script>

