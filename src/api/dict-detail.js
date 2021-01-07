import request from '@/utils/request'

export function fetchDetailList(dictType) {
  return request({
    url: '/sysDictData/' + dictType,
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/sysDictData',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/sysDictData',
    method: 'put',
    data
  })
}

export function del(idList) {
  return request({
    url: '/sysDictData',
    params: { idList: idList },
    method: 'delete'
  })
}
