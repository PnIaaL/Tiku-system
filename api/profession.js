import request from "../utils/request";

export default {

  getList(param) {
    return request({
      url: '/teacher/profession/get',
      method: 'get',
      params:param
    })
  },
  deleteById(param) {
    return request({
      url: '/teacher/profession/delete',
      method: 'get',
      params: param
    })
  },
  add(form) {
    return request({
      url: '/teacher/profession/add',
      method: 'post',
      data: form
    })
  },
  update(form) {
    return request({
      url: '/teacher/profession/update',
      method: 'post',
      data: form
    })
  },
}
