import Vue from 'vue'

const getRandomId = () => {
  return Math.floor(Math.random() * 10000000);
}

const validFormAndInvoke = (formEl, success, message = '信息有误', fail = function () {
}) => {
  if (!formEl) {
    return
  }
  formEl.validate(valid => {
    if (valid) {
      success()
      formEl.resetFields()
    } else {
      Vue.prototype.$notify({
        title: 'Tips',
        message: message,
        type: 'error',
        duration: 2000
      })
      fail()
      return false
    }
  })
}


const validFormNotEmpty = (formEl, success, message, fail = function () {
}) => {
  if (!formEl) {
    return
  }
  formEl.validate(valid => {
    if (valid) {
      success()
    } else {
      Vue.prototype.$notify({
        title: 'Tips',
        message: message,
        type: 'error',
        duration: 2000
      })
      fail()
      return false
    }
  })
}

export default {
  validFormAndInvoke,
  validFormNotEmpty,
  getRandomId
}
