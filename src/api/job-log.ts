import request from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types'

// 任务日志查询参数
export interface JobLogQueryParams {
  page: number
  limit: number
  jobName?: string
  jobGroup?: string
  status?: string
}

// 任务日志
export interface JobLog {
  jobLogId: number
  jobName: string
  jobGroup: string
  invokeTarget: string
  jobMessage: string
  status: string
  exceptionInfo: string
  createTime: string
}

// 查询任务日志列表
export function list(query: JobLogQueryParams) {
  return request<ApiResponse<PageResult<JobLog>>>({
    url: '/monitor/jobLog/list',
    method: 'get',
    params: query
  })
}

// 获取任务日志详情
export function getJobLog(jobLogId: number) {
  return request<ApiResponse<JobLog>>({
    url: `/monitor/jobLog/${jobLogId}`,
    method: 'get'
  })
}

// 删除任务日志
export function delJobLog(jobLogIds: number[]) {
  return request<ApiResponse<boolean>>({
    url: `/monitor/jobLog/${jobLogIds.join(',')}`,
    method: 'delete'
  })
}

// 清空任务日志
export function cleanJobLog() {
  return request<ApiResponse<void>>({
    url: '/monitor/jobLog/clean',
    method: 'delete'
  })
}
