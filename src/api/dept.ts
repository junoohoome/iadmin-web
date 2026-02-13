import request from '@/utils/request'
import type { ApiResponse, PageResult, DeptInfo } from '@/types'

// 部门查询参数
export interface DeptQueryParams {
  page: number
  limit?: number
  pageSize?: number
  deptId?: number
  parentId?: number
  deptName?: string
}

// 部门表单数据
export interface DeptFormData {
  id?: number
  deptId?: number
  parentId: number
  deptName: string
  orderNum: number
  leader?: string
  phone?: string
  email?: string
  status: string
}

// 分页查询部门列表
export function getList(query: DeptQueryParams) {
  return request<ApiResponse<PageResult<DeptInfo>>>({
    url: '/sysDept',
    method: 'get',
    params: query
  })
}

// 查询部门树形列表
export function getTreeList() {
  return request<ApiResponse<DeptInfo[]>>({
    url: '/sysDept/list',
    method: 'get'
  })
}

// 查询单个部门
export function getOne(id: number) {
  return request<ApiResponse<DeptInfo>>({
    url: `/sysDept/${id}`,
    method: 'get'
  })
}

// 新增部门
export function add(data: DeptFormData) {
  return request<ApiResponse<void>>({
    url: '/sysDept',
    method: 'post',
    data
  })
}

// 修改部门
export function update(data: DeptFormData) {
  return request<ApiResponse<void>>({
    url: '/sysDept',
    method: 'put',
    data
  })
}

// 删除部门
export function del(idList: number[]) {
  return request<ApiResponse<void>>({
    url: `/sysDept/${idList.join(',')}`,
    method: 'delete'
  })
}
