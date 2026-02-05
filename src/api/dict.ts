import request from '@/utils/request'
import type { ApiResponse, PageResult, DictType } from '@/types'

// 字典查询参数
export interface DictQueryParams {
  page: number
  pageSize: number
  dictName?: string
  dictType?: string
  status?: string
}

// 字典表单数据
export interface DictFormData {
  id?: number
  dictName: string
  dictType: string
  status: string
  remark?: string
}

// 查询字典类型列表
export function listDicts(params: DictQueryParams) {
  return request<ApiResponse<PageResult<DictType>>>({
    url: '/sysDictType',
    method: 'get',
    params
  })
}

// 新增字典类型
export function add(data: DictFormData) {
  return request<ApiResponse<void>>({
    url: '/sysDictType',
    method: 'post',
    data
  })
}

// 修改字典类型
export function edit(data: DictFormData) {
  return request<ApiResponse<void>>({
    url: '/sysDictType',
    method: 'put',
    data
  })
}

// 删除字典类型
export function del(idList: number[]) {
  return request<ApiResponse<void>>({
    url: `/sysDictType/${idList.join(',')}`,
    method: 'delete'
  })
}
