import axios from 'axios'
import {Message} from 'element-ui'
import router from "../router/index";

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL, // api 的 base_url
  timeout: process.env.VUE_APP_REQUEST_TIME_OUT // 请求超时时间
})

service.interceptors.request.use(config => {

  const token = window.localStorage.getItem('authorization')
  // 判断是否存在token，如果存在的话，则每个http header都加上token
  if (token) {
    config.headers.common['authorization'] = token
  }
  return config

}, error => {

  return Promise.reject(error)

})

// response 拦截器
service.interceptors.response.use(
  response => {
    const responseData = response.data
    if (responseData.code !== 200) {
      Message({
        message: responseData.msg,
        type: 'error',
        duration: 5 * 1000
      })
    } else {
      return responseData
    }
  },
  error => {

    const responseData = error.response.data
    if (responseData.code !== 200) {
      Message({
        message: responseData.msg ?? '服务器错误',
        type: 'error',
        duration: 5 * 1000
      })
      if (responseData.code === 401) {
        window.localStorage.removeItem('authorization')
        router.push("/")
      }
    } else {
      Message({
        message: '服务器错误',
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service
