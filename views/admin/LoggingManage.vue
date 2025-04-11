<template>
  <el-container>

    <el-header>
      <el-input v-model="queryInfo.content" @blur="getLoggingInfo" placeholder="搜索日志" style="width: 350px"
                prefix-icon="el-icon-search"></el-input>
    </el-header>

    <el-main>
      <!--操作的下拉框-->
      <el-select @change="selectChange" clearable v-if="selectedInTable.length !== 0" v-model="selected"
                 :placeholder="'已选择' + selectedInTable.length + '项'" style="margin-bottom: 25px;">

        <el-option v-for="(item,index) in optionInfo" :key="index" :value="item.desc">
          <span style="float: left">{{ item.label }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ item.desc }}</span>
        </el-option>

      </el-select>

      <el-table
        ref="multipleTable"
        highlight-current-row
        v-loading="loading"
        :border="true"
        :data="loggingInfo"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange">

        <el-table-column align="center"
                         type="selection"
                         width="55">
        </el-table-column>

        <el-table-column align="center"
                         prop="operation"
                         label="操作描述">
        </el-table-column>

        <el-table-column align="center"
                         prop="method"
                         label="请求方法名">
        </el-table-column>

        <el-table-column align="center"
                         prop="params"
                         label="请求参数">
        </el-table-column>

        <el-table-column align="center"
                         prop="time"
                         label="执行时间（毫秒）">
        </el-table-column>

        <el-table-column align="center"
                         prop="createUser"
                         label="操作用户">
        </el-table-column>

        <el-table-column align="center"
                         label="操作时间">
          <template v-slot="scope">
            {{new Date(scope.row.createTime).toLocaleString()}}
          </template>
        </el-table-column>

      </el-table>

      <!--分页-->
      <el-pagination style="margin-top: 25px"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNo"
                     :page-sizes="[10, 20, 30, 50]"
                     :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>

    </el-main>

  </el-container>

</template>

<script>
import logging from '../../api/logging'

export default {
  name: 'LoggingManage',
  data() {
    return {
      //查询日志的参数
      queryInfo: {
        'content': '',
        'pageNo': 1,
        'pageSize': 10
      },
      //下拉选择框的数据
      optionInfo: [
        {
          'label': '删除',
          'desc': 'delete'
        }
      ],
      //下拉框所选择的数据
      selected: '',
      // 所有日志信息
      loggingInfo: [],
      // 表格数据预加载
      loading: true,
      // 日志总数
      total: 0,
      // 被选中的表格行
      selectedInTable: [],
    }
  },
  created() {
    this.getLoggingInfo()
  },
  methods: {
    getLoggingInfo() {
      logging.getAllLogging(this.queryInfo).then((resp) => {
        if (resp.code === 200) {
          this.loggingInfo = resp.data.data
          this.total = resp.data.total
          this.loading = false
        }
      })
    },
    //表格某一行被选中
    handleSelectionChange(val) {
      this.selectedInTable = val
    },
    //分页插件的大小改变
    handleSizeChange(val) {
      this.queryInfo.pageSize = val
      this.getLoggingInfo()
    },
    //分页插件的页数
    handleCurrentChange(val) {
      this.queryInfo.pageNo = val
      this.getLoggingInfo()
    },
    //功能下拉框被选择
    selectChange(val) {
      //清空上一次的操作
      this.selected = ''
      //表格中所选中的日志的id
      let ids = []
      this.selectedInTable.map(item => {
        ids.push(item.nid)
      })
      if (val === 'delete') {
        logging.deleteLogging({'ids': ids.join(',')}).then((resp) => {
          if (resp.code === 200) {
            //删除成功后,回调更新数据
            this.getLoggingInfo()
            this.$notify({
              title: 'Tips',
              message: resp.message,
              type: 'success',
              duration: 2000
            })
          }
        })
      }
    },
  }
}
</script>

<style scoped lang="scss">
</style>
