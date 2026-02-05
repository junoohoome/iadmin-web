import request from '@/utils/request'
import type { ApiResponse, MenuItem } from '@/types'

// 菜单查询参数
export interface MenuQueryParams {
  menuName?: string
  status?: string
}

// 菜单表单数据
export interface MenuFormData {
  id?: number
  parentId: number
  menuName: string
  menuType: string
  path?: string
  component?: string
  redirect?: string
  icon?: string
  orderNum: number
  visible: string
  status: string
  remark?: string
}

// 查询菜单列表
export function listMenu(query?: MenuQueryParams) {
  return request<ApiResponse<MenuItem[]>>({
    url: '/sysMenu/list',
    method: 'get',
    params: query
  })
}

// 获取菜单树
export function getMenusTree() {
  return request<ApiResponse<MenuItem[]>>({
    url: '/sysMenu/treeSelect',
    method: 'get'
  })
}

// 新增菜单
export function add(data: MenuFormData) {
  return request<ApiResponse<void>>({
    url: '/sysMenu',
    method: 'post',
    data
  })
}

// 编辑菜单
export function edit(data: MenuFormData) {
  return request<ApiResponse<void>>({
    url: '/sysMenu',
    method: 'put',
    data
  })
}

// 删除菜单
export function del(idList: number[]) {
  return request<ApiResponse<void>>({
    url: `/sysMenu/${idList.join(',')}`,
    method: 'delete'
  })
}
