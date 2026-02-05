import request from '@/utils/request'
import type { ApiResponse, PageResult, RoleInfo } from '@/types'

// 角色查询参数
export interface RoleQueryParams {
  page: number
  pageSize: number
  roleName?: string
  roleKey?: string
  status?: string
}

// 角色表单数据
export interface RoleFormData {
  id?: number
  roleName: string
  roleKey: string
  roleSort: number
  status: string
  remark?: string
  menuIds?: number[]
}

// 查询角色列表
export function listRoles(params: RoleQueryParams) {
  return request<ApiResponse<PageResult<RoleInfo>>>({
    url: '/sysRole',
    method: 'get',
    params
  })
}

// 获取角色选项
export function getRoleOptions() {
  return request<ApiResponse<RoleInfo[]>>({
    url: '/sysRole/selectOptions',
    method: 'get'
  })
}

// 新增角色
export function add(data: RoleFormData) {
  return request<ApiResponse<void>>({
    url: '/sysRole',
    method: 'post',
    data
  })
}

// 编辑角色
export function edit(data: RoleFormData) {
  return request<ApiResponse<void>>({
    url: '/sysRole',
    method: 'put',
    data
  })
}

// 更新角色权限
export function updatePermissions(params: { roleId: number; menuIds: number[] }) {
  return request<ApiResponse<void>>({
    url: '/sysRole/update/permissions',
    method: 'put',
    params
  })
}

// 删除角色
export function del(idList: number[]) {
  return request<ApiResponse<void>>({
    url: `/sysRole/${idList.join(',')}`,
    method: 'delete'
  })
}

// 根据角色ID获取菜单ID
export function getMenuIdsByRoleId(roleId: number) {
  return request<ApiResponse<number[]>>({
    url: '/sysRole/selectMenuIds',
    method: 'get',
    params: { roleId }
  })
}
