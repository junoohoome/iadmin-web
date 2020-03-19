import request from '@/utils/request'

export function listRoles(params) {
  return request({
    url: '/role/list',
    method: 'get',
    params
  })
}

export function getRoleOptions() {
  return request({
    url: '/role/options',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/role',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/role',
    method: 'put',
    data
  })
}

export function updatePermissions(params) {
  return request({
    url: '/role/update/permissions',
    method: 'put',
    params
  })
}

export function del(id) {
  return request({
    url: '/role/' + id,
    method: 'delete'
  })
}
