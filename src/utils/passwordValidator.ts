/**
 * 密码复杂度验证工具
 * 与后端 PasswordValidator.java 保持一致
 */

export interface PasswordValidationResult {
  valid: boolean
  message: string
}

// 常见弱密码列表
const COMMON_PASSWORDS = [
  '123456', 'password', '12345678', 'qwerty', '123456789',
  '12345', '1234', '111111', '1234567', 'dragon',
  '123123', 'baseball', 'abc123', 'football', 'monkey',
  'letmein', '696969', 'shadow', 'master', '666666',
  'qwertyuiop', '123321', 'mustang', '1234567890', 'michael',
  '654321', 'pussy', 'superman', '1qaz2wsx', '7777777',
  'admin', 'admin123', 'root', 'root123', 'test', 'test123'
]

/**
 * 验证密码复杂度
 * @param password 密码
 * @param username 用户名（可选，用于检查密码是否包含用户名）
 * @returns 验证结果
 */
export function validatePassword(password: string, username?: string): PasswordValidationResult {
  // 基础检查
  if (!password) {
    return { valid: false, message: '密码不能为空' }
  }

  // 长度检查：8-32位
  if (password.length < 8) {
    return { valid: false, message: '密码长度不能少于8位' }
  }
  if (password.length > 32) {
    return { valid: false, message: '密码长度不能超过32位' }
  }

  // 包含大写字母
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个大写字母' }
  }

  // 包含小写字母
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个小写字母' }
  }

  // 包含数字
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个数字' }
  }

  // 包含特殊字符
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个特殊字符（如 !@#$%^&*）' }
  }

  // 检查是否包含用户名
  if (username && password.toLowerCase().includes(username.toLowerCase())) {
    return { valid: false, message: '密码不能包含用户名' }
  }

  // 检查是否为常见弱密码
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return { valid: false, message: '密码过于简单，请使用更复杂的密码' }
  }

  return { valid: true, message: '' }
}

/**
 * 创建 Element Plus 表单验证器
 * @param getUsername 获取用户名的函数
 * @returns 验证器函数
 */
export function createPasswordValidator(getUsername?: () => string | undefined) {
  return (_rule: any, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error('请输入密码'))
      return
    }

    const username = getUsername?.()
    const result = validatePassword(value, username)

    if (!result.valid) {
      callback(new Error(result.message))
    } else {
      callback()
    }
  }
}

/**
 * 密码强度等级
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong'

/**
 * 计算密码强度
 * @param password 密码
 * @returns 强度等级
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 8) {
    return 'weak'
  }

  let score = 0

  // 长度加分
  if (password.length >= 12) score += 2
  else if (password.length >= 8) score += 1

  // 字符类型加分
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 2

  if (score >= 6) return 'very-strong'
  if (score >= 4) return 'strong'
  if (score >= 2) return 'medium'
  return 'weak'
}

/**
 * 获取密码强度的中文描述
 */
export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  const labels: Record<PasswordStrength, string> = {
    'weak': '弱',
    'medium': '中',
    'strong': '强',
    'very-strong': '非常强'
  }
  return labels[strength]
}
