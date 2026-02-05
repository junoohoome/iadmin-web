/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str: string): boolean {
  const valid_map = ['admin', 'editor']
  return valid_map.includes(str.trim())
}

/**
 * @param {string} address
 * @returns {Boolean}
 */
export function isMail(address: string): boolean {
  return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(address)
}

/**
 * 验证手机号
 * @param {string} phone
 * @returns {Boolean}
 */
export function isPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证身份证号
 * @param {string} idCard
 * @returns {Boolean}
 */
export function isIdCard(idCard: string): boolean {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
}

/**
 * 验证URL
 * @param {string} url
 * @returns {Boolean}
 */
export function isUrl(url: string): boolean {
  return /^https?:\/\/.+/.test(url)
}
