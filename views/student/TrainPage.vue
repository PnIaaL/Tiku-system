<template>
  <el-container v-loading="loading">
    <el-main>
      <el-row>
        <el-card style="padding: 15px">
          <!--题目信息-->
          <div>
            <span v-if="currentBankQuestion[curIndex].questionType === 1">【单选题】</span>
            <span v-else-if="currentBankQuestion[curIndex].questionType === 2">【多选题】</span>
            <span v-else>【判断题】</span>
            {{ curIndex + 1 + '/' + currentBankQuestion.length + '、' }}
            <span>{{ currentBankQuestion[curIndex].questionContent }}:</span>
          </div>

          <!--题目中的配图-->
          <img v-for="url in currentBankQuestion[curIndex].images" :src="imgUrl+url" title="点击查看大图" alt="题目图片"
               style="width: 200px;height: 200px;cursor: pointer" @click="showBigImg(imgUrl+url)">

          <!--单选的答案列表-->
          <div style="margin-top: 25px" v-show="currentBankQuestion[curIndex].questionType !== 2">
            <div class="el-radio-group">
              <label v-for="(item,index) in currentBankQuestion[curIndex].answer"
                     @click="checkSingleAnswer(index)"
                     :class="index === userAnswer[curIndex] ? 'active' : ''">
                <span>{{ optionName[index] + '、' + item.answer }}</span>
              </label>
            </div>
          </div>
          <!--单选的提示-->
          <div
            v-if="currentBankQuestion[curIndex].questionType !== 2 && userAnswer[curIndex] && (userAnswer[curIndex]+'') !== trueAnswer[curIndex]">
            <span style="color: #1f90ff" v-text="'正确答案：' + optionName[trueAnswerIndex]"></span>
          </div>

          <!--多选的答案列表-->
          <div style="margin-top: 25px" v-show="currentBankQuestion[curIndex].questionType === 2">
            <div class="el-radio-group">
              <label v-for="(item,index) in currentBankQuestion[curIndex].answer"
                     @click="selectedMultipleAnswer(index)"
                     :class="(userAnswer[curIndex]+'').indexOf(index+'') !== -1? 'active' : ''">
                <span>{{ optionName[index] + '、' + item.answer }}</span>
              </label>
              <el-button size="small" type="primary" v-show="!confirmMultiple.includes(curIndex)"
                         @click="confirmMultipleAnswer()">
                确认答案
              </el-button>
            </div>
          </div>
          <!--多选的提示-->
          <div
            v-if="currentBankQuestion[curIndex].questionType === 2 && confirmMultiple.includes(curIndex) &&
            userAnswer[curIndex] !== undefined && String(userAnswer[curIndex]) !== String(trueAnswer[curIndex])">
            <span style="color: #1f90ff" v-text="'正确答案：' +  multipleAnswer"></span>
          </div>

          <div style="margin-top: 25px">
            <el-button type="primary" :disabled="curIndex<1" @click="curIndex--">上一题</el-button>
            <el-button type="primary" :disabled="curIndex>=currentBankQuestion.length-1" @click="curIndex++">下一题
            </el-button>
            <el-button style="float: right" @click="showAnswerCard = !showAnswerCard">
              {{showAnswerCard ? '隐藏答题卡' :'显示答题卡'}}
            </el-button>
          </div>


        </el-card>
      </el-row>

      <el-row v-if="currentBankQuestion[curIndex].questionType === 2 ? confirmMultiple.includes(curIndex) && trueAnswer[curIndex] !== userAnswer[curIndex]
       : userAnswer[curIndex]!==undefined && trueAnswer[curIndex] !== userAnswer[curIndex]">
        <el-card style="position:relative;height: 60px;margin-top: 25px;">
          整体解析：
          <br>
          <span style="font-size: 12px">{{ currentBankQuestion[curIndex].analysis }}</span>
        </el-card>
      </el-row>

      <!--正确题数和正确率-->
      <el-row>
        <el-card style="position:relative;height: 60px;margin-top: 25px;">
          <span
            style="position: absolute;color: #32cd32;font-size: 16px;left: 10%;top: 50%;transform: translateY(-50%)">
            答对: {{ trueSum }}题
          </span>
          <span
            style="position: absolute;color: #ff0000;font-size: 16px;left: 40%;top: 50%;transform: translateY(-50%)">
            答错: {{ wrongSum }}题
          </span>
          <span
            style="position: absolute;font-size: 16px;left: 60%;top: 50%;transform: translateY(-50%)">
            正确率: {{ (trueSum + wrongSum) !== 0 ? ((trueSum / (wrongSum + trueSum)) * 100).toFixed(0) + '%' : '0%' }}
          </span>
        </el-card>
      </el-row>

      <!--答题卡-->
      <el-row v-show="showAnswerCard">
        <el-card>
          <el-button style="margin-top: 10px;" :class="currentBankQuestion[item-1].questionType === 2 && !confirmMultiple.includes(item-1)?'' : userAnswer[item-1] !== undefined && (userAnswer[item-1]+'') === String(trueAnswer[item-1])
          ? 'true': userAnswer[item-1] === undefined ? '' : 'wrong'"
                     v-for="item in currentBankQuestion.length" :key="item" @click="curIndex = item-1">{{ item }}
          </el-button>
        </el-card>
      </el-row>

    </el-main>

    <!--图片回显-->
    <el-dialog :visible.sync="bigImgDialog" @close="bigImgDialog = false">
      <img style="width: 100%" :src="bigImgUrl">
    </el-dialog>
  </el-container>
