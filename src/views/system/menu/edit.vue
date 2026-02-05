<template>
  <el-dialog
    v-model="dialog"
    :close-on-click-modal="false"
    :before-close="cancel"
    :title="isAdd ? '新增菜单' : '编辑菜单'"
    append-to-body
    width="580px"
  >
    <el-form ref="formRef" :inline="true" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="菜单类型">
        <el-radio-group v-model="form.menuType" size="small" style="width: 178px">
          <el-radio-button value="M">目录</el-radio-button>
          <el-radio-button value="C">菜单</el-radio-button>
          <el-radio-button value="F">按钮</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-show="form.menuType !== 'F'" label="菜单图标">
        <el-popover placement="bottom-start" width="450" trigger="click" @show="iconSelectRef.reset()">
          <IconSelect ref="iconSelectRef" @selected="selected" />
          <template #reference>
            <el-input v-model="form.icon" style="width: 450px" placeholder="点击选择图标" readonly>
              <template #prefix>
                <svg-icon v-if="form.icon" :icon-class="form.icon" style="height: 32px; width: 16px" />
                <el-icon v-else class="el-input__icon"><Search /></el-icon>
              </template>
            </el-input>
          </template>
        </el-popover>
      </el-form-item>
      <el-form-item v-show="form.menuType !== 'F'" label="外链菜单">
        <el-radio-group v-model="form.isFrame" size="small">
          <el-radio-button :value="0">是</el-radio-button>
          <el-radio-button :value="1">否</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-show="form.menuType !== 'F'" label="菜单可见">
        <el-radio-group v-model="form.visible" size="small">
          <el-radio-button :value="0">是</el-radio-button>
          <el-radio-button :value="1">否</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="form.menuType === 'F' ? '按钮名称' : '菜单名称'" prop="menuName">
        <el-input
          v-model="form.menuName"
          :style="form.menuType === 'M' ? 'width: 450px' : 'width: 178px'"
          placeholder="名称"
        />
      </el-form-item>
      <el-form-item v-show="form.menuType !== 'M'" prop="permission" label="权限标识">
        <el-input v-model="form.perms" :disabled="form.iframe === 'true'" placeholder="权限标识" style="width: 178px" />
      </el-form-item>
      <el-form-item v-if="form.menuType !== 'F'" label="路由地址" prop="path">
        <el-input v-model="form.path" placeholder="路由地址" style="width: 178px" />
      </el-form-item>
      <el-form-item label="菜单排序">
        <el-input-number v-model.number="form.sort" :min="0" :max="99" controls-position="right" style="width: 178px" />
      </el-form-item>
      <el-form-item v-show="form.isFrame.toString() === '1' && form.menuType === 'C'" label="组件路径">
        <el-input v-model="form.component" style="width: 178px" placeholder="组件路径" />
      </el-form-item>
      <el-form-item label="上级类目">
        <Treeselect v-model="form.parentId" :options="menus" style="width: 450px" placeholder="选择上级类目" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="text" @click="cancel">取消</el-button>
        <el-button :loading="loading" type="primary" @click="submitForm">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElNotification } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { add, edit, getMenusTree } from '@/api/menu'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect/index.vue'

interface Props {
  isAdd: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const iconSelectRef = ref()

const loading = ref(false)
const dialog = ref(false)
const menus = ref<any[]>([])
const formRef = ref()
const form = ref<any>({
  menuName: '',
  sort: 999,
  path: '',
  componentPath: '',
  isFrame: 1,
  roles: [],
  parentId: 0,
  icon: '',
  visible: '1',
  menuType: 'M',
  perms: ''
})

const rules = {
  menuName: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 32, message: '长度在 2 到 32 个字符', trigger: 'blur' }
  ],
  perms: [{ min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }],
  path: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入菜单排序', trigger: 'blur' }]
}

/** 提交按钮 */
function submitForm() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      if (form.value.menuType === 'F') {
        form.value.visible = '1'
      }
      if (props.isAdd) {
        doAdd()
      } else {
        doEdit()
      }
    } else {
      return false
    }
  })
}

function doAdd() {
  add(form.value).then((res) => {
    resetForm()
    ElNotification({
      title: '添加成功',
      type: 'success',
      duration: 2500
    })
    loading.value = false
    emit('refresh')
  })
}

function doEdit() {
  edit(form.value).then((res) => {
    resetForm()
    ElNotification({
      title: '修改成功',
      type: 'success',
      duration: 2500
    })
    loading.value = false
    emit('refresh')
  })
}

function selected(name: string) {
  form.value.icon = name
}

function getMenus() {
  getMenusTree().then((res) => {
    menus.value = []
    const menu = { id: 0, label: '顶级类目', children: [] }
    menu.children = res.data
    menus.value.push(menu)
  })
}

function cancel() {
  resetForm()
}

function resetForm() {
  dialog.value = false
  formRef.value?.resetFields()
  form.value = {
    menuName: '',
    sort: 99,
    path: '',
    component: '',
    isFrame: 1,
    roles: [],
    parentId: 0,
    icon: '',
    visible: '1',
    menuType: 'M',
    perms: ''
  }
}

defineExpose({
  dialog,
  form,
  getMenus,
  resetForm
})
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>
