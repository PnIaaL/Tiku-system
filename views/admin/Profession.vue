<template>
  <el-container>
    <el-main>

      <el-row>
        <el-col :span="19">
          <el-input
            style="width: 490px"
            @blur="professionInfo"
            placeholder="请输入关键词进行过滤"
            v-model="queryInfo.queryText"
            clearable>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button style="float: right;margin-right: 80px" type="primary" icon="el-icon-plus" @click="openAddForm">
            添加
          </el-button>
        </el-col>
      </el-row>

      <el-table
        :data="professionData"
        row-key="id"
        style="margin-top: 20px"
        :indent="50"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
        <el-table-column
          type="index"
          label="编号"
          align="center"
          width="80">
        </el-table-column>
        <el-table-column
          prop="name"
          label="专业/课程名">
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="250">
          <template slot-scope="scope">
            <el-button
              size="small"
              type="danger"
              @click="deleteProfession(scope.row.id)">删除
            </el-button>
            <el-button
              size="small"
              type="warning"
              @click="openUpdate(scope.row)">修改
            </el-button>
          </template>
        </el-table-column>
      </el-table>

    </el-main>

    <el-dialog
      :before-close="closeAddForm"
      title="添加章节"
      :visible.sync="addFormIsShow"
      width="50%">
      <el-form ref="addForm" :model="addForm" label-width="150px">

        <el-form-item label="父目录：">
          <el-cascader
            style="width: 450px"
            v-model="addForm.pid"
            :options="professionOptions"
            :props="professionCascadeProps"
          ></el-cascader>
        </el-form-item>

        <el-form-item label="专业/课程名：">
          <el-input v-model="addForm.title" placeholder="如：软件工程" style="width: 500px"></el-input>
        </el-form-item>

        <el-form-item label="排序：">
          <el-input-number v-model="addForm.weight" :min="1" :max="1000"></el-input-number>
          <span class="px-attention">*值越低，位置越靠前</span>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeAddForm">取 消</el-button>
        <el-button type="primary" @click="addProfession(false)">确定添加</el-button>
        <el-button type="success" @click="addProfession(true)">继续添加</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="添加章节"
      :visible.sync="updateShow"
      width="50%">
      <el-form ref="addForm" :model="updateForm" label-width="150px">

        <el-form-item label="专业/课程名：">
          <el-input v-model="updateForm.title" placeholder="如：软件工程" style="width: 500px"></el-input>
        </el-form-item>

        <el-form-item label="排序：">
          <el-input-number v-model="updateForm.weight" :min="1" :max="1000"></el-input-number>
          <span class="px-attention">*值越低，位置越靠前</span>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateShow = false">取 消</el-button>
        <el-button type="primary" @click="updatePro">确定修改</el-button>
      </span>
    </el-dialog>

  </el-container>
</template>

<script>
import profession from "../../api/profession";

export default {
  name: "Profession",
  data() {
    return {
      professionData: [],
      //查询参数
      queryInfo: {
        'queryText': ''
      },
      professionOptions: [],
      addForm: {
        'weight': 1,
        'title': '',
        'pid': '0'
      },
      updateForm: {
        'weight': 1,
        'title': '',
        'id': null,
      },
      updateShow: false,
      addFormIsShow: false,
      professionCascadeProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'id',
        label: 'name',
        emitPath: false
      },
    }
  },
  methods: {
    updatePro(){
      profession.update(this.updateForm).then(resp=>{
        this.$message.success("修改成功")
        this.professionInfo()
        this.updateShow = false
      })
    },
    professionInfo() {
      profession.getList(this.queryInfo).then(resp => {
        this.professionData = resp.data
      })
    },
    openUpdate(row) {
      this.updateForm.id = row.id
      this.updateForm.title = row.name
      this.updateForm.weight = row.weight
      this.updateShow = true
    },
    professionOpInfo() {
      profession.getList().then(resp => {
        let op = [{id: '0', name: '主目录'}]
        op.push(...resp.data)
        this.professionOptions = op
      })
    },
    openAddForm() {
      this.professionOpInfo()
      this.addFormIsShow = true
    },
    addProfession(isGoOn) {
      profession.add(this.addForm).then(resp => {
        if (resp.code === 200) {
          this.$message.success("添加成功")
          this.addForm.title = ''
          if (isGoOn) {
            this.professionOpInfo()
            return
          }
          this.addForm.pid = '0'
          this.professionInfo()
          this.addFormIsShow = false
        }
      })
    },
    deleteProfession(id) {
      this.$confirm('此操作将永久删除该目录与其下的子目录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        profession.deleteById({id: id}).then(resp => {
          this.$message.success("删除成功")
          this.professionInfo()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    closeAddForm() {
      this.professionInfo()
      this.addFormIsShow = false
    }
  },
  created() {
    this.professionInfo()
  }
}
</script>

<style scoped>
.el-main {
  padding-top: 0;
}

.px-attention {
  margin-left: 20px;
  color: red;
  font-size: 13px;
}
</style>
