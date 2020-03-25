import request from '@/utils/request'

// 查询用户列表
export function getList(query) {
  return request({
    url: '/sysUser',
    method: 'get',
    params: query
  })
}
// 新增用户
export function addUser(data) {
  return request({
    url: '/sysUser',
    method: 'post',
    data
  })
}

// 修改用户
export function updateUser(data) {
  return request({
    url: '/sysUser',
    method: 'put',
    data
  })
}

export function updateUserStatus(id, status) {
  return request({
    url: '/user/update/status',
    method: 'put',
    params: {
      id: id,
      status: status
    }
  })
}

// 删除用户
export function delUser(idList) {
  return request({
    url: '/sysUser/' + idList,
    method: 'delete'
  })
}

// 查询用户个人信息
export function getUserProfile() {
  return request({
    url: '/user/profile',
    method: 'get'
  })
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
    url: '/user/profile',
    method: 'put',
    data: data
  })
}

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword
  }
  return request({
    url: '/user/profile/updatePwd',
    method: 'put',
    params: data
  })
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: '/user/profile/avatar',
    method: 'post',
    data: data
  })
}

