<template>
  <el-container>
    <el-main>
      <el-card class="box-card" shadow="always">
        <div slot="header" class="card-header">
          <p>题库管理系统</p>
        </div>

        <div>
          <el-form :model="loginForm" :rules="loginFormRules" ref="loginForm" :status-icon="true" label-width="100px">
            <el-form-item prop="username">
              <el-input prefix-icon="el-icon-user" v-model="loginForm.username" placeholder="账号"></el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" placeholder="密码"
                        show-password></el-input>
            </el-form-item>

            <el-form-item prop="code">
              <el-input class="code" prefix-icon="el-icon-chat-line-round" v-model="loginForm.code"
                        placeholder="验证码"></el-input>
              <img @click="changeCode" id="code"
                   style="float: right;margin-top: 4px;cursor: pointer" title="看不清,点击刷新"
                   alt="验证码"/>
            </el-form-item>

            <el-form-item align="center">
              <el-button type="warning" @click="$router.push('/register')" icon="el-icon el-icon-s-promotion">去注册
              </el-button>
              <el-button type="primary" @click="login($refs['loginForm'])" icon="el-icon el-icon-s-promotion">登录
              </el-button>
            </el-form-item>

          </el-form>
        </div>
      </el-card>
    </el-main>

    <Footer></Footer>
  </el-container>
</template>

<script>
import Footer from '@/components/Footer'
import utils from "../../utils/utils";
import auth from "../../api/auth";
import router from "../../router";

export default {
  name: 'Login',
  components: {Footer},
  data() {
    return {
      // 登录表单数据信息
      loginForm: {
        username: '',
        password: '',
        code: ''
      },
      captchaUrl: process.env.VUE_APP_CAPTCHA_URL,
      loginFormRules: {
        username: [
          {
            required: true,
            message: '请输入账号',
            trigger: 'blur'
          },
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 5,
            message: '密码不能小于5个字符',
            trigger: 'blur'
          }
        ],
        code: [
          {
            required: true,
            message: '请输入验证码',
            trigger: 'blur'
          },
          {
            validator: this.validateCode,
            trigger: 'blur'
          }
        ],
      },
      codeId:null,
      code:null
    }
  },
  methods:{
    // 自定义验证码校验规则
    validateCode(rule, value, callback){
      // 验证码不区分大小写
      if (value.toString().toLocaleLowerCase() !== this.code.toString().toLocaleLowerCase()) {
        callback(new Error('请输入正确的验证码'))
      } else {
        callback()
      }
    },
    login(formEl){
      utils.validFormAndInvoke(formEl, () => {
        auth.login(this.loginForm).then(resp => {
          if (resp.code === 200) {
            localStorage.setItem('authorization', resp.data)
            this.$notify({
              title: 'Tips',
              message: '登陆成功^_^',
              type: 'success',
              duration: 2000
            })
            router.push('/index')
          }
        })
      },'')
    },
    getCode(){
      auth.getCode(this.codeId).then(resp => {
        this.code = resp.data
      })
    },
    // 点击图片刷新验证码
    changeCode(){
      const codeImg = document.querySelector('#code')
      this.codeId = utils.getRandomId();
      codeImg.src = `${process.env.VUE_APP_CAPTCHA_URL}/util/getCodeImg?id=` + this.codeId
      codeImg.onload = () => this.getCode()
    }
  },
  created() {
    // 检验用户是否存在token,存在直接跳转主页
    if (localStorage.getItem('authorization') !== null) {
      auth.checkToken()
        .then(resp => {
          if (resp.code === 200) {
            router.push('/index')
          }
        })
        .catch(error => {
          localStorage.removeItem('authorization')
        })
    }
  },
  mounted() {
    this.changeCode()
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/css/auth/login";
</style>
