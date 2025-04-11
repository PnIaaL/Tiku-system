import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'

import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css' // Progress 进度条样式
// 进度条配置项
NProgress.configure({
  showSpinner: false
})

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: () => import('../views/auth/Login')
  },
  {
    path: '/register',
    component: () => import('../views/auth/Register')
  },
  {
    path: '/index',
    component: () => import('../views/index/Main'),
    redirect: '/dashboard',
    children: [
      //仪表盘介绍(all)
      {
        path: '/dashboard',
        component: () => import('../views/index/Dashboard')
      },
      //用户管理(管理员)
      {
        path: '/userManage',
        component: () => import('../views/admin/UserManage')
      },
      //角色信息(管理员)
      {
        path: '/roleManage',
        component: () => import('../views/admin/RoleManage')
      },
      //题库管理(老师和管理员)
      {
        path: '/questionManage',
        component: () => import('../views/teacher/QuestionManage')
      },
      //题库管理(老师和管理员)
      {
        path: '/questionBankMange',
        component: () => import('../views/teacher/QuestionBankManage')
      },
      //我的题库(all)
      {
        path: '/myQuestionBank',
        component: () => import('../views/student/MyQuestionBank')
      },
      //题库训练页(学生和管理员)
      {
        path: '/train/:bankId/:trainType',
        name: 'trainPage',
        component: () => import('../views/student/TrainPage')
      },
      //考试管理(老师和管理员)
      {
        path: '/examManage',
        component: () => import('../views/teacher/ExamManage')
      },
      //添加考试(老师和管理员)
      {
        path: '/addExam',
        component: () => import('../views/teacher/AddExam')
      },
      //修改考试信息(老师和管理员)
      {
        path: '/updateExam/:examId',
        name: 'updateExam',
        component: () => import('../views/teacher/UpdateExam')
      },
      //在线考试页面选择考试(学生和管理员)
      {
        path: '/examOnline',
        component: () => import('../views/student/ExamOnline')
      },
      //考试结果页(学生和管理员)
      {
        path: '/examResult/:recordId',
        name: 'examResult',
        component: () => import('../views/student/ExamResult')
      },
      //阅卷管理页面(老师和管理员)
      {
        path: '/markManage',
        component: () => import('../views/teacher/MarkManage')
      },
      //批阅试卷(老师和管理员)
      {
        path: '/markExam/:recordId',
        name: 'markExam',
        component: () => import('../views/teacher/MarkExamPage')
      },
      //我的成绩(学生和管理员)
      {
        path: '/myGrade',
        component: () => import('../views/student/MyGrade')
      },
      // 公告管理(管理员)
      {
        path: '/noticeManage',
        component: () => import('../views/admin/NoticeManage')
      },
      // 系统日志(管理员)
      {
        path: '/loggingManage',
        component: () => import('../views/admin/LoggingManage')
      },
      // 专业课程管理(管理员)
      {
        path: '/profession',
        component: () => import('../views/admin/Profession')
      },
      // 试题导入(老师和管理员)
      {
        path: '/questionImport',
        component: () => import('../views/teacher/QuestionImport')
      }
    ]
  },
  //考试界面(管理员和学生)
  {
    path: '/exam/:examId',
    name: 'exam',
    component: () => import('../views/student/ExamPage')
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  NProgress.start()

  //2个不用token的页面请求
  if (to.path === '/' || to.path === '/register' || to.path === '/loginTeacher' || to.path === '/loginAdmin') {
    return next()
  }

  //没有token的情况 直接返回登录页
  if (!window.localStorage.getItem('authorization')) {
    return next('/')
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
