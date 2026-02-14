// TinyMCE 全局类型声明
declare global {
  interface Window {
    tinymce: {
      get(id: string): {
        setContent(content: string): void
        getContent(): string
      }
      init(options: any): void
      remove(): void
      Editor: {
        editors: any[]
      }
    }
  }
}

export {}
