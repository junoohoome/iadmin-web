import request from '@/utils/request'

// 登录方法
export function login(username, password, code , uuid) {
  return request({
    url: '/auth/login',
    method: 'post',
    data: {
      username,
      password,
      code,
      uuid
    }
  })
}

// 获取用户详细信息
export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

// 退出方法
export function logout(token) {
  return request({
    url: '/auth/logout',
    method: 'post',
    params: {
      token: token
    }
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/auth/code',
    method: 'get'
  })
}

