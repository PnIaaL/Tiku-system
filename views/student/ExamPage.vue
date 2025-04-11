<template>

  <el-container v-if="show">
    <el-header style="margin-top: 60px">
      <el-row>
        <el-col :span="18" :offset="3" style="border-bottom: 1px solid #f5f5f5">
          <span class="startExam">开始考试</span>
          <span class="examTitle">距离考试结束还有：</span>
          <span style="color: red;font-size: 18px;">{{ duration | timeFormat }}</span>
          <el-button type="warning" round
                     style="background-color: #ffd550;float: right;color: black;font-weight: 800"
                     @click="uploadExamToAdmin">提交试卷
          </el-button>
        </el-col>
      </el-row>
    </el-header>

    <el-main>
      <el-row>
        <el-col :span="18" :offset="3">
          <el-col :span="16">
            <el-card style="min-height: 500px">
              <!--题目信息-->
              <div>
                <i class="num">{{ curIndex + 1 }}</i>
                <span v-if="questionInfo[curIndex].questionType === 1">【单选题】</span>
                <span v-else-if="questionInfo[curIndex].questionType === 2">【多选题】</span>
                <span v-else-if="questionInfo[curIndex].questionType === 3">【判断题】</span>
                <span v-else-if="questionInfo[curIndex].questionType === 4">【填空题】</span>
                <span v-else>【简答题】</span>
                <span>{{ questionInfo[curIndex].questionContent }}</span>
              </div>
              <!--题目中的配图-->
              <img v-for="url in questionInfo[curIndex].images" :src="imgUrl+url" title="点击查看大图" alt="题目图片"
                   style="width: 100px;height: 100px;cursor: pointer" @click="showBigImg(url)">

              <!--单选 和 判断 的答案列表-->
              <div style="margin-top: 25px"
                   v-show="questionInfo[curIndex].questionType === 1 || questionInfo[curIndex].questionType === 3">
                <div class="el-radio-group">
                  <label v-for="(item,index) in questionInfo[curIndex].answer"
                         @click="checkSingleAnswer(index)"
                         :class="index === userAnswer[curIndex] ? 'active' : ''">
                    <span>{{ optionName[index] + '、' + item.answer }}</span>
                  </label>
                </div>
              </div>

              <!--多选的答案列表-->
              <div style="margin-top: 25px" v-show="questionInfo[curIndex].questionType === 2">
                <div class="el-radio-group">
                  <label v-for="(item,index) in questionInfo[curIndex].answer"
                         @click="selectedMultipleAnswer(index)"
                         :class="(userAnswer[curIndex]+'').indexOf(index+'') !== -1? 'active' : ''">
                    <span>{{ optionName[index] + '、' + item.answer }}</span>
                  </label>
                </div>
              </div>

              <!--填空题的答案-->
              <div style="margin-top: 25px" v-show="questionInfo[curIndex].questionType === 4">
                <div style="color: red">* 多个空请用“ ; ”隔开</div>
                <el-input
                  type="textarea"
                  :rows="8"
                  placeholder="请输入答案"
                  v-model="userAnswer[curIndex]">
                </el-input>
              </div>

              <!--简答题的答案-->
              <div style="margin-top: 25px" v-show="questionInfo[curIndex].questionType === 5">
                <el-input
                  type="textarea"
                  :rows="8"
                  placeholder="请输入答案"
                  v-model="userAnswer[curIndex]">
                </el-input>
              </div>

              <!--上一题 下一题-->
              <div style="margin-top: 25px">
                <el-button type="primary" icon="el-icon-back" :disabled="curIndex<1" @click="curIndex--">上一题</el-button>
                <el-button type="primary" icon="el-icon-right" :disabled="curIndex>=questionInfo.length-1"
                           @click="curIndex++">下一题
                </el-button>
              </div>

            </el-card>
          </el-col>

          <el-col :span="7" :offset="1">
            <!--答题卡卡片-->
            <el-card>
              <div>
                <p style="font-size: 18px;">答题卡</p>
                <div style="margin-top: 25px">
                  <span
                    style="background-color: rgb(238,238,238);padding: 5px 10px 5px 10px;margin-left: 15px">未作答</span>
                  <span style="background-color: rgb(87,148,247);color: white;
                padding: 5px 10px 5px 10px;margin-left: 15px">已作答</span>
                </div>
              </div>

              <!--单选的答题卡-->
              <div style="margin-top: 25px">
                <p style="font-size: 18px;">单选题</p>
                <el-button style="margin-top: 10px;margin-left: 15px" size="mini"
                           v-show="questionInfo[item-1].questionType === 1"
                           :class="questionInfo[item-1].questionType === 1 && userAnswer[item-1] !== undefined ?
                            'done' : userAnswer[item-1] === undefined ? curIndex === (item-1) ? 'orange' : 'noAnswer' : 'noAnswer'"
                           v-for="item in questionInfo.length" :key="item" @click="curIndex = item-1">{{ item }}
                </el-button>
              </div>

              <!--多选的答题卡-->
              <div style="margin-top: 25px">
                <p style="font-size: 18px;">多选题</p>
                <el-button style="margin-top: 10px;margin-left: 15px" size="mini"
                           v-show="questionInfo[item-1].questionType === 2"
                           :class="questionInfo[item-1].questionType === 2 && userAnswer[item-1] !== undefined ?
                            'done' : userAnswer[item-1] === undefined ? curIndex === (item-1) ? 'orange' : 'noAnswer' : 'noAnswer'"
                           v-for="item in questionInfo.length" :key="item" @click="curIndex = item-1">{{ item }}
                </el-button>
              </div>

              <!--判断的答题卡-->
              <div style="margin-top: 25px">
                <p style="font-size: 18px;">判断题</p>
                <el-button style="margin-top: 10px;margin-left: 15px" size="mini"
                           v-show="questionInfo[item-1].questionType === 3"
                           :class="questionInfo[item-1].questionType === 3 && userAnswer[item-1] !== undefined ?
                            'done' : userAnswer[item-1] === undefined ? curIndex === (item-1) ? 'orange' : 'noAnswer' : 'noAnswer'"
                           v-for="item in questionInfo.length" :key="item" @click="curIndex = item-1">{{ item }}
                </el-button>
              </div>

              <!--填空的答题卡-->
              <div style="margin-top: 25px">
                <p style="font-size: 18px;">填空题</p>
                <el-button style="margin-top: 10px;margin-left: 15px" size="mini"
                           v-show="questionInfo[item-1].questionType === 4"
                           :class="questionInfo[item-1].questionType === 4 && userAnswer[item-1] !== undefined ?
                            'done' : userAnswer[item-1] === undefined ? curIndex === (item-1) ? 'orange' : 'noAnswer' : 'noAnswer'"
                           v-for="item in questionInfo.length" :key="item" @click="curIndex = item-1">{{ item }}
                </el-button>
              </div>

              <!--简答的答题卡-->
              <div style="margin-top: 25px">
                <p style="font-size: 18px;">简答题</p>
                <el-button style="margin-top: 10px;margin-left: 15px" size="mini"
                           v-show="questionInfo[item-1].questionType === 5"
                           :class="questionInfo[item-1].questionType === 5 && userAnswer[item-1] !== undefined ?
                            'done' : userAnswer[item-1] === undefined ? curIndex === (item-1) ? 'orange' : 'noAnswer' : 'noAnswer'"
                           v-for="item in questionInfo.length" :key="item" @click="curIndex = item-1">{{ item }}
                </el-button>
              </div>
            </el-card>
          </el-col>

        </el-col>
      </el-row>
      <video id="video" muted="muted" style="float:right;position: fixed;top: 80%;left: 85%" width="200px"
             height="200px" autoplay="autoplay"></video>
      <canvas id="canvas" hidden width="200px" height="200px"></canvas>
    </el-main>
    <!--图片回显-->
    <el-dialog :visible.sync="bigImgDialog" @close="bigImgDialog = false">
      <img style="width: 100%" :src="imgUrl+bigImgUrl">
    </el-dialog>
  </el-container>

