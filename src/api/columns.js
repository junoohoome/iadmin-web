import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/columns/list',
    method: 'get',
    params
  })
}

export function buildTree() {
  return request({
    url: '/columns/tree',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/columns',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/columns',
    method: 'put',
    data
  })
}

export function del(id) {
  return request({
    url: '/columns/' + id,
    method: 'delete'
  })
}
