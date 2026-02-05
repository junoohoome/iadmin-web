import request from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types'

// 操作日志查询参数
export interface OperLogQueryParams {
  page: number
  limit: number
  title?: string
  operName?: string
  businessType?: string
  status?: string
  beginTime?: string
  endTime?: string
}

// 操作日志
export interface OperLog {
  operId: number
  title: string
  businessType: number
  method: string
  requestMethod: string
  operatorType: number
  operName: string
  deptName: string
  operUrl: string
  operIp: string
  operLocation: string
  operParam: string
  jsonResult: string
  status: number
  errorMsg: string
  operTime: string
  costTime: number
}

// 查询操作日志列表
export function list(query: OperLogQueryParams) {
  return request<ApiResponse<PageResult<OperLog>>>({
    url: '/sysOperLog/list',
    method: 'get',
    params: query
  })
}

// 删除操作日志
export function delOperlog(ids: number[]) {
  return request<ApiResponse<void>>({
    url: `/sysOperLog/${ids.join(',')}`,
    method: 'delete'
  })
}

// 清空操作日志
export function cleanOperlog() {
  return request<ApiResponse<void>>({
    url: '/sysOperLog/clean',
    method: 'delete'
  })
}

// 导出操作日志
export function exportOperlog(query: OperLogQueryParams) {
  return request<Blob>({
    url: '/sysOperLog/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
