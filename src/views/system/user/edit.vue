<template>
  <el-dialog :visible.sync="dialog" :title="isAdd ? '新增用户' : '编辑用户'" append-to-body width="760px" @close="cancel">
    <el-form ref="form" :model="form" :inline="true" :rules="rules" label-width="120px">
      <el-form-item label="用户账号" prop="account">
        <el-input v-model="form.account" placeholder="请输入登录账号" :disabled="!isAdd" />
      </el-form-item>
      <el-form-item v-if="isAdd" label="用户密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入登录密码" />
      </el-form-item>
      <el-form-item label="用户姓名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户姓名" />
      </el-form-item>
      <el-form-item label="联系电话" prop="mobile">
        <el-input v-model="form.mobile" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="电子邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入电子邮箱" />
      </el-form-item>
      <el-form-item label="用户状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择用户状态" style="width: 184px">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.text" :value="parseInt(item.value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户角色" prop="roles">
        <el-select v-model="form.roles" placeholder="请选择用户角色" multiple style="width: 184px">
          <el-option v-for="item in roleOptions" :key="item.value " :label="item.text" :value="item.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addUser, updateUser } from '@/api/user'
// import { getRoleOptions } from '@/api/role'
export default {
  props: {
    isAdd: {
      type: Boolean,
      required: true
    },
    statusOptions: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      dialog: false,
      loading: false,
      roleOptions: [],
      form: {},
      rules: {
        username: [
          { required: true, message: '请输入用户姓名', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在4-16个字符以内', trigger: 'change' }
        ],
        account: [
          { required: true, message: '请输入用户账号', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在4-16个字符以内', trigger: 'change' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { pattern: /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,60}/, message: '至少8位字符，包括数字、字母和特殊符号', trigger: 'change' }
        ],
        mobile: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
        roles: [{ required: true, message: '请选择用户角色', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getRoleOptions()
  },
  methods: {
    cancel() {
      this.resetForm()
    },
    doSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true
          this.form.roleIds = this.form.roles.join(',')
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
      addUser(this.form).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.$notify({
            title: '添加成功',
            type: 'success',
            duration: 2500
          })
          this.dialog = false
          this.$parent.getList()
          return
        }
        this.$notify({
          title: res.msg,
          type: 'error',
          duration: 2500
        })
      })
    },
    doEdit() {
      updateUser(this.form).then(res => {
        if (res.code === 200) {
          const _form = this.form
          const data = this.$parent.data
          const index = data.findIndex((item) => item.id === _form.id)
          const roleNames = []
          this.roleOptions.forEach(item => {
            if (this.form.roles.includes(item.value)) {
              roleNames.push(item.text)
            }
          })
          // 修改列表数据
          data.splice(index, 1, {
            id: _form.id,
            username: _form.username,
            account: _form.account,
            password: _form.password,
            mobile: _form.mobile,
            email: _form.email,
            status: _form.status,
            roleIds: _form.roleIds,
            roleNames: roleNames.join(',')
          })
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
        console.log(err)
      })
    },
    getRoleOptions() {
      // getRoleOptions().then(response => {
      //   this.roleOptions = response.data
      // })
    },
    initForm(data) {
      if (!data) {
        data = {}
      }
      const roles = []
      if (data.roleIds && data.roleIds.length > 0) {
        roles.push(...data.roleIds.split(','))
      }
      this.form = {
        id: data.id,
        username: data.username,
        account: data.account,
        password: data.password,
        mobile: data.mobile,
        email: data.email,
        status: data.status ? 1 : 0,
        roleIds: data.roleIds,
        roles: roles
      }
    },
    resetForm() {
      this.dialog = false
      this.loading = false
      this.$refs['form'].resetFields()
      this.initForm()
    }
  }
}
</script>
