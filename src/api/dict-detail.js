import request from '@/utils/request'

export function get(dictName) {
  const params = {
    dictName,
    page: 0,
    size: 9999
  }
  return request({
    url: 'dict/detail',
    method: 'get',
    params
  })
}

export function getDetailOptions(dictName) {
  return request({
    url: '/dict-details/options',
    method: 'get',
    params: {
      dictName
    }
  })
}

export function listDictDetails(params) {
  return request({
    url: 'dict/detail',
    method: 'get',
    params
  })
}

export function getDictMap(dictName) {
  const params = {
    dictName,
    page: 0,
    size: 9999
  }
  return request({
    url: 'api/dict-detail/map',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/dict-detail',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: 'api/dict-detail/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/dict-detail',
    method: 'put',
    data
  })
}
