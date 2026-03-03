import Cookies from 'js-cookie'

const TokenKey = 'IADMIN-TOKEN'

// 判断是否为安全环境（HTTPS）
const isSecureEnvironment = (): boolean => {
  return window.location.protocol === 'https:' || import.meta.env.PROD
}

export function getToken(): string | undefined {
  return Cookies.get(TokenKey)
}

export function setToken(token: string): string | undefined {
  // 安全 Cookie 配置
  const options: Cookies.CookieAttributes = {
    sameSite: 'strict',  // 防止 CSRF 攻击
    secure: isSecureEnvironment(),  // 仅在 HTTPS 下启用 Secure
    path: '/',
    // Cookie 有效期 4 小时（与后端 JWT 过期时间一致）
    expires: 1 / 6  // 24小时 / 6 = 4小时
  }
  return Cookies.set(TokenKey, token, options)
}

export function removeToken(): void {
  const options: Cookies.CookieAttributes = {
    path: '/'
  }
  Cookies.remove(TokenKey, options)
}
