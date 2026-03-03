/**
 * XSS 过滤工具
 * 用于在前端过滤用户输入中的恶意脚本
 */

// 危险的 HTML 标签
const DANGEROUS_TAGS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^>]*>/gi,
  /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
]

// 危险的 HTML 属性
const DANGEROUS_ATTRS = [
  /on\w+\s*=\s*["'][^"']*["']/gi,  // on* 事件处理器
  /javascript\s*:/gi,               // javascript: 协议
  /vbscript\s*:/gi,                 // vbscript: 协议
  /data\s*:/gi,                     // data: 协议（可能包含恶意代码）
  /expression\s*\(/gi,              // CSS expression
]

/**
 * HTML 实体编码映射
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

/**
 * HTML 转义 - 将特殊字符转换为 HTML 实体
 * @param str 要转义的字符串
 * @returns 转义后的字符串
 */
export function escapeHtml(str: string): string {
  if (!str) return ''
  return String(str).replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * HTML 反转义 - 将 HTML 实体转换回原始字符
 * @param str 要反转义的字符串
 * @returns 反转义后的字符串
 */
export function unescapeHtml(str: string): string {
  if (!str) return ''
  const textarea = document.createElement('textarea')
  textarea.innerHTML = str
  return textarea.value
}

/**
 * 移除危险的 HTML 标签
 * @param str 输入字符串
 * @returns 清理后的字符串
 */
export function stripDangerousTags(str: string): string {
  if (!str) return ''
  let result = str
  for (const pattern of DANGEROUS_TAGS) {
    result = result.replace(pattern, '')
  }
  return result
}

/**
 * 移除危险的 HTML 属性
 * @param str 输入字符串
 * @returns 清理后的字符串
 */
export function stripDangerousAttrs(str: string): string {
  if (!str) return ''
  let result = str
  for (const pattern of DANGEROUS_ATTRS) {
    result = result.replace(pattern, '')
  }
  return result
}

/**
 * 过滤 XSS - 综合清理函数
 * @param str 输入字符串
 * @param options 选项
 * @returns 清理后的字符串
 */
export function filterXss(str: string, options: {
  escape?: boolean      // 是否转义 HTML（默认 true）
  stripTags?: boolean   // 是否移除危险标签（默认 true）
  stripAttrs?: boolean  // 是否移除危险属性（默认 true）
} = {}): string {
  if (!str) return ''

  const {
    escape = true,
    stripTags = true,
    stripAttrs = true
  } = options

  let result = String(str)

  // 移除危险的 HTML 标签
  if (stripTags) {
    result = stripDangerousTags(result)
  }

  // 移除危险的 HTML 属性
  if (stripAttrs) {
    result = stripDangerousAttrs(result)
  }

  // 转义 HTML 特殊字符
  if (escape) {
    result = escapeHtml(result)
  }

  return result
}

/**
 * 清理对象中的所有字符串值（递归）
 * @param obj 输入对象
 * @param options XSS 过滤选项
 * @returns 清理后的对象
 */
export function sanitizeObject<T>(obj: T, options?: {
  escape?: boolean
  stripTags?: boolean
  stripAttrs?: boolean
}): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'string') {
    return filterXss(obj, options) as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options)) as T
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeObject(value, options)
    }
    return result as T
  }

  return obj
}

/**
 * 验证 URL 是否安全（防止 javascript: 等协议）
 * @param url URL 字符串
 * @returns 是否安全
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return false

  // 移除前后空白
  const trimmedUrl = url.trim().toLowerCase()

  // 检查危险协议
  const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:']
  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      return false
    }
  }

  // 只允许 http、https、mailto 和相对路径
  const safeProtocols = ['http://', 'https://', 'mailto:', '/', '#']
  const hasSafeProtocol = safeProtocols.some(p => trimmedUrl.startsWith(p))

  // 如果没有协议前缀，认为是相对路径，允许
  if (!hasSafeProtocol && !trimmedUrl.includes(':')) {
    return true
  }

  return hasSafeProtocol
}

/**
 * 清理 URL，移除危险的协议
 * @param url URL 字符串
 * @returns 安全的 URL 或空字符串
 */
export function sanitizeUrl(url: string): string {
  if (isSafeUrl(url)) {
    return url
  }
  return ''
}

/**
 * 创建安全的 HTML 内容（用于 v-html 指令）
 * 注意：尽量避免使用 v-html，只在必要时使用此函数
 * @param html HTML 内容
 * @returns 清理后的 HTML
 */
export function safeHtml(html: string): string {
  if (!html) return ''

  // 不转义 HTML，但移除危险内容
  return filterXss(html, {
    escape: false,
    stripTags: true,
    stripAttrs: true
  })
}

// 默认导出
export default {
  escapeHtml,
  unescapeHtml,
  stripDangerousTags,
  stripDangerousAttrs,
  filterXss,
  sanitizeObject,
  isSafeUrl,
  sanitizeUrl,
  safeHtml
}
