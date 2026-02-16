# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供在此代码库中工作的指导。

## 项目概述

iAdmin 是一个全栈后台管理系统：
- **前端**: Vue 3 + TypeScript + Vite + Element Plus
- **后端**: Spring Boot 3.2.5 + Java 21 + MyBatis-Plus

## 服务端口

**重要提示**：开发时请勿同时启动多个前端/后端实例！
- **前端默认端口**: `3000`
- **后端默认端口**: `8080`

**检查端口占用**:
```bash
# 检查端口 3000 和 8080 是否被占用
lsof -i :3000 -t
lsof -i :8080 -t

# 如需释放端口，杀掉对应进程
kill -9 <PID>
```

**数据库**:
- MySQL (iadmin 数据库)
- Redis (数据库索引 8)

## 开发命令

### 前端 (iadmin-web/)

```bash
# 开发服务器（端口 3000）
npm run dev

# 构建
npm run build            # 生产环境构建
npm run build:type-check # 带类型检查的构建
npm run build:stage      # 预发布环境构建

# 代码质量
npm run lint             # ESLint 修复
npm run type-check       # TypeScript 类型检查

# 测试
npm run test:unit        # 运行 Vitest 测试
npm run test:ci          # CI 测试 (lint + unit)
```

**注意**: 运行 `npm run dev` 前请确保端口 3000 未被占用，避免启动多个前端实例。

### 后端 (iadmin/)

```bash
# 编译所有模块
cd iadmin
mvn clean compile       # 编译（跳过测试）

# 运行后端（端口 8080）
cd iadmin-system
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 打包
mvn clean package       # 构建 JAR（默认跳过测试）
```

**注意**: 运行后端前请确保端口 8080 未被占用，避免启动多个后端实例。

### 数据库初始化

```bash
# 创建数据库和表
mysql -u root -p < iadmin/sql/iadmin_init.sql

# 额外的表（操作日志、字典）
mysql -u root -p iadmin < iadmin/sql/sprint3_oper_log_enhancement.sql
```

## 架构概览

### 后端模块结构

```
iadmin/
├── iadmin-common/     # 共享工具类、配置、领域模型
├── iadmin-system/     # 核心业务逻辑（用户、角色、菜单、认证）
├── iadmin-tools/      # 代码生成工具
├── iadmin-monitor/    # 系统监控（日志）
└── iadmin-quartz/     # 定时任务管理
```

### 后端核心设计模式

**认证流程:**
1. 前端使用 RSA 公钥加密密码（公钥来自 `application.yml`）
2. `POST /auth/login` - 后端使用私钥解密并验证 Redis 中的验证码
3. 返回带有 `Bearer` 前缀的 JWT token，包含用户信息、角色和权限
4. 后续请求使用 `Authorization: Bearer <token>` 请求头
5. `JwtAuthenticationTokenFilter` 验证 token 并设置 SecurityContext

**安全配置** (`WebSecurityConfig.java`):
- 无状态会话管理 (`SessionCreationPolicy.STATELESS`)
- 匿名访问: `/auth/code`、`/auth/login`、Swagger UI、静态文件
- 所有其他端点需要认证
- 自定义处理器: `JwtAuthenticationEntryPoint` (401)、`JwtAccessDeniedHandler` (403)

**数据权限** (`@DataScope` 注解):
- 基于 AOP 的自动 SQL 注入实现行级安全
- 五个级别: 全部、自定义、本部门、本部门及以下、仅本人
- `DataScopeAspect` 根据用户角色注入 WHERE 子句

**横切关注点:**
- `@Log` - 操作日志（基于 AOP）
- `@RepeatSubmit` - 防重复提交
- `@Limiter` - 限流
- 通过 `GlobalExceptionHandler` 全局异常处理

**Redis 使用:**
- 所有 Redis 操作使用数据库索引 8（在 `RedisConfig.java` 中配置）
- 验证码（2 分钟过期）
- 在线用户会话管理
- 登出时的 token 黑名单

### 前端架构

**Pinia 状态管理:**
- `user` - Token、用户信息、角色、权限（持久化到 localStorage）
- `permission` - 从后端动态加载路由
- `settings` - UI 主题和布局偏好
- `app` - 应用全局状态
- `tagsView` - 面包屑导航标签

**路由架构:**
- `constantRoutes` - 公共路由（登录、404、仪表板）
- 登录后从 `/getRouters` 端点动态加载路由
- 路由守卫在导航前检查 token 和角色
- 404 路由必须在动态路由之后添加以捕获未匹配的路由

**请求拦截器** (`utils/request.ts`):
- 请求: 自动从 localStorage 添加 `Authorization: Bearer <token>`
- 响应: 处理 401（提示重新登录）、错误码、显示通知

