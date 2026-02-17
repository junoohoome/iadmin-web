import request from '@/utils/request'
import type { ApiResponse } from '@/types'

// 缓存信息
export interface CacheInfo {
  key: string
  type: string
  ttl: number
  value?: string
  size?: number
}

// 缓存统计信息
export interface CacheStats {
  totalKeys: number
  keyTypes: Record<string, number>
  memory: Record<string, string>
}

// 获取缓存列表
export function list() {
  return request<ApiResponse<CacheInfo[]>>({
    url: '/monitor/cache/list',
    method: 'get'
  })
}

// 获取缓存详细信息
export function getCacheInfo(key: string) {
  return request<ApiResponse<CacheInfo>>({
    url: `/monitor/cache/info/${encodeURIComponent(key)}`,
    method: 'get'
  })
}

// 根据前缀搜索缓存键
export function getKeys(pattern: string = '*') {
  return request<ApiResponse<string[]>>({
    url: '/monitor/cache/keys',
    method: 'get',
    params: { pattern }
  })
}

// 获取缓存统计信息
export function getStats() {
  return request<ApiResponse<CacheStats>>({
    url: '/monitor/cache/stats',
    method: 'get'
  })
}

// 删除单个缓存
export function delCache(key: string) {
  return request<ApiResponse<boolean>>({
    url: `/monitor/cache/${encodeURIComponent(key)}`,
    method: 'delete'
  })
}

// 批量删除缓存
export function delBatch(keys: string[]) {
  return request<ApiResponse<number>>({
    url: '/monitor/cache/batch',
    method: 'delete',
    data: keys
  })
}

// 根据前缀批量删除
export function delByPattern(pattern: string) {
  return request<ApiResponse<number>>({
    url: '/monitor/cache/pattern',
    method: 'delete',
    params: { pattern }
  })
}

// 清空所有缓存
export function clearCache() {
  return request<ApiResponse<boolean>>({
    url: '/monitor/cache/clear',
    method: 'delete'
  })
}
