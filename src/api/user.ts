import request from '@/utils/request'
import type { ApiResponse, PageResult, UserInfo } from '@/types'

// 用户查询参数
export interface UserQueryParams {
  page: number
  pageSize: number
  username?: string
  phone?: string
  status?: number
}

// 用户表单数据
export interface UserFormData {
  id?: number
  username: string
  nickname?: string
  password?: string
  phone?: string
  email?: string
  sex?: string
  status?: number
  roleIdList?: number[]
  deptId?: number
}

// 查询用户列表
export function getList(query: UserQueryParams) {
  return request<ApiResponse<PageResult<UserInfo>>>({
    url: '/sysUser',
    method: 'get',
    params: query
  })
}

// 新增用户
export function addUser(data: UserFormData) {
  return request<ApiResponse<void>>({
    url: '/sysUser',
    method: 'post',
    data
  })
}

// 修改用户
export function updateUser(data: UserFormData) {
  return request<ApiResponse<void>>({
    url: '/sysUser',
    method: 'put',
    data
  })
}

// 修改用户状态
export function updateUserStatus(id: number, status: number) {
  return request<ApiResponse<void>>({
    url: '/sysUser/update/status',
    method: 'put',
    params: {
      id,
      status
    }
  })
}

// 删除用户
export function delUser(idList: number[]) {
  return request<ApiResponse<void>>({
    url: `/sysUser/${idList.join(',')}`,
    method: 'delete'
  })
}

// 查询用户个人信息
export function getUserProfile() {
  return request<ApiResponse<UserInfo>>({
    url: '/sysUser/profile',
    method: 'get'
  })
}

// 修改用户个人信息
export function updateUserProfile(data: Partial<UserInfo>) {
  return request<ApiResponse<void>>({
    url: '/sysUser/profile',
    method: 'put',
    data
  })
}

// 用户密码重置
export function updateUserPwd(oldPassword: string, newPassword: string) {
  return request<ApiResponse<void>>({
    url: '/sysUser/profile/updatePwd',
    method: 'put',
    params: {
      oldPassword,
      newPassword
    }
  })
}

// 用户头像上传
export function uploadAvatar(data: FormData) {
  return request<ApiResponse<string>>({
    url: '/user/profile/avatar',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
