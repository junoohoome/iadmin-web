<template>
  <div>
    <div v-if="dictName === ''">
      <div class="my-code">点击字典查看详情</div>
    </div>
    <div v-else>
      <!--表单组件-->
      <edit ref="form" :is-add="isAdd" :dict-id="dictId" />
      <!--表格渲染-->
      <el-table v-loading="loading" :data="data" style="width: 100%;">
        <el-table-column label="所属字典">
          <template>
            {{ dictName }}
          </template>
        </el-table-column>
        <el-table-column prop="label" label="字典标签" />
        <el-table-column prop="value" label="字典值" />
        <el-table-column v-if="checkPermission(['admin','dict:edit','dict:del'])" label="操作" width="150px" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button v-permission="['admin','dict:edit']" type="primary" size="mini" @click="edit(scope.row)">
              编辑
            </el-button>
            <el-popover
              :ref="scope.row.id"
              v-permission="['admin','dict:del']"
              placement="top"
              width="180"
            >
              <p>确定删除本条数据吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
                <el-button :loading="delLoading" type="primary" @click="subDelete(scope.row.id)">确定</el-button>
              </div>
              <el-button slot="reference" size="mini" type="danger">
                删除
              </el-button>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import Edit from './edit'
import { del, fetchDetailList } from '@/api/dict'
import checkPermission from '@/utils/permission'

export default {
  components: {
    Edit
  },
  data() {
    return {
      dictId: '',
      dictName: '',
      loading: false, // 列表数据加载
      data: [], // 列表数据
      isAdd: false, // 判断是否为添加、true: 添加  false：编辑
      delLoading: false // 删除加载
    }
  },
  methods: {
    checkPermission,
    getList() {
      this.loading = true
      fetchDetailList(this.dictId).then(res => {
        console.log('字典详情：', res.data)
        this.data = res.data
        this.loading = false
      })
    },
    subDelete(id) {
      this.delLoading = true
      del(id).then(res => {
        this.delLoading = false
        this.$refs[id].doClose()
        this.dleChangePage()
        this.init()
        this.$notify({
          title: '删除成功',
          type: 'success',
          duration: 2500
        })
      }).catch(err => {
        this.delLoading = false
        this.$refs[id].doClose()
        console.log(err.response.data.message)
      })
    },
    edit(data) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.form = {
        id: data.id,
        label: data.label,
        value: data.value,
        sort: data.sort
      }
      _this.dialog = true
    },
    handleQuery() {
      this.getList()
    }
  }
}
</script>

<style scoped>
  .my-code{
    padding: 15px;
    line-height: 20px;
    border-left: 3px solid #ddd;
    color: #333;
    font-family: Courier New;
    font-size: 12px
  }
</style>
