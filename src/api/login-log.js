import request from '@/utils/request'

// 查询登录日志列表
export function list(query) {
  return request({
    url: '/loginlog/list',
    method: 'get',
    params: query
  })
}

// 删除登录日志
export function delLoginlog(ids) {
  return request({
    url: '/loginlog/' + ids,
    method: 'delete'
  })
}

// 清空登录日志
export function cleanLoginlog() {
  return request({
    url: '/loginlog/clean',
    method: 'delete'
  })
}

// 导出登录日志
export function exportLoginlog(query) {
  return request({
    url: '/loginlog/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
