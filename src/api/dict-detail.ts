import request from '@/utils/request'
import type { ApiResponse, DictData } from '@/types'

// 字典详情表单数据
export interface DictDetailFormData {
  id?: number
  dictSort: number
  dictLabel: string
  dictValue: string
  dictType: string
  cssClass?: string
  listClass?: string
  isDefault?: string
  status: string
  remark?: string
}

// 根据字典类型查询字典数据
export function fetchDetailList(dictType: string) {
  return request<ApiResponse<DictData[]>>({
    url: `/sysDictData/${dictType}`,
    method: 'get'
  })
}

// 新增字典数据
export function add(data: DictDetailFormData) {
  return request<ApiResponse<void>>({
    url: '/sysDictData',
    method: 'post',
    data
  })
}

// 修改字典数据
export function edit(data: DictDetailFormData) {
  return request<ApiResponse<void>>({
    url: '/sysDictData',
    method: 'put',
    data
  })
}

// 删除字典数据
export function del(idList: number[]) {
  return request<ApiResponse<void>>({
    url: `/sysDictData/${idList.join(',')}`,
    method: 'delete'
  })
}
