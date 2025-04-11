import request from '@/utils/request'

export default {
  login (loginUser) {
    return request({
      url: '/common/login',
      method: 'post',
      data: loginUser
    })
  },
  register (registerUser) {
    return request({
      url: '/common/register',
      method: 'post',
      data: registerUser
    })
  },
  checkToken () {
    return request({
      url: '/public/checkToken',
      method: 'get'
    })
  },
  getCode (id) {
    return request({
      url: `/util/getCode?id=${id}`,
      method: 'get'
    })
  },
  checkUsername (username) {
    return request({
      url: `/common/check/${username}`,
      method: 'get'
    })
  },
}
