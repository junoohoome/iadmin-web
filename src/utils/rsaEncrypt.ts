import JSEncrypt from 'jsencrypt'

// 公钥（用于前端加密）
// 密钥对生成 http://web.chacuo.net/netrsakeypair
const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANVW/fMB4NHchAORwWKic375lrJT9Dte' +
  '9nlCaHt/iCdIA1DYIrA0XX1fUgYLTdg+QgzUD/SMOXvH83JLWN/kW7ECAwEAAQ=='

// 加密 - 前端仅使用公钥加密密码
export function encrypt(txt: string): string | false {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  // 指定使用 ECB 模式和 PKCS1 填充，以匹配后端 Hutool RSA 默认配置
  // @ts-ignore
  encryptor.__options = {
    mode: 'ECB',
    padding: 'PKCS1'
  }
  return encryptor.encrypt(txt) // 对需要加密的数据进行加密
}

// 注意：私钥仅存在于后端，前端不应包含解密功能
// 解密操作必须在后端完成
