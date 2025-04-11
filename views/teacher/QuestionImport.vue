<template>
  <el-container>
    <el-container>
      <el-header height="220">
        <el-row>
          <el-col :span="22">
            <div class="container">
              <i class="el-icon-upload"></i>
              <span style="margin-left: 5px">导入</span>
              <input
                type="file"
                ref="importFile"
                accept=".xls,.xlsx"
                class="upload_file"
                @change="readExcel($event)"
              />
            </div>
          </el-col>
          <el-col :span="2">
            <el-button @click="questionInfo = []" size="medium" type="danger" icon="el-icon-delete">清空</el-button>
          </el-col>
        </el-row>
      </el-header>

      <el-main>
        <!--操作的下拉框-->
        <el-select @change="operationChange" clearable v-if="selectionTable.length !== 0" v-model="operation"
                   :placeholder="'已选择' + selectionTable.length + '项'" style="margin-bottom: 25px;">

          <el-option v-for="(item,index) in optionInfo" :key="index" :value="item.desc">
            <span style="float: left">{{ item.label }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.desc }}</span>
          </el-option>

        </el-select>

        <el-table
          ref="questionTable"
          highlight-current-row
          v-loading="loading"
          :border="true"
          :data="questionInfo"
          tooltip-effect="dark"
          style="width: 100%;" @selection-change="handleTableSectionChange">

          <el-table-column align="center"
                           type="selection"
                           width="55">
          </el-table-column>

          <el-table-column label="试题内容">
            <template slot-scope="scope">
              <div>
                <div>
                  [<span v-if="scope.row.questionType === 1">单选题</span>
                  <span v-else-if="scope.row.questionType === 2">多选题</span>
                  <span v-else-if="scope.row.questionType === 3">判断题</span>
                  <span v-else-if="scope.row.questionType === 4">填空题</span>
                  <span v-else-if="scope.row.questionType === 5">简答题</span>]
                  [<span v-if="scope.row.questionLevel === 1">简单</span>
                  <span v-if="scope.row.questionLevel === 2">中等</span>
                  <span v-if="scope.row.questionLevel === 3">困难</span>]
                  <span>{{ scope.row.questionContent }}</span>
                </div>
                <div v-if="scope.row.questionType !== 5" class="questionAnswer">
                  <div class="questionAnswer-one" v-for="(item,index) in scope.row.Answer" :style="{color:item.isTrue?'red':''}">
                    <div v-if="scope.row.questionType !== 4">{{ optionName[index] + '、' }}</div>
                    <div v-else>{{(index+1) + '、' }}</div>
                    <div>{{item.answer}}</div>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

        </el-table>

      </el-main>

      <el-dialog title="批量导入" :visible.sync="addFormShow" width="50%" center>

        <el-card>

          <el-form :model="addQuForm" ref="importForm" :rules="addQuFormRules">

            <el-form-item label="归属题库" label-width="120px" prop="bankId">
              <el-select multiple v-model="addQuForm.bankId" placeholder="请选择">
                <el-option v-for="item in allBank" :key="item.bankId"
                           :label="item.bankName" :value="item.bankId"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="归属课程" label-width="120px" prop="professionId">
              <el-cascader
                style="width: 450px"
                v-model="addQuForm.professionId"
                :options="professionOptions"
                :props="professionCascadeProps"
              ></el-cascader>
            </el-form-item>

          </el-form>

        </el-card>

        <div slot="footer" class="dialog-footer">
          <el-button @click="addFormShow = false">取 消</el-button>
          <el-button type="primary" @click="importQuestion">确 定</el-button>
        </div>
      </el-dialog>

    </el-container>



  </el-container>

</template>

<script>
import questionBank from '@/api/questionBank'
import profession from "@/api/profession";
import * as XLSX from "xlsx";
import utils from "../../utils/utils";
import question from "../../api/question";

