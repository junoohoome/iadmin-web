import request from '@/utils/request'
import type { ApiResponse, PageResult } from '@/types'

// 定时任务查询参数
export interface JobQueryParams {
  page: number
  limit: number
  jobName?: string
  jobGroup?: string
  status?: string
}

// 定时任务
export interface Job {
  jobId: number
  jobName: string
  jobGroup: string
  invokeTarget: string
  cronExpression: string
  misfirePolicy: string
  concurrent: string
  status: string
  createTime: string
  nextValidTime?: number
}

// 定时任务表单
export interface JobFormData {
  jobId?: number
  jobName: string
  jobGroup: string
  invokeTarget: string
  cronExpression: string
  misfirePolicy: string
  concurrent: string
  status: string
}

// 查询定时任务列表
export function list(query: JobQueryParams) {
  return request<ApiResponse<PageResult<Job>>>({
    url: '/monitor/job/list',
    method: 'get',
    params: query
  })
}

// 获取定时任务详情
export function getJob(jobId: number) {
  return request<ApiResponse<Job>>({
    url: `/monitor/job/${jobId}`,
    method: 'get'
  })
}

// 新增定时任务
export function addJob(data: JobFormData) {
  return request<ApiResponse<boolean>>({
    url: '/monitor/job',
    method: 'post',
    data
  })
}

// 修改定时任务
export function updateJob(data: JobFormData) {
  return request<ApiResponse<boolean>>({
    url: '/monitor/job',
    method: 'put',
    data
  })
}

// 删除定时任务
export function delJob(jobIds: number[]) {
  return request<ApiResponse<boolean>>({
    url: `/monitor/job/${jobIds.join(',')}`,
    method: 'delete'
  })
}

// 修改任务状态
export function changeStatus(data: { jobId: number; status: string }) {
  return request<ApiResponse<boolean>>({
    url: '/monitor/job/changeStatus',
    method: 'put',
    data
  })
}

// 立即执行任务
export function runJob(jobId: number) {
  return request<ApiResponse<boolean>>({
    url: '/monitor/job/run',
    method: 'post',
    data: { jobId }
  })
}

// 获取所有任务（不分页）
export function listAll() {
  return request<ApiResponse<Job[]>>({
    url: '/monitor/job/all',
    method: 'get'
  })
}
