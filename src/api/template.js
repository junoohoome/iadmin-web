import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: '/cms/template/list',
    method: 'get',
    params
  })
}

export function getTypeOptions() {
  return request({
    url: '/cms/template/type/options',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/cms/template',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/cms/template',
    method: 'put',
    data
  })
}

export function del(id) {
  return request({
    url: '/cms/template/' + id,
    method: 'delete'
  })
}

export function templateTree() {
  return request({
    url: '/cms/template/tree',
    method: 'get'
  })
}
