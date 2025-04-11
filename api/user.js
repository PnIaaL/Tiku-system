import request from '@/utils/request'

export default {
  getCurrentUser () {
    return request({
      url: '/public/getCurrentUser',
      method: 'get'
    })
  },
  updateCurrentUser (updateUser) {
    return request({
      url: '/public/updateCurrentUser',
      method: 'post',
      data: updateUser
    })
  },
  getUserByIds (userIds) {
    return request({
      url: `/teacher/getUserByIds`,
      params: userIds,
      method: 'get'
    })
  },
  getUserInfo (params) {
    return request({
      url: '/admin/getUser',
      method: 'get',
      params: params
    })
  },
  handlerUser (operateId, params) {
    return request({
      url: `/admin/handleUser/${operateId}`,
      method: 'get',
      params: params
    })
  },
  addUser (data) {
    return request({
      url: '/admin/addUser',
      method: 'post',
      data: data
    })
  }
}
