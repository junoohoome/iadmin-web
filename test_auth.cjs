// RSA 加密工具 - CommonJS 版本
const JSEncrypt = require('jsencrypt').JSEncrypt || require('jsencrypt');

const publicKey = `MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANVW/fMB4NHchAORwWKic375lrJT9Dte
9nlCaHt/iCdIA1DYIrA0XX1fUgYLTdg+QgzUD/SMOXvH83JLWN/kW7ECAwEAAQ==`

// 加密函数
function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  return encryptor.encrypt(txt)
}

// 测试加密
const plainPassword = 'admin123'
const encryptedPassword = encrypt(plainPassword)
console.log('明文密码:', plainPassword)
console.log('加密后:', encryptedPassword.substring(0, 50) + '...')

// 测试 API
const BASE_URL = 'http://localhost:8090'

async function testAuth() {
  console.log('\n========================================')
  console.log('认证模块 API 测试')
  console.log('========================================\n')

  // 1. 获取验证码
  console.log('[1] 获取验证码...')
  const codeResp = await fetch(`${BASE_URL}/auth/code`)
  const codeData = await codeResp.json()
  if (codeData.code === 200) {
    console.log('  ✓ 成功 - UUID:', codeData.data.uuid)

    // 2. 登录
    console.log('\n[2] 测试登录...')
    const loginResp = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: encryptedPassword,
        code: '1234',
        uuid: codeData.data.uuid,
        rememberMe: false
      })
    })

    const loginData = await loginResp.json()
    console.log('  结果:', loginData.code === 200 ? '✓ 登录成功' : `✗ 失败 - ${loginData.msg}`)

    if (loginData.code === 200 && loginData.data) {
      const token = loginData.data.token
      console.log('  Token:', token.substring(0, 30) + '...')

      // 3. 获取用户信息
      console.log('\n[3] 测试获取用户信息...')
      const infoResp = await fetch(`${BASE_URL}/user/info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const infoData = await infoResp.json()
      console.log('  结果:', infoData.code === 200 ? '✓ 成功' : '✗ 失败')
      if (infoData.code === 200 && infoData.data) {
        console.log('  用户:', infoData.data.user.userName)
        console.log('  角色:', infoData.data.roles.map(r => r.roleName).join(', '))
      }

      // 4. 获取动态路由
      console.log('\n[4] 测试获取动态路由...')
      const routeResp = await fetch(`${BASE_URL}/getRouters`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const routeData = await routeResp.json()
      console.log('  结果:', routeData.code === 200 ? '✓ 成功' : '✗ 失败')
      if (routeData.code === 200) {
        console.log('  路由数量:', routeData.data.length)
      }

      // 5. 登出
      console.log('\n[5] 测试登出...')
      const logoutResp = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const logoutData = await logoutResp.json()
      console.log('  结果:', logoutData.code === 200 ? '✓ 成功' : '✗ 失败')
    }
  }

  console.log('\n========================================')
  console.log('测试完成')
  console.log('========================================')
}

testAuth().catch(err => {
  console.error('测试出错:', err.message)
  process.exit(1)
})
