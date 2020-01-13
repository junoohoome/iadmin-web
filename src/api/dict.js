import request from '@/utils/request'

export function listDicts(params) {
  return request({
    url: '/dict/list',
    method: 'get',
    params
  })
}

export function fetchDetailList(dictId) {
  return request({
    url: '/dict/detail/' + dictId,
    method: 'get'
  })
}

export function submitDict(data) {
  return request({
    url: '/dict',
    method: 'post',
    data
  })
}

export function submitDictDetail(data) {
  return request({
    url: '/dict/detail',
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: '/dict',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/dict',
    method: 'put',
    data
  })
}

export function del(id) {
  return request({
    url: '/dict/' + id,
    method: 'delete'
  })
}

export function getDictOptions(dictName) {
  return request({
    url: '/dict/options/' + dictName,
    method: 'get'
  })
}