</template>

<script>

import exam from '@/api/exam'
import question from '@/api/question'
import ossUtils from '@/api/ossUtils'

export default {
  name: 'ExamPage',
  data() {
    return {
      imgUrl: process.env.VUE_APP_IMAGE_URL,
      //当前考试的信息
      examInfo: {},
      //当前的考试题目
      questionInfo: [
        {
          questionType: ''
        }
      ],
      //当前题目的索引值
      curIndex: 0,
      //控制大图的对话框
      bigImgDialog: false,
      //当前要展示的大图的url
      bigImgUrl: '',
      //用户选择的答案
      userAnswer: [],
      //页面数据加载
      loading: {},
      //页面绘制是否开始
      show: false,
      //答案的选项名abcd数据
      optionName: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      //考试总时长
      duration: 0,
    }
  },
  created() {
    this.getExamInfo()
    //页面数据加载的等待状态栏
    this.loading = this.$Loading.service({
      body: true,
      lock: true,
      text: '数据拼命加载中,(*╹▽╹*)',
      spinner: 'el-icon-loading',
    })
  },
  mounted() {
    //关闭浏览器窗口的时候移除 localstorage的时长
    let userAgent = navigator.userAgent //取得浏览器的userAgent字符串
    let isOpera = userAgent.indexOf('Opera') > -1 //判断是否Opera浏览器
    let isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera //判断是否IE浏览器
    let isIE11 = userAgent.indexOf('rv:11.0') > -1 //判断是否是IE11浏览器
    let isEdge = userAgent.indexOf('Edge') > -1 && !isIE //判断是否IE的Edge浏览器
    if (!isIE && !isEdge && !isIE11) {//兼容chrome和firefox
      let _beforeUnload_time = 0, _gap_time = 0
      let is_fireFox = navigator.userAgent.indexOf('Firefox') > -1//是否是火狐浏览器
      window.onunload = function () {
        _gap_time = new Date().getTime() - _beforeUnload_time
        if (_gap_time <= 5) {
          localStorage.removeItem('examDuration' + this.examInfo.examId)
        } else {//谷歌浏览器刷新
        }
      }
      window.onbeforeunload = function () {
        _beforeUnload_time = new Date().getTime()
        if (is_fireFox) {//火狐关闭执行
        } else {//火狐浏览器刷新
        }
      }
    }
  },
  methods: {
    //查询当前考试的信息
    getExamInfo() {
      exam.getExamInfoById(this.$route.params).then((resp) => {
        if (resp.code === 200) {
          this.examInfo = resp.data
          //设置定时(秒)
          try {
            const examDuration = JSON.parse(localStorage.getItem('examDuration' + this.examInfo.examId) || "{}");
            if (examDuration.duration === 0 || Date.now() >= (examDuration.timestamp || Date.now()) + (examDuration.duration * 1000 || Date.now())) {
              localStorage.removeItem('examDuration' + this.examInfo.examId)
            }
            this.duration = Math.min(JSON.parse(localStorage.getItem('examDuration' + this.examInfo.examId) || "{}").duration || resp.data.examDuration * 60, resp.data.examDuration * 60)
          } catch (e) {
            localStorage.removeItem('examDuration' + this.examInfo.examId)
          }
          //考试剩余时间定时器
          this.timer = window.setInterval(() => {
            if (this.duration > 0) this.duration--
          }, 1000)
          this.getQuestionInfo(resp.data.questionIds.split(','))
        }
      })
    },
    //查询考试的题目信息
    async getQuestionInfo(ids) {
      await question.getQuestionByIds({'ids': ids.join(',')}).then(resp => {
        if (resp.code === 200) {
          this.questionInfo = resp?.data?.data || []
          //重置问题的顺序 单选 多选 判断 简答
          this.questionInfo = this.questionInfo.sort(function (a, b) {
            return a.questionType - b.questionType
          })
        }
      })
      this.loading.close()
      this.show = true
    },
    //点击展示高清大图
    showBigImg(url) {
      this.bigImgUrl = url
      this.bigImgDialog = true
    },
    //检验单选题的用户选择的答案
    checkSingleAnswer(index) {
      this.$set(this.userAnswer, this.curIndex, index)
    },
    //多选题用户的答案选中
    selectedMultipleAnswer(index) {
      if (this.userAnswer[this.curIndex] === undefined) {
        //当前是多选的第一个答案
        this.$set(this.userAnswer, this.curIndex, index)
      } else if (String(this.userAnswer[this.curIndex]).split(',').includes(index + '')) {
        //取消选中
        let newArr = []
        String(this.userAnswer[this.curIndex]).split(',').forEach(item => {
          if (item !== '' + index) newArr.push(item)
        })
        if (newArr.length === 0) {
          this.$set(this.userAnswer, this.curIndex, undefined)
        } else {
          this.$set(this.userAnswer, this.curIndex, newArr.join(','))
          //答案格式化顺序DBAC -> ABCD
          this.userAnswer[this.curIndex] = String(this.userAnswer[this.curIndex]).split(',').sort(function (a, b) {
            return a - b
          }).join(',')
        }
      } else if (!((this.userAnswer[this.curIndex] + '').split(',').includes(index + ''))) {//第n个答案
        this.$set(this.userAnswer, this.curIndex, this.userAnswer[this.curIndex] += ',' + index)
        //答案格式化顺序DBAC -> ABCD
        this.userAnswer[this.curIndex] = String(this.userAnswer[this.curIndex]).split(',').sort(function (a, b) {
          return a - b
        }).join(',')
      }
    },
    //提交考试答案
    submitExam(data){
      exam.addExamRecord(data).then((resp) => {
        if (resp.code === 200) {
          this.$notify({
            title: 'Tips',
            message: '考试结束 *^▽^*',
            type: 'success',
            duration: 2000
          })
          this.$router.push('/examResult/' + resp.data)
        }
      })
    },
    //上传用户考试信息进入后台
    async uploadExamToAdmin() {
      // 正则
      let reg1 = new RegExp('-', 'g')
      let reg2 = new RegExp('；', 'g')
      // 去掉用户输入的非法分割符号(-),保证后端接受数据处理不报错
      this.userAnswer.forEach((item, index) => {
        if (this.questionInfo[index].questionType === 5) {//简答题答案处理
          this.userAnswer[index] = item.replace(reg1, ' ')
        }else if (this.questionInfo[index].questionType === 4) {//填空题答案处理
          this.userAnswer[index] = item.replace(reg1, ' ')
          this.userAnswer[index] = item.replace(reg2, ';')
        }
      })

      // 标记题目是否全部做完
      let flag = true
      for (let i = 0; i < this.userAnswer.length; i++) {// 检测用户是否题目全部做完
        if (this.userAnswer[i] === undefined) {
          flag = false
        }
      }
      // 如果用户所有答案的数组长度小于题目长度,这个时候也要将标志位置为false
      if (this.userAnswer.length < this.questionInfo.length) {
        flag = false
      }
      //题目未做完
      if (!flag) {
        this.$confirm('当前试题暂未做完, 是否继续提交o(╥﹏╥)o ?', 'Tips', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let data = {}
          data.questionIds = []
          data.userAnswers = this.userAnswer.join('-')
          this.questionInfo.forEach((item, index) => {
            data.questionIds.push(item.questionId)
            //当前数据不完整,用户回答不完整(我们自动补充空答案,防止业务出错)
            if (index > (this.userAnswer.length - 1)) {
              data.userAnswers += '- '
            }
          })
          //如果所有题目全部未答
          if (this.userAnswer.length === 0) {
            this.questionInfo.forEach(item => {
              data.userAnswers += ' -'
            })
            data.userAnswers.split(0, data.userAnswers.length - 1)
          }
          data.examId = parseInt(this.$route.params.examId)
          data.questionIds = data.questionIds.join(',')
          this.submitExam(data)
        }).catch(() => {
          this.$notify({
            title: 'Tips',
            message: '继续加油! *^▽^*',
            type: 'success',
            duration: 2000
          })
        })
      } else {
        //当前题目做完了
        let data = {}
        data.questionIds = []
        data.userAnswers = this.userAnswer.join('-')
        data.examId = parseInt(this.$route.params.examId)
        this.questionInfo.forEach((item, index) => {
          data.questionIds.push(item.questionId)
        })
        data.questionIds = data.questionIds.join(',')
        this.submitExam(data)
      }
    }
  },
  watch: {
    //监控考试的剩余时间
    async duration(newVal) {
      const examDuration = {
        duration: newVal,
        timestamp: Date.now()
      };
      localStorage.setItem('examDuration' + this.examInfo.examId, JSON.stringify(examDuration));
      //考试时间结束了提交试卷
      if (newVal < 1) {
        let data = {}
        data.questionIds = []
        data.userAnswers = this.userAnswer.join('-')
        this.questionInfo.forEach((item, index) => {
          data.questionIds.push(item.questionId)
          //当前数据不完整,用户回答不完整(我们自动补充空答案,防止业务出错)
          if (index > this.userAnswer.length) {
            data.userAnswers += ' -'
          }
        })
        //如果所有题目全部未答
        if (data.userAnswers === '') {
          this.questionInfo.forEach(item => {
            data.userAnswers += ' -'
          })
          data.userAnswers.split(0, data.userAnswers.length - 1)
        }
        data.examId = parseInt(this.$route.params.examId)

        data.questionIds = data.questionIds.join(',')
        exam.addExamRecord(data).then((resp) => {
          if (resp.code === 200) {
            this.$notify({
              title: 'Tips',
              message: '考试时间结束,已为您自动提交 *^▽^*',
              type: 'success',
              duration: 2000
            })
            this.$router.push('/examResult/' + resp.data)
          }
        })
      }
    },
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/css/student/examPage";
</style>
