<template>
  <el-container>

    <el-header>
      <el-input v-model="queryInfo.loginName" @blur="getUserInfo" placeholder="搜索登录名"
                prefix-icon="el-icon-search"></el-input>
      <el-input v-model="queryInfo.trueName" @blur="getUserInfo" placeholder="搜索姓名" prefix-icon="el-icon-search"
                style="margin-left: 5px"></el-input>
      <el-button type="primary" style="margin-left: 5px" icon="el-icon-plus" @click="showAddDialog">添加</el-button>
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
        :data="userInfo"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange">

        <el-table-column align="center"
                         type="selection"
                         width="55">
        </el-table-column>

        <el-table-column align="center"
                         prop="username"
                         label="用户名">
        </el-table-column>

        <el-table-column align="center"
                         prop="trueName"
                         label="姓名">
        </el-table-column>

        <el-table-column align="center"
                         prop="email"
                         label="邮箱">
        </el-table-column>

        <el-table-column align="center"
                         label="角色">
          <template slot-scope="scope">
            <span class="role" v-show="scope.row.roleId === 3">管理员</span>
            <span class="role" v-show="scope.row.roleId === 2">教师</span>
            <span class="role" v-show="scope.row.roleId === 1">学生</span>
          </template>
        </el-table-column>

        <el-table-column align="center"
                         label="创建时间">
          <template slot-scope="scope">
            {{ new Date(scope.row.createDate).toLocaleString() }}
          </template>
        </el-table-column>

        <el-table-column align="center"
                         label="状态">
          <template slot-scope="scope">
            {{ scope.row.status === 1 ? '正常' : '禁用' }}
          </template>
        </el-table-column>


        <el-table-column align="center"
                         label="操作">
          <template slot-scope="scope">
            <el-button @click="showUpdateDialog(scope.row)" type="warning" icon="el-icon-edit" size="mini">
              修改信息
            </el-button>
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

    <el-dialog title="添加用户" :visible.sync="addTableVisible" width="30%" @close="resetAddForm"
               center>

      <el-form :model="addForm" :rules="addFormRules" ref="addForm">

        <el-form-item label="用户名" label-width="120px" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>

        <el-form-item label="密码" label-width="120px" prop="password">
          <el-input v-model="addForm.password" type="password" show-password></el-input>
        </el-form-item>

        <el-form-item label="角色" label-width="120px" prop="roleId">
          <el-select v-model="addForm.roleId" placeholder="请选择用户权限">
            <el-option label="学生" value="1"></el-option>
            <el-option label="教师" value="2"></el-option>
            <el-option label="管理员" value="3"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="真实姓名" label-width="120px" prop="trueName">
          <el-input v-model="addForm.trueName"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" label-width="120px" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改用户" :visible.sync="updateTableVisible" width="30%" center>

      <el-form :model="updateForm" :rules="updateFormRules" ref="updateForm">

        <el-form-item label="用户名" label-width="120px">
          <el-input v-model="updateForm.username" :disabled="true"></el-input>
        </el-form-item>

        <el-form-item label="密码" label-width="120px" prop="password">
          <el-input v-model="updateForm.password" placeholder="不更改请留空"></el-input>
        </el-form-item>

        <el-form-item label="角色" label-width="120px">
          <el-select v-model="updateForm.roleId">
            <el-option label="学生" :value="1"></el-option>
            <el-option label="教师" :value="2"></el-option>
            <el-option label="管理员" :value="3"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="真实姓名" label-width="120px" prop="trueName">
          <el-input v-model="updateForm.trueName"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" label-width="120px" prop="email">
          <el-input v-model="updateForm.email"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="updateTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUser">确 定</el-button>
      </div>
    </el-dialog>

  </el-container>

</template>

<script>
import user from '@/api/user'
import utils from '@/utils/utils'
import auth from '@/api/auth'

