import JSEncrypt from 'jsencrypt'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANVW/fMB4NHchAORwWKic375lrJT9Dte' +
  '9nlCaHt/iCdIA1DYIrA0XX1fUgYLTdg+QgzUD/SMOXvH83JLWN/kW7ECAwEAAQ=='

const privateKey = 'MIIBVQIBADANBgkqhkiG9w0BAQEFAASCAT8wggE7AgEAAkEA1Vb98wHg0dyEA5HB' +
  'YqJzfvmWslP0O172eUJoe3+IJ0gDUNgisDRdfV9SBgtN2D5CDNQP9Iw5e8fzcktY' +
  '3+RbsQIDAQABAkEAjb2MX6XBzuypsQ1n5LZ18ci1vKlWvRNswkfCzzp+JUnWiiQD' +
  'Kmfa9QrkRievNioFt0y71uQAMgOQ64G+SRGFGQIhAOyqvYcyBtHNnDeuYYdGbJhk' +
  'Or0tRZdpoWuc9CPj0X5nAiEA5sRtMXkyrRyIE/OGm+LdaRJaxZTX8QTmWIWEregw' +
  '1icCIA2cUCQLS3sbYQWOwMsf0LT+5qXkiaEIkSD4OM4rluu3AiEAyVZZmo+OqkC5' +
  'bQbMy9c8q/6qmbZKTWuj+VnMr9pkOYMCIGPBCrhhZv/RMuuj+y3BA/UD7oUfjUs3' +
  'bo84MfgZuMJD'

// 加密
export function encrypt(txt: string): string | false {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  // 指定使用 ECB 模式和 PKCS1 填充，以匹配后端 Hutool RSA 默认配置
  // @ts-ignore
  // @ts-expect-error
  // @ts-ignore
  encryptor.__options = {
    mode: 'ECB',
    padding: 'PKCS1'
  }
  return encryptor.encrypt(txt) // 对需要加密的数据进行加密
}

// 解密
export function decrypt(txt: string): string | false {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey)
  return encryptor.decrypt(txt)
}