**权限控制:**
- `checkPermission()` 函数配合 `v-if` 实现按钮级权限控制
- 路由 meta 定义所需权限
- 后端通过 `/user/info` 提供角色和权限

## 参考文档

本项目前端架构参考 [vue-element-admin](https://panjiachen.github.io/vue-element-admin-site/zh/guide/)，这是一个基于 Vue + Element UI 的后台前端解决方案。

**推荐阅读:**
- [手摸手，带你用 vue 撸后台 系列一(基础篇)](https://juejin.im/post/59097cd7a22b9d0065fb1f84)
- [手摸手，带你用 vue 撸后台 系列二(登录权限篇)](https://juejin.im/post/591aa14f570c35006961acac)
- [手摸手，带你用 vue 撸后台 系列三 (实战篇)](https://juejin.im/post/593121aa0ce4630057f70d35)

**注意**: 本项目使用 Vue 3 + Element Plus，与 vue-element-admin (Vue 2 + Element UI) 有所不同，但架构理念相似。

## 开发注意事项

**权限指令:**
- 使用 `v-if="checkPermission(['admin', 'permission:key'])"` 进行权限控制
- 不要使用 `v-permission` 指令（会导致 Vue 3 响应式递归更新问题）

**Element Plus 组件:**
- 组件自动通过 vite.config.ts 的 Components 插件解析
- 组件名以 `El` 开头（如 `ElMenu`、`ElSubMenu`）

**递归更新问题:**
- 不要在模板中直接修改响应式数据
- el-tree 的 `:default-checked-keys` 避免响应式绑定，使用 `setCheckedKeys()` 方法

**SVG 图标使用:**
- 使用 `vite-plugin-svg-icons` 插件，配置在 `vite.config.ts`
- 图标文件放在 `src/icons/svg/` 目录
- 使用方式: `<SvgIcon icon-class="search" />`
- `icons/index.ts` 必须导入 `virtual:svg-icons-register` 才能注册图标
- `SvgIcon` 组件中判断外部链接应使用 `isExternalLink` computed 变量，而非 `isExternal` 函数

### API 通信

**前端 → 后端代理:**
- 开发环境: `/dev-api/*` → `http://127.0.0.1:8080/*`（在 `vite.config.ts` 中配置）

**标准响应格式:**
```typescript
{
  code: number,    // HTTP 状态码
  msg: string,     // 消息
  data: T          // 实际数据
}
```

**主要端点:**
- `POST /auth/login` - 登录（返回 JWT token）
- `GET /auth/code` - 获取验证码（base64 图片 + uuid）
- `DELETE /auth/logout` - 登出
- `GET /user/info` - 获取用户信息、角色、权限
- `GET /getRouters` - 获取动态菜单路由
- `GET /sysUser` - 用户列表
- `GET /sysRole` - 角色列表
- `GET /sysMenu/list` - 菜单列表
- `GET /sysOperLog` - 操作日志

## 配置文件

**后端:**
- `application.yml` - 主配置（服务器端口: 8080、Jackson、MyBatis、SpringDoc）
- `application-dev.yml` - 开发环境（MySQL、Redis 数据库 8、JWT 密钥、RSA 密钥）
- `application-prod.yml` - 生产环境覆盖配置

**前端:**
- `.env.development` - 开发模式环境变量
- `vite.config.ts` - 构建配置、自动导入、后端代理
- `settings.ts` - 默认 UI 设置

## 默认凭据

```
用户名: admin
密码: admin123
```

## 重要注意事项

**Redis 数据库:**
- 所有 Redis 操作使用数据库索引 8（配置在 `spring.data.redis.database: 8`）
- `RedisConfig.java` 中的自定义 `LettuceConnectionFactory` 确保正确的数据库选择

**验证码生成:**
- 必须先调用 `captcha.toBase64()` 再调用 `captcha.text()` 才能正确生成验证码
- 验证码存储在 Redis 中，key 格式: `CODE_KEY<uuid>`

**RSA 加密:**
- 前端使用 JSEncrypt 库和公钥
- 后端使用 Hutool RSA 和私钥
- 密钥配置在 `application.yml`（rsa.private_key、rsa.public_key）

**动态路由:**
- 后端菜单配置转换为 Vue Router 格式
- 路由通过 `import.meta.glob('@/views/**/*.vue')` 懒加载
- 404 路由必须在动态路由之后添加

**API 测试:**
- 使用 `Authorization: Bearer <token>` 请求头（不是查询参数）
- Token 需要从登录响应中提取（某些操作需要移除 "Bearer " 前缀）

**数据库表:**
- 核心表: sys_user、sys_role、sys_menu、sys_dept、sys_user_role、sys_role_menu、sys_role_dept
- 附加表: sys_oper_log、sys_dict_type、sys_dict_data
- 初始化脚本: `iadmin/sql/iadmin_init.sql`
