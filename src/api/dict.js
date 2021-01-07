import request from '@/utils/request'

export function listDicts(params) {
  return request({
    url: '/sysDictType',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/sysDictType',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/sysDictType',
    method: 'put',
    data
  })
}

export function del(idList) {
  return request({
    url: '/sysDictType',
    params: { idList: idList },
    method: 'delete'
  })
}
