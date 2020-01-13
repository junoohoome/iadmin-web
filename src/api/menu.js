import request from '@/utils/request'

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: '/menu/list',
    method: 'get',
    params: query
  })
}

// 获取所有的菜单树
export function getMenusTree() {
  return request({
    url: '/menu/tree',
    method: 'get'
  })
}

// 添加菜单
export function add(data) {
  return request({
    url: '/menu',
    method: 'post',
    data
  })
}

// 删除菜单
export function del(id) {
  return request({
    url: '/menu/' + id,
    method: 'delete'
  })
}

// 编辑菜单
export function edit(data) {
  return request({
    url: '/menu',
    method: 'put',
    data
  })
}
