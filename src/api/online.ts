import request from '@/utils/request'
import type { ApiResponse } from '@/types'

// 在线用户
export interface OnlineUser {
  token: string
  userId: number
  username: string
  nickName: string
  deptId: number
  deptName: string
  ipaddr: string
  loginLocation: string
  browser: string
  os: string
  loginTime: string
  lastAccessTime: string
}

// 查询在线用户列表
export function list() {
  return request<ApiResponse<OnlineUser[]>>({
    url: '/monitor/online/list',
    method: 'get'
  })
}

// 强制用户下线
export function forceLogout(token: string) {
  return request<ApiResponse<boolean>>({
    url: `/monitor/online/${token}`,
    method: 'delete'
  })
}

// 根据用户名强制下线
export function forceLogoutByUsername(username: string) {
  return request<ApiResponse<number>>({
    url: `/monitor/online/username/${username}`,
    method: 'delete'
  })
}
