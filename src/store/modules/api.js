const baseUrl = process.env.VUE_APP_BASE_API
const api = {
  state: {
    // 文件上传
    fileUploadApi: baseUrl + '/file/upload',
    // baseUrl
    baseApi: baseUrl
  }
}

export default api
