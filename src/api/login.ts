import request from '@/utils/request'
import type { ApiResponse } from '@/types'

// 登录方法
export function login(username: string, password: string, code?: string, uuid?: string) {
  return request<ApiResponse<string>>({
    url: '/auth/login',
    method: 'post',
    data: { username, password, code, uuid }
  })
}

// 退出方法
export function logout(token: string) {
  return request<ApiResponse<void>>({
    url: '/auth/logout',
    method: 'delete',
    headers: {
      Authorization: token
    }
  })
}

// 获取验证码
export function getCodeImg() {
  return request<ApiResponse<{
    img: string
    uuid: string
  }>>({
    url: '/auth/code',
    method: 'get'
  })
}

// 获取用户详细信息
export function getInfo(token: string) {
  return request<ApiResponse<{
    user: {
      username: string
      avatar?: string
    }
    roles: string[]
    permissions: string[]
  }>>({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

// 获取菜单路由
export function buildRoute() {
  return request<ApiResponse<any[]>>({
    url: '/user/info/getRouters',
    method: 'get'
  })
}
