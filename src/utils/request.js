import axios from 'axios'
import { MessageBox, Message, Notification } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import Config from '@/settings'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // api 的 base_url
  timeout: Config.timeout // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (getToken()) {
      // 让每个请求携带自定义token 请根据实际情况自行修改
      config.headers['Authorization'] = getToken()
    }
    config.headers['Content-Type'] = 'application/json'
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(res => {
  const code = res.data.code
  if (code === 401) {
    MessageBox.confirm(
      '登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示',
      {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      store.dispatch('user/logout').then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
      })
    })
  } else if (code < 200 || code > 300) {
    Notification.error({
      title: res.data.msg
    })
    return Promise.reject('error')
  } else {
    return res.data.data
  }
},
error => {
  console.log('err' + error)
  Message({
    message: error.message,
    type: 'error',
    duration: 5 * 1000
  })
  return Promise.reject(error)
}
)

export default service
