import request from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types'

// 登录日志查询参数
export interface LoginLogQueryParams {
  page: number
  limit: number
  account?: string
  ipaddr?: string
  status?: string
  beginTime?: string
  endTime?: string
}

// 登录日志
export interface LoginLog {
  infoId: number
  username: string
  ipaddr: string
  loginLocation: string
  browser: string
  os: string
  status: number
  msg: string
  loginTime: string
}

// 查询登录日志列表
export function list(query: LoginLogQueryParams) {
  return request<ApiResponse<PageResult<LoginLog>>>({
    url: '/sysLogininfor/list',
    method: 'get',
    params: query
  })
}

// 删除登录日志
export function delLoginlog(ids: number[]) {
  return request<ApiResponse<void>>({
    url: `/sysLogininfor/${ids.join(',')}`,
    method: 'delete'
  })
}

// 清空登录日志
export function cleanLoginlog() {
  return request<ApiResponse<void>>({
    url: '/sysLogininfor/clean',
    method: 'delete'
  })
}

// 导出登录日志
export function exportLoginlog(query: LoginLogQueryParams) {
  return request<Blob>({
    url: '/sysLogininfor/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
