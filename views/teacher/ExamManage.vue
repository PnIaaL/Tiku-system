<template>
  <el-container>
    <el-header height="220">
      <el-select @change="typeChange" clearable v-model="queryInfo.examType" placeholder="请选择考试类型">
        <el-option
          v-for="item in examType"
          :key="item.type"
          :label="item.info"
          :value="item.type">
        </el-option>
      </el-select>

      <el-date-picker style="margin-left: 5px"
                      v-model="queryInfo.startTime" @change="getExamInfo"
                      type="date"
                      placeholder="考试开始时间">
      </el-date-picker>

      <el-date-picker style="margin-left: 5px" @change="getExamInfo"
                      v-model="queryInfo.endTime"
                      type="date"
                      placeholder="考试结束时间">
      </el-date-picker>

      <el-input v-model="queryInfo.examName" placeholder="考试名称" @blur="getExamInfo"
                style="margin-left: 5px;width: 220px"
                prefix-icon="el-icon-search"></el-input>
      <el-button type="primary" icon="el-icon-plus" style="float: right;margin-right: 50px"
                 @click="$router.push('/addExam')">添加
      </el-button>
    </el-header>

    <el-main>
      <!--操作的下拉框-->
      <el-select @change="operationChange" clearable v-if="selectionTable.length !== 0" v-model="operation"
                 :placeholder="'已选择' + selectionTable.length + '项'" style="margin-bottom: 25px;">
        <el-option v-for="(item,index) in operationInfo" :key="index" :value="item.desc">
          <span style="float: left">{{ item.label }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ item.desc }}</span>
        </el-option>
      </el-select>

      <el-table
        ref="questionTable"
        highlight-current-row
        v-loading="loading"
        :border="true"
        :data="examInfo"
        tooltip-effect="dark"
        style="width: 100%;" @selection-change="handleTableSectionChange">

        <el-table-column align="center"
                         type="selection"
                         width="55">
        </el-table-column>

        <el-table-column align="center" label="考试名称">
          <template slot-scope="scope">
            <span style="cursor:pointer;color: rgb(24,144,255)" @click="$router.push('/updateExam/'+ scope.row.examId)">{{
                scope.row.examName
              }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="考试类型">
          <template slot-scope="scope">
            {{ scope.row.type === 1 ? '完全公开' : '需要密码' }}
          </template>
        </el-table-column>

        <el-table-column align="center" label="考试时间">
          <template slot-scope="scope">
            {{
              scope.row.startTime !== 'null' && scope.row.endTime !== 'null' ?
                scope.row.startTime + ' ~' + scope.row.endTime : '不限时'
            }}
          </template>
        </el-table-column>

        <el-table-column align="center" prop="totalScore" label="考试总分"></el-table-column>

        <el-table-column align="center" prop="passScore" label="及格分数"></el-table-column>

        <el-table-column align="center" prop="duration" label="考试时长(分)"></el-table-column>

        <el-table-column align="center" label="状态">
          <template slot-scope="scope">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button icon="el-icon-view" type="success" size="mini" @click="previewExam(scope.row.examId)">
              预览
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

    <el-dialog title="试卷预览" center :visible.sync="examQuestionDialog">
      <el-card>
        <!--题目信息-->
        <div v-for="(item,index) in questionInfo" :key="index" style="margin-top: 15px">
          <div>
            <i class="num">{{ index + 1 }}</i>
            <span v-if="item.questionType === 1">【单选题】</span>
            <span v-else-if="item.questionType === 2">【多选题】</span>
            <span v-else-if="item.questionType === 3">【判断题】</span>
            <span v-else-if="item.questionType === 4">【填空题】</span>
            <span v-else-if="item.questionType === 5">【简答题】</span>
            <span>{{ item.questionContent }}</span>
          </div>
          <!--题目中的配图-->
          <img v-for="url in item.images" :src="imgUrl+url" title="点击查看大图" alt="题目图片"
               style="width: 100px;height: 100px;cursor: pointer" @click="showBigImg(imgUrl+url)">

          <!--单选 和 判断 的答案列表-->
          <div style="margin-top: 25px"
               v-show="item.questionType === 1 || item.questionType === 3">
            <div class="el-radio-group">
              <label v-for="(i2,index2) in item.answer"
                     :class="i2.isTrue === 'true'?'true' : ''">
                <span>{{ optionName[index2] + '、' + i2.answer }}</span>
              </label>
            </div>
          </div>

          <!--多选的答案列表-->
          <div style="margin-top: 25px" v-show="item.questionType === 2">
            <div class="el-radio-group">
              <label v-for="(i2,index2) in item.answer"
                     :class="i2.isTrue === 'true'?'true' : ''">
                <span>{{ optionName[index2] + '、' + i2.answer }}</span>
              </label>
            </div>
          </div>

          <!--填空的答案列表-->
          <div style="margin-top: 25px" v-show="item.questionType === 4">
            <div>正确答案：
                <span v-for="(i2,index2) in item.answer">
                  {{ index2 + 1+ '、' + i2.answer+"&nbsp;&nbsp;&nbsp;&nbsp;" }}
                </span>
            </div>
          </div>

        </div>

      </el-card>
      <div slot="footer" class="dialog-footer">
        <el-button @click="examQuestionDialog = false">取 消</el-button>
        <el-button type="primary" @click="examQuestionDialog = false">确 定</el-button>
      </div>
    </el-dialog>
    <!--图片回显-->
    <el-dialog :visible.sync="bigImgDialog" @close="bigImgDialog = false">
      <img style="width: 100%" :src="bigImgUrl">
    </el-dialog>

  </el-container>

</template>

<script>
import exam from '@/api/exam'
import question from "../../api/question";

export default {
  name: 'ExamManage',
  data() {
    return {
      imgUrl: process.env.VUE_APP_IMAGE_URL,
      //考试的详细信息
      examQuestionDialog: false,
      //当前考试的题目
      questionInfo: [],
      //答案的选项名abcd数据
      optionName: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      //大图的对话图片地址
      bigImgUrl: '',
      bigImgDialog: false,
      queryInfo: {
        'examType': null,
        'startTime': null,
        'create': null,
        'endTime': null,
        'examName': null,
        'isMark': 0,
        'subsection': null,
        'pageNo': 0,
        'pageSize': 10
      },
      //表格是否在加载
      loading: true,
      //考试类型信息
      examType: [
        {
          info: '公开考试',
          type: 1
        },
        {
          info: '需要密码',
          type: 2
        }
      ],
      //被选择的考试的行
      selectionTable: [],
      //表格多行选中的操作信息
      operation: '',
      //支持操作的信息
      operationInfo: [
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
      //考试信息
      examInfo: [],
      //查询到的考试总数
      total: 0,

    }
  },
  created() {
    this.getExamInfo()
  },
  methods: {
    //根据ids查询题目信息
    async getQuestionInfoByIds(questionIds) {
      await question.getQuestionByIds({ids: questionIds}).then((resp) => {
        if (resp.code === 200) {
          this.questionInfo = resp?.data?.data || []
          //重置问题的顺序 单选 多选 判断 简答
          this.questionInfo = this.questionInfo.sort(function (a, b) {
            return a.questionType - b.questionType
          })
          this.examQuestionDialog = true
        }
      })
    },
    //点击展示高清大图
    showBigImg(url) {
      this.bigImgUrl = url
      this.bigImgDialog = true
    },
    previewExam(id) {
      exam.getQuestionIdsByExamId({examId:id}).then(resp=>{
        this.getQuestionInfoByIds(resp.data)
      })
    },
    //考试类型搜索
    typeChange(val) {
      this.queryInfo.examType = val
      this.getExamInfo()
    },
    //操作多行表格信息
    operationChange(val) {
      let examIds = []
      this.selectionTable.forEach(item => {
        examIds.push(item.examId)
      })
      if (val === 'on') {
        exam.operationExam(1, {'ids': examIds.join(',')}).then((resp) => {
          if (resp.code === 200) {
            this.getExamInfo()
            this.$notify({
              'type': 'success',
              'title': 'Tips',
              'message': '操作成功',
              'duration': 2000
            })
          }
        })
      } else if (val === 'off') {
        exam.operationExam(2, {'ids': examIds.join(',')}).then((resp) => {
          if (resp.code === 200) {
            this.getExamInfo()
            this.$notify({
              'type': 'success',
              'title': 'Tips',
              'message': '操作成功',
              'duration': 2000
            })
          }
        })
      } else if (val === 'delete') {
        exam.operationExam(3, {'ids': examIds.join(',')}).then((resp) => {
          if (resp.code === 200) {
            this.getExamInfo()
            this.$notify({
              'type': 'success',
              'title': 'Tips',
              'message': '操作成功',
              'duration': 2000
            })
          }
        })
      }
    },
    //查询考试信息
    getExamInfo() {
      exam.getExamInfo(this.queryInfo).then((resp) => {
        if (resp.code === 200) {
          resp.data.data.forEach(item => {
            item.startTime = String(item.startTime).substring(0, 10)
            item.endTime = String(item.endTime).substring(0, 10)
          })
          this.examInfo = resp.data.data
          this.total = resp.data.total
          this.loading = false
        }
      })
    },
    //处理表格被选中
    handleTableSectionChange(val) {
      this.selectionTable = val
    },
    //分页页面大小改变
    handleSizeChange(val) {
      this.queryInfo.pageSize = val
      this.getExamInfo()
    },
    //分页插件的页数
    handleCurrentChange(val) {
      this.queryInfo.pageNo = val
      this.getExamInfo()
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/css/teacher/examManage";
</style>
