<template>
  <el-container>

    <el-aside width="250px">
      <el-input
        style="margin-left: 10px"
        placeholder="输入关键字进行过滤"
        v-model="filterText">
      </el-input>
      <el-tree
        style="margin-top: 15px"
        :data="professionData"
        show-checkbox
        check-on-click-node
        :expand-on-click-node="false"
        node-key="id"
        ref="tree"
        @check="TreeCurrentChange"
        highlight-current
        :filter-node-method="filterNode"
        :props="defaultProps">
      </el-tree>
    </el-aside>

    <el-container>
      <el-header height="220">
        <el-row>
          <el-select @change="typeChange" clearable v-model="queryInfo.questionType" placeholder="请选择题目类型">
            <el-option
              v-for="item in questionType"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>

          <el-select @change="bankChange" clearable v-model="queryInfo.questionBank" placeholder="请选择题库"
                     style="margin-left: 5px">
            <el-option
              v-for="item in allBank"
              :key="item.id"
              :label="item.bankName"
              :value="item.bankName">
            </el-option>
          </el-select>

          <el-input v-model="queryInfo.questionContent" @blur="contentChange" placeholder="题目内容"
                    style="margin-left: 5px;width: 220px"
                    prefix-icon="el-icon-search"></el-input>


          <el-button type="primary" style="float: right;margin-right: 20px" icon="el-icon-plus" size="medium"
                     @click="addQuTableVisible = true">添加
          </el-button>
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
                  [<span v-if="scope.row.quType === 1">单选题</span>
                  <span v-else-if="scope.row.quType === 2">多选题</span>
                  <span v-else-if="scope.row.quType === 3">判断题</span>
                  <span v-else-if="scope.row.quType === 4">填空题</span>
                  <span v-else-if="scope.row.quType === 5">简答题</span>]
                  [<span v-if="scope.row.level === 1">简单</span>
                  <span v-if="scope.row.level === 2">中等</span>
                  <span v-if="scope.row.level === 3">困难</span>]
                  <span class="quContent" @click="updateQu(scope.row.id)">{{ scope.row.quContent }}</span>
                </div>
                <div v-if="scope.row.image!=null && scope.row.image!==''" style="margin-top: 5px">
                  <img style="max-width: 400px;max-height: 120px;margin-right: 20px "
                       v-for="url in scope.row.image.split(',')" :src="imgUrl+url"/>
                </div>
                <div class="qu-knowledgeName">
                  <div>所属题库：{{ scope.row.quBankName }}</div>
                  <div style="padding-right: 70px">{{ new Date(scope.row.createTime).toLocaleDateString() }}</div>
                </div>
              </div>
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

    <el-dialog title="更新题目" :visible.sync="updateQuTableVisible" width="50%" center>
      <el-card>

        <el-form :model="updateQuForm" ref="updateQuForm" :rules="updateQuFormRules">

          <el-form-item label="题目类型" label-width="120px" prop="questionType">
            <el-select v-model="updateQuForm.questionType" disabled @change="updateQuForm.answer =  []"
                       placeholder="请选择">
              <el-option
                v-for="item in questionType"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="难度等级" label-width="120px" prop="questionLevel">
            <el-select v-model="updateQuForm.questionLevel" placeholder="请选择">
              <el-option :value="parseInt(1)" label="简单"></el-option>
              <el-option :value="parseInt(2)" label="中等"></el-option>
              <el-option :value="parseInt(3)" label="困难"></el-option>
            </el-select>
          </el-form-item>


          <el-form-item label="归属题库" label-width="120px" prop="bankId">
            <el-select multiple v-model="updateQuForm.bankId" placeholder="请选择">
              <el-option v-for="item in allBank" :key="item.bankId"
                         :label="item.bankName" :value="item.bankId"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="归属课程" label-width="120px" prop="professionId">
            <el-cascader
              style="width: 450px"
              v-model="updateQuForm.professionId"
              :options="professionOptions"
              :props="professionCascadeProps"
            ></el-cascader>
          </el-form-item>

          <el-form-item label="题目内容" label-width="120px" prop="questionContent">
            <el-input v-model="updateQuForm.questionContent" style="margin-left: 5px" type="textarea"
                      :rows="2"></el-input>
          </el-form-item>

          <el-form-item label="题目图片" label-width="120px">
            <el-upload
              ref="updateUpload"
              :action="uploadImageUrl + '/teacher/uploadQuestionImage'"
              :on-preview="uploadPreview"
              :on-remove="handleUpdateRemove"
              :headers="headers"
              :before-upload="beforeAvatarUpload"
              list-type="picture"
              :on-success="updateUploadImgSuccess"
              name="file">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过10M</div>
            </el-upload>
          </el-form-item>

          <el-form-item label="整题解析" label-width="120px" prop="analysis">
            <el-input v-model="updateQuForm.analysis" style="margin-left: 5px" type="textarea"
                      :rows="2"></el-input>
          </el-form-item>

          <el-button v-if="updateQuForm.questionType!==5" type="primary" plain size="small" icon="el-icon-plus"
                     style="margin-left: 40px" @click="addUpdateAnswer(updateQuForm.questionType)">
            添加
          </el-button>

          <!--存放答案表单的信息-->
          <el-form-item prop="answer" v-if="updateQuForm.questionType !== 5">
            <el-table :data="updateQuForm.answer" border style="width: 96%;margin-left: 40px;margin-top: 10px">

              <el-table-column label="是否答案" width="80" align="center" v-if="updateQuForm.questionType !== 4">
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.isTrue" @change="checked=>checkUpdateAnswer(checked,scope.row.id)">答案
                  </el-checkbox>
                </template>
              </el-table-column>

              <el-table-column label="答案内容">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.answer" style="margin-left: 5px" type="textarea"
                            :rows="2"></el-input>
                </template>
              </el-table-column>

              <el-table-column label="答案解析">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.analysis" style="margin-left: 5px" type="textarea"
                            :rows="2"></el-input>
                </template>
              </el-table-column>

              <el-table-column label="操作" width="80" align="center">
                <template slot-scope="scope">
                  <el-button type="danger" icon="el-icon-delete" circle
                             @click="delUpdateAnswer(scope.row.id)"></el-button>
                </template>
              </el-table-column>

            </el-table>
          </el-form-item>

        </el-form>

      </el-card>

      <div slot="footer" class="dialog-footer">
        <el-button @click="updateQuTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateQuestion">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="新增题目" :visible.sync="addQuTableVisible" width="50%" @close="resetAddQuForm" center>

      <el-card>

        <el-form :model="addQuForm" ref="addQuForm" :rules="addQuFormRules">

          <el-form-item label="题目类型" label-width="120px" prop="questionType">
            <el-select v-model="addQuForm.questionType" @change="addQuForm.answer =  []" placeholder="请选择">
              <el-option
                v-for="item in questionType"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="难度等级" label-width="120px" prop="questionLevel">
            <el-select v-model="addQuForm.questionLevel" placeholder="请选择">
              <el-option :value="parseInt(1)" label="简单"></el-option>
              <el-option :value="parseInt(2)" label="中等"></el-option>
              <el-option :value="parseInt(3)" label="困难"></el-option>
            </el-select>
          </el-form-item>


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

          <el-form-item label="题目内容" label-width="120px" prop="questionContent">
            <el-input v-model="addQuForm.questionContent" style="margin-left: 5px" type="textarea"
                      :rows="2"></el-input>
          </el-form-item>

          <el-form-item label="题目图片" label-width="120px" prop="image">
            <el-upload
              ref="addUpload"
              :action="uploadImageUrl + '/teacher/uploadQuestionImage'"
              :on-preview="uploadPreview"
              :on-remove="handleRemove"
              :headers="headers"
              :before-upload="beforeAvatarUpload"
              list-type="picture"
              :on-success="uploadImgSuccess"
              name="file">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过10M</div>
            </el-upload>
          </el-form-item>

          <el-form-item label="整题解析" label-width="120px" prop="analysis">
            <el-input v-model="addQuForm.analysis" style="margin-left: 5px" type="textarea"
                      :rows="2"></el-input>
          </el-form-item>

          <el-button v-if="addQuForm.questionType!==5" type="primary" plain size="small" icon="el-icon-plus"
                     style="margin-left: 40px" @click="addAnswer(addQuForm.questionType)">
            添加
          </el-button>

          <!--存放答案表单的信息-->
          <el-form-item prop="answer" v-if="addQuForm.questionType!==5">
            <el-table :data="addQuForm.answer" border style="width: 96%;margin-left: 40px;margin-top: 10px">

              <el-table-column label="是否答案" width="80" align="center" v-if="addQuForm.questionType!==4">
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.isTrue" @change="checked=>checkAnswer(checked,scope.row.id)">答案
                  </el-checkbox>
                </template>
              </el-table-column>

              <el-table-column label="答案内容">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.answer" style="margin-left: 5px" type="textarea"
                            :rows="2"></el-input>
                </template>
              </el-table-column>

              <el-table-column label="答案解析">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.analysis" style="margin-left: 5px" type="textarea"
                            :rows="2"></el-input>
                </template>
              </el-table-column>

              <el-table-column label="操作" width="80" align="center">
                <template slot-scope="scope">
                  <el-button type="danger" icon="el-icon-delete" circle @click="delAnswer(scope.row.id)"></el-button>
                </template>
              </el-table-column>

            </el-table>
          </el-form-item>

        </el-form>

      </el-card>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addQuTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="addQuestion">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="加入题库" :visible.sync="addTableVisible" width="30%" @close="resetAddForm"
               center>

      <el-form :model="addForm" :rules="addFormRules" ref="addForm">

        <el-form-item label="题库名称" label-width="120px" prop="bankId">

          <el-select multiple v-model="addForm.bankId" placeholder="请选择题库">
            <el-option v-for="item in allBank" :key="item.bankId"
                       :label="item.bankName" :value="item.bankId"></el-option>
          </el-select>

        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="addBank">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="从题库中移除" :visible.sync="removeTableVisible" width="30%" @close="resetRemoveForm"
               center>

      <el-form :model="removeForm" :rules="removeFormRules" ref="removeForm">

        <el-form-item label="题库名称" label-width="120px" prop="bankId">

          <el-select multiple v-model="removeForm.bankId" placeholder="请选择题库">

            <el-option v-for="item in allBank" :key="item.bankId"
                       :label="item.bankName" :value="item.bankId"></el-option>
          </el-select>

        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="removeTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="removeBank">确 定</el-button>
      </div>
    </el-dialog>

    <!--图片回显-->
    <el-dialog :visible.sync="backShowImgVisible" @close="backShowImgVisible = false">
      <img style="width: 100%" :src="imgUrl+backShowImgUrl" alt="">
    </el-dialog>

  </el-container>

