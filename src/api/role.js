import request from '@/utils/request'

export function listRoles(params) {
  return request({
    url: '/sysRole',
    method: 'get',
    params
  })
}

export function getRoleOptions() {
  return request({
    url: '/sysRole/selectOptions',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/sysRole',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/sysRole',
    method: 'put',
    data
  })
}

export function updatePermissions(params) {
  return request({
    url: '/sysRole/update/permissions',
    method: 'put',
    params
  })
}

export function del(id) {
  return request({
    url: '/sysRole/' + id,
    method: 'delete'
  })
}

export function getMenuIdsByRoleId(roleId) {
  return request({
    url: '/sysRole/selectMenuIds',
    method: 'get',
    params: { roleId: roleId }
  })
}
