/**
 * XSS 过滤 Vue Composable
 * 提供在 Vue 组件中方便使用的 XSS 过滤方法
 */

import { ref, watch, type Ref } from 'vue'
import { filterXss, sanitizeObject, isSafeUrl, sanitizeUrl, escapeHtml } from '@/utils/xssFilter'

/**
 * XSS 过滤 Composable
 * @param options 过滤选项
 */
export function useXssFilter(options: {
  escape?: boolean
  stripTags?: boolean
  stripAttrs?: boolean
} = {}) {
  /**
   * 过滤字符串中的 XSS
   */
  const filter = (str: string): string => {
    return filterXss(str, options)
  }

  /**
   * 过滤对象中的所有字符串值
   */
  const sanitize = <T>(obj: T): T => {
    return sanitizeObject(obj, options)
  }

  /**
   * 检查 URL 是否安全
   */
  const checkUrl = (url: string): boolean => {
    return isSafeUrl(url)
  }

  /**
   * 清理 URL
   */
  const cleanUrl = (url: string): string => {
    return sanitizeUrl(url)
  }

  /**
   * 转义 HTML
   */
  const escape = (str: string): string => {
    return escapeHtml(str)
  }

  return {
    filter,
    sanitize,
    checkUrl,
    cleanUrl,
    escape
  }
}

/**
 * 自动过滤的输入值
 * 当值改变时自动过滤 XSS
 */
export function useFilteredInput(initialValue: string = '', options: {
  escape?: boolean
  stripTags?: boolean
  stripAttrs?: boolean
} = {}) {
  const value = ref(initialValue)
  const filteredValue = ref(filterXss(initialValue, options))

  // 监听原始值变化，自动过滤
  watch(value, (newValue) => {
    filteredValue.value = filterXss(newValue, options)
  })

  // 设置值并自动过滤
  const setValue = (newValue: string) => {
    value.value = newValue
  }

  // 重置为初始值
  const reset = () => {
    value.value = initialValue
  }

  return {
    value,
    filteredValue,
    setValue,
    reset
  }
}

/**
 * 表单数据 XSS 过滤
 * 用于过滤整个表单对象
 */
export function useFormSanitizer<T extends Record<string, unknown>>(
  formRef: Ref<T>,
  options: {
    escape?: boolean
    stripTags?: boolean
    stripAttrs?: boolean
  } = {}
) {
  /**
   * 获取过滤后的表单数据
   */
  const getSanitizedData = (): T => {
    return sanitizeObject(formRef.value, options)
  }

  /**
   * 直接过滤当前表单数据（修改原对象）
   */
  const sanitize = (): void => {
    formRef.value = sanitizeObject(formRef.value, options)
  }

  return {
    getSanitizedData,
    sanitize
  }
}

export default useXssFilter