export default {
  name: 'UserManage',
  data() {
    //自定义用户名校验规则
    const validateUsername = (rule, value, callback) => {
      auth.checkUsername(this.addForm.username).then((resp) => {
        if (resp.data) {
          callback()
        } else {
          callback(new Error('用户名已存在'))
        }
      })
    }
    return {
      //查询用户的参数
      queryInfo: {
        'loginName': '',
        'trueName': '',
        'pageNo': 1,
        'pageSize': 10
      },
      //用户信息
      userInfo: [],
      //下拉选择框的数据
      optionInfo: [
        {
          'label': '启用',
          'desc': 'on'
        },
        {
          'label': '禁用',
          'desc': 'off'
        },
        {
          'label': '删除',
          'desc': 'delete'
        }
      ],
      //下拉框所选择的数据
      selected: '',
      //被选择的表格中的行数据
      selectedInTable: [],
      //所有用户的条数
      total: 0,
      //添加用户的对话框是否显示
      addTableVisible: false,
      updateTableVisible: false,
      //添加用户的表单信息
      addForm: {
        'username': '',
        'password': '',
        'roleId': '',
        'email': '',
        'trueName': ''
      },
      updateForm: {
        'username': '',
        'password': null,
        'roleId': '',
        'email': '',
        'trueName': ''
      },
      //用户表单的验证规则
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入登录用户名',
            trigger: 'blur'
          },
          {
            validator: validateUsername,
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 5,
            message: '密码必须5位以上',
            trigger: 'blur'
          }
        ],
        trueName: [
          {
            required: true,
            message: '请输入用户真实姓名',
            trigger: 'blur'
          },
        ],
        roleId: [
          {
            required: true,
            message: '请选择用户权限',
            trigger: 'blur'
          },
        ],
        email: [
          {
            pattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
            message: "请填写正确的邮箱",
            trigger: "blur"
          }
        ]
      },
      //用户表单的验证规则
      updateFormRules: {
        password: [
          {
            min: 5,
            message: '密码必须5位以上',
            trigger: 'blur'
          }
        ],
        trueName: [
          {
            required: true,
            message: '请输入用户真实姓名',
            trigger: 'blur'
          }
        ],
        email: [
          {
            pattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
            message: "请填写正确的邮箱",
            trigger: "blur"
          }
        ]
      },
      //表格信息加载
      loading: true
    }
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    //获取用户信息
    getUserInfo() {
      user.getUserInfo(this.queryInfo).then((resp) => {
        if (resp.code === 200) {
          this.userInfo = resp.data.data
          this.total = resp.data.total
          this.loading = false
        } else {
          this.$notify({
            title: 'Tips',
            message: '获取信息失败',
            type: 'error',
            duration: 2000
          })
        }
      })
    },
    //表格某一行被选中
    handleSelectionChange(val) {
      this.selectedInTable = val
    },
    //功能下拉框被选择
    selectChange(val) {
      //清空上一次的操作
      this.selected = ''
      //表格中所选中的用户的id
      let userIds = []
      this.selectedInTable.map(item => {
        userIds.push(item.id)
      })
      if (val === 'on') {//状态设置为正常
        user.handlerUser(1, {'userIds': userIds.join(',')}).then((resp) => {
          if (resp.code === 200) {
            //删除成功后,回调更新用户数据
            this.getUserInfo()
            this.$notify({
              title: 'Tips',
              message: '操作成功',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$notify({
              title: 'Tips',
              message: '操作失败',
              type: 'error',
              duration: 2000
            })
          }
        })
      } else if (val === 'off') {//禁用用户
        user.handlerUser(2, {'userIds': userIds.join(',')}).then((resp) => {
          if (resp.code === 200) {
            //删除成功后,回调更新用户数据
            this.getUserInfo()
            this.$notify({
              title: 'Tips',
              message: '操作成功',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$notify({
              title: 'Tips',
              message: '操作失败',
              type: 'error',
              duration: 2000
            })
          }
        })
      } else if (val === 'delete') {//删除用户
        user.handlerUser(3, {'userIds': userIds.join(',')}).then((resp) => {
          if (resp.code === 200) {
            //删除成功后,回调更新用户数据
            this.getUserInfo()
            this.$notify({
              title: 'Tips',
              message: '操作成功',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$notify({
              title: 'Tips',
              message: '操作失败',
              type: 'error',
              duration: 2000
            })
          }
        })
      }
    },
    //分页插件的大小改变
    handleSizeChange(val) {
      this.queryInfo.pageSize = val
      this.getUserInfo()
    },
    //分页插件的页数
    handleCurrentChange(val) {
      this.queryInfo.pageNo = val
      this.getUserInfo()
    },
    //点击添加按钮
    showAddDialog() {
      this.addTableVisible = true
    },
    //点击修改按钮
    showUpdateDialog(row) {
      this.updateForm = this.$options.data().updateForm
      this.updateForm.username = row.username
      this.updateForm.roleId = parseInt(row.roleId)
      this.updateForm.email = row.email
      this.updateForm.trueName = row.trueName
      this.updateTableVisible = true
    },
    //添加用户
    addUser() {
      utils.validFormAndInvoke(this.$refs['addForm'], () => {
        user.addUser(this.addForm).then((resp) => {
          if (resp.code === 200) {
            this.getUserInfo()
            this.$message.success("操作成功")
          } else {
            this.$message.error("操作失败")
          }
          this.addTableVisible = false
        })
      }, '请检查您所填写的信息是否有误')
    },
    //修改用户
    updateUser() {
      utils.validFormAndInvoke(this.$refs['updateForm'], () => {
        user.updateCurrentUser(this.updateForm).then((resp) => {
          if (resp.code === 200) {
            this.getUserInfo()
            this.$message.success("操作成功")
          } else {
            this.$message.error("操作失败")
          }
          this.updateTableVisible = false
        })
      }, '请检查您所填写的信息是否有误')
    },
    //表单信息重置
    resetAddForm() {
      this.$refs['addForm'].resetFields()
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/css/admin/userManage";
</style>
