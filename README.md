# iAdmin Web

基于 Vue 3 + Vite 7 + TypeScript 5 + Element Plus 的后台管理系统前端。

## 技术栈

- **Vue 3.5** - 渐进式 JavaScript 框架
- **Vite 7** - 下一代前端构建工具
- **TypeScript 5** - JavaScript 的超集
- **Element Plus 2** - Vue 3 组件库
- **Pinia 3** - Vue 状态管理
- **Vue Router 4** - Vue 路由管理
- **Vitest** - 单元测试
- **Playwright** - E2E 测试

## 项目结构

```
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   ├── assets/            # 静态资源（图片、字体）
│   ├── components/        # 全局组件
│   ├── directive/         # 自定义指令
│   ├── icons/             # SVG 图标
│   ├── layout/            # 布局组件
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── styles/            # 全局样式
│   ├── types/             # TypeScript 类型
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   ├── main.ts            # 入口文件
│   └── permission.ts      # 路由权限控制
├── tests/
│   ├── e2e/               # E2E 测试
│   ├── unit/              # 单元测试
│   ├── fixtures/          # 测试固件
│   └── pages/             # Page Object
├── scripts/               # 构建脚本
├── docs/                  # 项目文档
├── index.html             # HTML 模板
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
├── eslint.config.js       # ESLint 配置
├── playwright.config.ts   # Playwright 配置
└── package.json           # 项目配置
```

## 快速开始

### 安装依赖

```bash
npm install
# 或
bun install
```

### 开发

```bash
npm run dev
```

访问 http://localhost:3000

### 构建

```bash
npm run build          # 生产环境
npm run build:stage    # 预发布环境
```

### 测试

```bash
npm run test:unit      # 单元测试
npm run test:e2e       # E2E 测试
npm run lint           # 代码检查
```

## 默认账号

```
用户名: admin
密码: admin123
```

## 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vite 文档](https://vitejs.dev/)
- [Pinia 文档](https://pinia.vuejs.org/)

## License

[MIT](LICENSE)