</template>

<script>
import questionBank from '@/api/questionBank'
import question from '@/api/question'
import utils from '@/utils/utils'
import profession from "@/api/profession";
import auth from "../../api/auth";
import user from "../../api/user";

export default {
  name: 'QuestionManage',
  data() {
    return {
      professionOptions: [],
      professionCascadeProps: {
        expandTrigger: 'hover',
        value: 'id',
        label: 'name',
        emitPath: false
      },
      uploadImageUrl: process.env.VUE_APP_UPLOAD_IMAGE_URL,
      imgUrl: process.env.VUE_APP_IMAGE_URL,
      filterText: '',
      professionData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      chaCascadeProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'id',
        label: 'name',
        emitPath: false
      },
      queryInfo: {
        //题目类型下拉款所选的内容
        'questionType': '',
        'questionBank': '',
        'professionIds': '',
        'questionContent': '',
        'pageNo': 1,
        'pageSize': 10
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
        }
      ],
      //题库信息
      allBank: [],
      //题目信息
      questionInfo: [],
      //题目信息表格是否加载
      loading: true,
      //表格被选中的所有行
      selectionTable: [],
      //表格行被选中后的所有操作方式的数据
      optionInfo: [
        {
          'label': '删除',
          'desc': 'delete'
        },
        {
          'label': '加入题库',
          'desc': 'add'
        },
        {
          'label': '题库中移除',
          'desc': 'remove'
        }
      ],
      //表格行被选中后的数据
      operation: '',
      //题目总数
      total: 0,
      //是否显示加入题库对话框
      addTableVisible: false,
      //是否显示移除题库对话框
      removeTableVisible: false,
      //是否显示添加题目的对话框
      addQuTableVisible: false,
      //添加题库的表单信息
      addForm: {
        bankId: ''
      },
      removeForm: {
        bankId: ''
      },
      //添加题库表单的验证
      addFormRules: {
        bankId: [
          {
            required: true,
            message: '请选择需要添加进的题库',
            trigger: 'blur'
          }
        ]
      },
      //移除题库表单的验证
      removeFormRules: {
        bankId: [
          {
            required: true,
            message: '请选择需要移除的题库',
            trigger: 'blur'
          }
        ]
      },
      //添加题目的表单信息
      addQuForm: {
        questionType: 1,
        questionLevel: 1,
        professionId: null,
        bankId: '',
        questionContent: '',
        images: [],
        analysis: '',
        createPerson: localStorage.getItem('username'),
        //答案对象
        answer: []
      },
      //添加题目表单的验证规则
      addQuFormRules: {
        questionType: [
          {
            required: true,
            message: '请选择问题类型',
            trigger: 'blur'
          }
        ],
        questionLevel: [
          {
            required: true,
            message: '请选择问题难度',
            trigger: 'blur'
          }
        ],
        bankId: [
          {
            required: true,
            message: '请选择题库',
            trigger: 'blur'
          }
        ],
        questionContent: [
          {
            required: true,
            message: '请输入题库内容',
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
      //更新题目表单的验证规则
      updateQuFormRules: {
        questionType: [
          {
            required: true,
            message: '请选择问题类型',
            trigger: 'blur'
          }
        ],
        questionLevel: [
          {
            required: true,
            message: '请选择问题难度',
            trigger: 'blur'
          }
        ],
        bankId: [
          {
            required: true,
            message: '请选择题库',
            trigger: 'blur'
          }
        ],
        questionContent: [
          {
            required: true,
            message: '请输入题库内容',
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
      //图片回显的样式
      backShowImgVisible: false,
      //图片回显的图片地址
      backShowImgUrl: '',
      //更新题目的数据信息
      updateQuForm: {
        questionId: '',
        professionId: null,
        questionType: 1,
        questionLevel: 1,
        bankId: '',
        questionContent: '',
        images: [],
        analysis: '',
        createPerson: localStorage.getItem('username'),
        //答案对象
        answer: []
      },
      //是否显示更新题目的对话框
      updateQuTableVisible: false,
      sendEmBt: false,
      showEmailVerify: false,
      btnText: '发送验证码',
      registerInfo: {
        email: '',
        code: '',
      },
      rules: {
        email: [
          {required: true, message: '请输入邮箱号', trigger: 'blur'},
        ],
        code: [
          {required: true, message: '请输入验证码', trigger: 'blur'},
        ]
      }
    }
  },
  created() {
    this.professionInfo()
    this.getQuestionBankInfo()
    this.getQuestionInfo()
  },
  methods: {
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
    //题目类型变化
    typeChange(val) {
      this.queryInfo.questionType = val
      this.getQuestionInfo()
    },
    //题库变化
    bankChange(val) {
      this.queryInfo.questionBank = val
      this.getQuestionInfo()
    },
    //题目名字筛选
    contentChange() {
      //发送查询题目总数的请求
      this.getQuestionInfo()
    },
    //获取题目信息
    getQuestionInfo() {
      question.getQuestion(this.queryInfo).then((resp) => {
        if (resp.code === 200) {
          this.questionInfo = resp.data.data
          this.total = resp.data.total
          this.loading = false
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
      if (val === 'delete') {
        this.deleteQuestions()
      } else if (val === 'add') {
        this.addTableVisible = true
      } else if (val === 'remove') {
        this.removeTableVisible = true
      }
    },
    deleteQuestions() {
      let questionIds = []
      this.selectionTable.map(item => {
        questionIds.push(item.id)
      })
      //发起删除请求
      question.deleteQuestion({'questionIds': questionIds.join(',')}).then(resp => {
        if (resp.code === 200) {
          this.$notify({
            title: 'Tips',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getQuestionInfo()
        }
      })
    },
    //分页页面大小改变
    handleSizeChange(val) {
      this.queryInfo.pageSize = val
      this.getQuestionInfo()
    },
    //分页插件的页数
    handleCurrentChange(val) {
      this.queryInfo.pageNo = val
      this.getQuestionInfo()
    },
    //表单信息重置
    resetAddForm() {
      //清空表格数据
      this.$refs['addForm'].resetFields()
    },
    resetRemoveForm() {
      //清空表格数据
      this.$refs['removeForm'].resetFields()
    },
    resetAddQuForm() {
      this.$refs['addQuForm'].resetFields()
    },
    //提交加入题库的表单信息
    addBank() {
      utils.validFormAndInvoke(this.$refs['addForm'], () => {
        let questionIds = []
        let banks = this.addForm.bankId
        //将表格选中的数据中的问题id加入进去
        this.selectionTable.map(item => {
          questionIds.push(item.id)
        })
        questionBank.addBankQuestion({
          'questionIds': questionIds.join(','),
          'banks': banks.join(',')
        }).then((resp) => {
          if (resp.code === 200) {
            this.getQuestionInfo()
            this.$notify({
              title: 'Tips',
              message: resp.message,
              type: 'success',
              duration: 2000
            })
          }
          this.addTableVisible = false
        })
      }, '请选择需要加入进的题库')
    },
    //提交移除题库的表单信息
    removeBank() {
      utils.validFormAndInvoke(this.$refs['removeForm'], () => {
        let questionIds = []
        let banks = this.removeForm.bankId
        //将表格选中的数据中的问题id加入进去
        this.selectionTable.map(item => {
          questionIds.push(item.id)
        })
        //发起移除请求
        questionBank.removeBankQuestion({
          'questionIds': questionIds.join(','),
          'banks': banks.join(',')
        }).then((resp) => {
          if (resp.code === 200) {
            this.getQuestionInfo()
            this.$notify({
              title: 'Tips',
              message: resp.message,
              type: 'success',
              duration: 2000
            })
          }
          this.removeTableVisible = false
        })
      }, '请选择需要移除的题库')
    },
    //新增题目上传后 点击图片的回显
    uploadPreview(file) {
      this.backShowImgUrl = file.response.data
      this.backShowImgVisible = true
    },
    //新增题目中的上传图片的移除
    handleRemove(file, fileList) {
      this.addQuForm.images.map((item, index) => {//移除图片在表单中的数据
        if (item === file.response.data) this.addQuForm.images.splice(index, 1)
      })
    },
    //更新题目中的上传图片的移除
    handleUpdateRemove(file, fileList) {
      this.updateQuForm.images.map((item, index) => {//移除图片在表单中的数据
        if (item === file.response.data) this.updateQuForm.images.splice(index, 1)
      })
    },
    //新增题目中的上传图片的格式大小限制
    beforeAvatarUpload(file) {
      const isImg = file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/jpg'
      const isLt = file.size / 1024 / 1024 < 10

      if (!isImg) {
        this.$message.error('上传图片只能是 JPG/PNG 格式!')
      }

      if (!isLt) {
        this.$message.error('上传头像图片大小不能超过 10MB!')
      }
      return isImg && isLt
    },
    //新增题目中的上传图片成功后的钩子函数
    uploadImgSuccess(response, file, fileList) {
      this.addQuForm.images.push(response.data)
    },
    //更新题目中的上传图片成功后的钩子函数
    updateUploadImgSuccess(response, file, fileList) {
      this.updateQuForm.images.push(response.data)
    },
    //新增题目中的新增答案填写框
    addAnswer(type) {
      this.addQuForm.answer.push({
        id: this.addQuForm.answer.length,
        isTrue: type === 4,
        answer: '',
        analysis: ''
      })
    },
    //更新时新增题目中的新增答案填写框
    addUpdateAnswer(type) {
      this.updateQuForm.answer.push({
        id: this.updateQuForm.answer.length,
        isTrue: type === 4,
        answer: '',
        analysis: ''
      })
    },
    //新增题目中的删除答案填写框
    delAnswer(id) {//当前答案的id
      this.addQuForm.answer.map((item, index) => {
        if (item.id === id) this.addQuForm.answer.splice(index, 1)
      })
    },
    //新增题目中的删除答案填写框
    delUpdateAnswer(id) {//当前答案的id
      this.updateQuForm.answer.map((item, index) => {
        if (item.id === id) this.updateQuForm.answer.splice(index, 1)
      })
    },
    //选择正确答案的按钮变化事件
    checkAnswer(checked, id) {
      if (checked) {
        if (this.addQuForm.questionType === 1 || this.addQuForm.questionType === 3) {//单选或者判断
          //当前已经有一个正确的选择了
          this.addQuForm.answer.map(item => {
            item.isTrue = false
          })
          this.addQuForm.answer.map(item => {
            if (item.id === id) item.isTrue = true
          })
        } else {//多选 可以有多个答案
          this.addQuForm.answer.map(item => {
            if (item.id === id) item.isTrue = true
          })
        }
      } else {
        this.addQuForm.answer.map(item => {
          if (item.id === id) item.isTrue = false
        })
      }
    },
    //更新时选择正确答案的按钮变化事件
    checkUpdateAnswer(checked, id) {
      if (checked) {
        if (this.updateQuForm.questionType === 1 || this.updateQuForm.questionType === 3) {//单选或者判断
          //当前已经有一个正确的选择了
          this.updateQuForm.answer.map(item => {
            item.isTrue = false
          })
          this.updateQuForm.answer.map(item => {
            if (item.id === id) item.isTrue = true
          })
        } else {//多选 可以有多个答案
          this.updateQuForm.answer.map(item => {
            if (item.id === id) item.isTrue = true
          })
        }
      } else {
        this.updateQuForm.answer.map(item => {
          if (item.id === id) item.isTrue = false
        })
      }
    },
    //新增题目
    addQuestion() {
      this.$refs['addQuForm'].validate((valid) => {
        if (valid && this.addQuForm.answer.some(item => item.isTrue) && this.addQuForm.questionType !== 5) {//单选或者多选或者判断
          question.addQuestion(this.addQuForm).then((resp) => {
            if (resp.code === 200) {
              this.addQuTableVisible = false
              this.getQuestionInfo()
              this.$notify({
                title: 'Tips',
                message: '新增题目成功',
                type: 'success',
                duration: 2000
              })
              this.$refs.addUpload.clearFiles()
            }
          })
        } else if (valid && !this.addQuForm.answer.some(item => item.isTrue) && this.addQuForm.questionType !== 5) {//无答案
          this.$message.error('必须有一个答案')
          return false
        } else if (valid && this.addQuForm.questionType === 5) {//简答题 无标准答案直接发请求
          //当是简答题的时候需要清除answer
          this.addQuForm.answer = []
          question.addQuestion(this.addQuForm).then((resp) => {
            if (resp.code === 200) {
              this.addQuTableVisible = false
              this.getQuestionInfo()
              this.$notify({
                title: 'Tips',
                message: '新增题目成功',
                type: 'success',
                duration: 2000
              })
              this.$refs.addUpload.clearFiles()
            }
          })
        } else if (!valid) {
          this.$message.error('请填写必要信息')
          return false
        }
      })
    },
    //更新题目
    updateQu(id) {
      question.getQuestionById(id).then((resp) => {
        if (resp.code === 200) {
          if (resp.data.questionType !== 5) {
            resp.data.answer.map(item => {
              item.isTrue = item.isTrue === 'true'
            })
          }
          this.updateQuForm = resp.data
          this.updateQuForm.professionId = String(resp.data.professionId)
          console.log(this.updateQuForm)
          //处理图片那个参数是个数组
          if (this.updateQuForm.images === null) this.updateQuForm.images = []
        }
        this.updateQuTableVisible = true
      })
    },
    //提交更新表单
    updateQuestion() {
      this.$refs['updateQuForm'].validate((valid) => {
        if (valid && this.updateQuForm.questionType !== 5 && this.updateQuForm.answer.some(item => item.isTrue)) {//单选或者多选或者判断

          question.updateQuestion(this.updateQuForm).then((resp) => {
            if (resp.code === 200) {
              this.updateQuTableVisible = false
              this.getQuestionInfo()
              this.$notify({
                title: 'Tips',
                message: '更新题目成功',
                type: 'success',
                duration: 2000
              })
              this.$refs.updateUpload.clearFiles()
            }
          })
        } else if (valid && this.updateQuForm.questionType !== 5 && !this.updateQuForm.answer.some(item => item.isTrue)) {//无答案
          this.$message.error('必须有一个答案')
          return false
        } else if (valid && this.updateQuForm.questionType === 5) {//简答题 无标准答案直接发请求
          //当是简答题的时候需要清除answer
          this.addQuForm.answer = []
          question.updateQuestion(this.updateQuForm).then((resp) => {
            if (resp.code === 200) {
              this.updateQuTableVisible = false
              this.getQuestionInfo()
              this.$notify({
                title: 'Tips',
                message: '更新题目成功',
                type: 'success',
                duration: 2000
              })
              this.$refs.updateUpload.clearFiles()
            }
          })
        } else if (!valid) {
          this.$message.error('请填写必要信息')
          return false
        }
      })
    },
    //检测树型选项变化
    TreeCurrentChange() {
      this.queryInfo.professionIds = this.$refs.tree.getCheckedKeys().join(',')
      this.getQuestionInfo()
    },
    //过滤课程数据
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
  },
  computed: {
    //监测头部信息的token变化
    headers() {
      return {
        authorization: localStorage.getItem('authorization') || '',
      }
    },
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
}
</script>

<style scoped lang="scss">
@import "../../assets/css/teacher/questionManage";
</style>
