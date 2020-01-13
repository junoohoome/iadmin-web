import request from '@/utils/request'

// 文章列表
export function fetchList(query) {
  return request({
    url: '/article/list',
    method: 'get',
    params: query
  })
}

// 获取文章详情
export function fetchArticle(id) {
  return request({
    url: '/article/detail',
    method: 'get',
    params: { id }
  })
}

// 添加文章
export function add(data) {
  return request({
    url: '/article',
    method: 'post',
    data
  })
}

// 删除文章
export function del(id) {
  return request({
    url: '/article/' + id,
    method: 'delete'
  })
}

export function batchDel(ids) {
  return request({
    url: '/article/batch/delete',
    method: 'delete',
    params: {
      ids
    }
  })
}

// 编辑文章
export function edit(data) {
  return request({
    url: '/article',
    method: 'put',
    data
  })
}

export function publish(id) {
  return request({
    url: '/article/publish/' + id,
    method: 'get'
  })
}