export default {
  name: 'QuestionImport',
  data() {
    return {
      //导入题目的表单信息
      addQuForm: {
        professionId: null,
        bankId: '',
        createPerson: localStorage.getItem('username'),
        //题目对象
        questionData: []
      },
      //导入题目表单的验证规则
      addQuFormRules: {
        bankId: [
          {
            required: true,
            message: '请选择题库',
            trigger: 'blur'
          }
        ],
        professionId: [
          {
            required: true,
            message: '请选择所属课程',
            trigger: 'blur'
          }
        ],
      },
      professionOptions: [],
      professionCascadeProps: {
        expandTrigger: 'hover',
        value: 'id',
        label: 'name',
        emitPath: false
      },
      //答案的选项名abcd数据
      optionName: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      //题目类型
      questionType: [
        {
          id: 1,
          name: '单选题',
        },
        {
          id: 2,
          name: '多选题',
        },
        {
          id: 3,
          name: '判断题',
        },
        {
          id: 4,
          name: '填空题',
        },
        {
          id: 5,
          name: '简答题',
        },
      ],
      //难度类型
      levelType: [
        {
          id: 1,
          name: '简单',
        },
        {
          id: 2,
          name: '中等',
        },
        {
          id: 3,
          name: '困难',
        },
      ],
      //题库信息
      allBank: [],
      //题目信息
      questionInfo: [],
      //题目信息表格是否加载
      loading: false,
      //表格被选中的所有行
      selectionTable: [],
      //表格行被选中后的所有操作方式的数据
      optionInfo: [
        {
          'label': '加入试题',
          'desc': 'add'
        },
      ],
      //表格行被选中后的数据
      operation: '',
      //添加列表数据
      addQuestionData:[],
      addFormShow:false,
    }
  },
  created() {
    this.professionInfo()
    this.getQuestionBankInfo()
  },
  methods: {
    //批量导入试题
    importQuestion(){
      utils.validFormNotEmpty(this.$refs['importForm'],() => {
        console.log(this.addQuForm)
        question.importQuestion(this.addQuForm).then(resp=>{
          if (resp.code === 200){
            this.$message.success("导入成功")
            this.addFormShow = false
          }
        })
      },"请检查信息是否完整")
    },
    //读取excel导入数据
    readExcel(e) {
      // 读取表格文件
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        this.workingWithJson(json)
      };
      reader.readAsArrayBuffer(file);
      this.$refs.importFile.value = ''
    },
    //处理json数据
    workingWithJson(json) {
      json.forEach(item => {
        const data = {}
        const typeItem = this.questionType.find(i => i.name === item['题型']);
        typeItem ? data.questionType = typeItem.id : null;
        const levelItem = this.levelType.find(i => i.name === item['难度']);
        levelItem ? data.questionLevel = levelItem.id : null;
        data.questionContent = item['问题内容']
        data.images = []
        data.analysis = ''
        const Answer = []
        for (let i = 0; i < this.optionName.length; i++) {
          let option = this.optionName[i];
          let xx = item[option]
          if (xx == null || xx === '') {
            break
          }
          Answer.push({
            id: i,
            isTrue: item['正确选项']!=null?item['正确选项'].includes(option):false,
            answer: xx,
            analysis:''
          })
        }
        data.answer = Answer
        this.questionInfo.push(data)
      })
    },
    //获取所有的专业课程信息
    professionInfo() {
      profession.getList().then(resp => {
        this.professionData = resp.data
        this.professionOptions = resp.data
      })
    },
    //获取所有的题库信息
    getQuestionBankInfo() {
      questionBank.getQuestionBank().then((resp) => {
        if (resp.code === 200) {
          this.allBank = resp.data
        }
      })
    },
    //处理表格被选中
    handleTableSectionChange(val) {
      this.selectionTable = val
    },
    //处理操作选择框的变化
    operationChange(val) {
      //清空上一次的选择
      this.operation = ''
      if (val === 'add') {
        this.addQuForm.questionData = this.selectionTable
        this.addFormShow = true
      }
    },

  },
}
</script>

<style scoped lang="scss">
@import "../../assets/css/teacher/questionManage";
</style>
