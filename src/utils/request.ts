import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessageBox, ElMessage, ElNotification } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getToken } from '@/utils/auth'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 120000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {

    const token = getToken()
    if (token) {
      config.headers.Authorization = token
    }
    config.headers['Content-Type'] = 'application/json'
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {

    const code = response.data.code
    if (code === 401) {
      ElMessageBox.confirm(
        '登录状态已过期，您可以继续留在该页面，或者重新登录',
        '系统提示',
        {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const userStore = useUserStore()
        userStore.logout().then(() => {
          location.reload()
        })
      })
    } else if (code < 200 || code > 300) {
      ElNotification.error({
        title: response.data.msg || '请求失败'
      })
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  (error) => {

    // 尝试从响应中获取更详细的错误信息
    let errorMsg = '请求失败'
    if (error.response?.data) {
      const data = error.response.data
      errorMsg = data.msg || data.message || errorMsg
    } else if (error.message) {
      errorMsg = error.message
    }

    ElMessage({
      message: errorMsg,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

// 定义请求方法类型
interface RequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean
}

function request<T = any>(config: RequestConfig): Promise<T> {
  return service(config) as Promise<T>
}

export default request
