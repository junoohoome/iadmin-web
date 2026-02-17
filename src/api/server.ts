import request from '@/utils/request'
import type { ApiResponse } from '@/types'

// CPU 信息
export interface CpuInfo {
  cpuNum: number
  total: number
  sys: number
  used: number
  wait: number
  free: number
}

// 内存信息
export interface MemInfo {
  total: string
  used: string
  free: string
  usage: number
}

// JVM 信息
export interface JvmInfo {
  total: string
  max: string
  free: string
  version: string
  home: string
  name: string
  usage: number
  used: string
  startTime: string
  runTime: string
  inputArgs: string
}

// 系统信息
export interface SysInfo {
  computerName: string
  computerIp: string
  osName: string
  osArch: string
  userDir: string
}

// 磁盘信息
export interface SysFileInfo {
  dirName: string
  sysTypeName: string
  typeName: string
  total: string
  free: string
  used: string
  usage: number
}

// 服务器信息
export interface ServerInfo {
  cpu: CpuInfo
  mem: MemInfo
  jvm: JvmInfo
  sys: SysInfo
  sysFiles: SysFileInfo[]
}

// 获取服务器信息
export function getServerInfo() {
  return request<ApiResponse<ServerInfo>>({
    url: '/monitor/server',
    method: 'get'
  })
}
