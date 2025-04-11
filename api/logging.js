import request from '@/utils/request'

export default {
  getAllLogging (params) {
    return request({
      url: '/admin/getLogging',
      method: 'get',
      params: params
    })
  },
  deleteLogging (params) {
    return request({
      url: '/admin/deleteLogging',
      method: 'get',
      params: params
    })
  },
}
