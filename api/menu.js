import request from '@/utils/request'

export default {
  getMenuInfo () {
    return request({
      url: '/public/getMenu',
      method: 'get'
    })
  }
}