</template>

<script>
import questionBank from '@/api/questionBank'
import question from '@/api/question'

export default {
  name: 'TrainPage',
  data() {
    return {
      imgUrl: process.env.VUE_APP_IMAGE_URL,
      //当前题库id
      bankId: this.$route.params.bankId,
      //当前训练类型(1顺序,2随机,3单选,4多选,5判断)
      trainType: this.$route.params.trainType,
      //当前题库的所有题目信息
      currentBankQuestion: [
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
      //页面加载题库数据
      loading: true,
      //答案的选项名abcd数据
      optionName: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      //单选的答案确定,
      singleAnswer: '',
      //用户选择的答案
      userAnswer: [],
      //正确答案
      trueAnswer: [],
      //是否显示答题卡
      showAnswerCard: false,
      //用户答对几题
      trueSum: 0,
      //用户答错几题
      wrongSum: 0,
      //已经确定答案的多选题序号
      confirmMultiple: []
    }
  },
  props: ['tagInfo'],
  created() {
    //一创建就改变头部的面包屑
    this.$emit('giveChildChangeBreakInfo', '开始训练', '在线考试')
    this.createTagsInParent()
    this.getQuestionInfo()
  },
  methods: {
    //向父组件中添加头部的tags标签
    createTagsInParent() {
      let flag = false
      this.tagInfo.map(item => {
        //如果tags全部符合
        if (item.name === '开始训练' && item.url === this.$route.path) {
          flag = true
        } else if (item.name === '开始训练' && item.url !== this.$route.path) {
          this.$emit('updateTagInfo', '开始训练', this.$route.path)
          flag = true
        }
      })
      if (!flag) this.$emit('giveChildAddTag', '开始训练', this.$route.path)
    },
    //获取题目顺序 并按照对应方式加载
    getQuestionInfo() {
      switch (parseInt(this.$route.params.trainType)) {
        case 1: {//顺序生成题目
          questionBank.getQuestionByBank({'bankId': this.bankId}).then((resp) => {
            if (resp.code === 200) {
              this.currentBankQuestion = resp.data
              this.loading = false
              //获取正确答案
              this.getTrueAnswer()
            }
          })
          break
        }
        case 2: {//随机练习
          questionBank.getQuestionByBank({'bankId': this.bankId}).then((resp) => {
            if (resp.code === 200) {
              //随机打乱题目
              let arr = resp.data
              for (let i = arr.length - 1; i >= 0; i--) {
                let randomIndex = Math.floor(Math.random() * (i + 1))
                let itemAtIndex = arr[randomIndex]
                arr[randomIndex] = arr[i]
                arr[i] = itemAtIndex
              }
              this.currentBankQuestion = arr
              this.loading = false
              //获取正确答案
              this.getTrueAnswer()
            }
          })
          break
        }
        case 3: {//单选题模式
          question.getQuestionByBankIdAndType({
            'bankId': this.bankId,
            'type': 1
          }).then((resp) => {
            if (resp.code === 200) {
              this.currentBankQuestion = resp.data
              this.loading = false
              //获取正确答案
              this.getTrueAnswer()
            }
          })
          break
        }
        case 4: {//多选题模式
          question.getQuestionByBankIdAndType({
            'bankId': this.bankId,
            'type': 2
          }).then((resp) => {
            if (resp.code === 200) {
              this.currentBankQuestion = resp.data
              this.loading = false
              //获取正确答案
              this.getTrueAnswer()
            }
          })
          break
        }
        case 5: {//判断题模式
          question.getQuestionByBankIdAndType({
            'bankId': this.bankId,
            'type': 3
          }).then((resp) => {
            if (resp.code === 200) {
              this.currentBankQuestion = resp.data
              this.loading = false
              //获取正确答案
              this.getTrueAnswer()
            }
          })
          break
        }
      }
    },
    //点击展示高清大图
    showBigImg(url) {
      this.bigImgUrl = url
      this.bigImgDialog = true
    },
    //检验单选题的用户选择的答案
    checkSingleAnswer(index) {
      if (this.userAnswer[this.curIndex] === undefined && (index + '') === this.trueAnswer[this.curIndex]) {//答题并且是对的
        this.userAnswer[this.curIndex] = index
        this.trueSum++
        if (this.curIndex < this.trueAnswer.length - 1) this.nextQuestion()
      } else if (this.userAnswer[this.curIndex] === undefined && (index + '') !== this.trueAnswer[this.curIndex]) {//答题是错误的答案
        this.userAnswer[this.curIndex] = index
        this.wrongSum++
      }
    },
    //多选题用户的答案选中
    selectedMultipleAnswer(index) {
      if (!this.confirmMultiple.includes(this.curIndex)) {//当前题目还没确认答案
        if (this.userAnswer[this.curIndex] === undefined) {//当前是多选的第一个答案
          this.$set(this.userAnswer, this.curIndex, index)
        } else if (String(this.userAnswer[this.curIndex]).split(',').includes(index + '')) {//取消选中
          let newArr = []
          String(this.userAnswer[this.curIndex]).split(',').forEach(item => {
            if (item !== '' + index) newArr.push(item)
          })
          if (newArr.length === 0) {
            this.$set(this.userAnswer, this.curIndex, undefined)
          } else {
            this.$set(this.userAnswer, this.curIndex, newArr.join(','))
          }
        } else if (!((this.userAnswer[this.curIndex] + '').split(',').includes(index + ''))) {//第n个答案
          this.$set(this.userAnswer, this.curIndex, this.userAnswer[this.curIndex] += ',' + index)
        }
      }
    },
    //当前题库的正确答案的数据
    getTrueAnswer() {
      let x = []
      this.currentBankQuestion.forEach((item, index) => {
        x = []
        item.answer.map((i2, index2) => {
          if (i2.isTrue === 'true') x.push(index2)
        })
        //放入正确答案中
        this.trueAnswer[index] = x.join(',')
      })
    },
    //多选题确认
    confirmMultipleAnswer() {
      //答案格式化
      this.userAnswer[this.curIndex] = String(this.userAnswer[this.curIndex]).split(',').sort(function (a, b) {
        return a - b
      }).join(',')
      if (this.userAnswer[this.curIndex] === this.trueAnswer[this.curIndex]) {
        this.confirmMultiple.push(this.curIndex)
        this.trueSum++
        this.nextQuestion()
      } else {
        this.wrongSum++
        this.confirmMultiple.push(this.curIndex)
      }
    },
    //自动切换下一题
    nextQuestion() {
      this.curIndex = Math.min(this.curIndex + 1, this.currentBankQuestion.length - 1)
    }
  },
  computed: {
    //题目正确的下标
    trueAnswerIndex() {
      let answer = []
      this.currentBankQuestion[this.curIndex].answer.forEach((item, index) => {
        if (item.isTrue === 'true') answer.push(index)
      })
      return answer.join(',')
    },
    //多选题的正确答案提示
    multipleAnswer() {
      let res = String()
      String(this.trueAnswer[this.curIndex]).split(',').forEach(item => {
        res += String(this.optionName[parseInt(item)])
      })
      return res
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/css/student/trainPage";
</style>
