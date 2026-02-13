# IAdmin Web 前端 Bug 修复报告

## 测试环境
- 项目: IAdmin Web (Vue 3 + Vite 7 + TypeScript 5 + Element Plus 2.13)
- 开发服务器: http://localhost:3003/
- 测试时间: 2026-02-06

## 已修复的 Bug 列表

| # | Bug 描述 | 文件 | 严重程度 | 状态 |
|---|----------|------|----------|------|
| 1 | Sass @import 弃用警告 | `src/styles/btn.scss` | 低 | ✅ 已修复 |
| 2 | Sass @import 弃用警告 | `src/layout/index.vue` | 低 | ✅ 已修复 |
| 3 | UserInfo 类型缺少 userId 字段 | `src/types/index.ts` | 中 | ✅ 已修复 |
| 4 | 权限指令只检查 permissions，不检查 roles | `src/directive/permission/index.ts` | 高 | ✅ 已修复 |
| 5 | checkPermission 函数只检查 permissions | `src/utils/permission.ts` | 高 | ✅ 已修复 |
| 6 | 响应错误消息显示不准确 | `src/utils/request.ts` | 中 | ✅ 已修复 |
| 7 | settings 缺少 caseNumber 配置 | `src/settings.ts` | 中 | ✅ 已修复 |
| 8 | SettingsState 接口缺少 caseNumber | `src/stores/settings.ts` | 中 | ✅ 已修复 |
| 9 | UserQueryParams 参数名不匹配 (pageSize vs limit) | `src/api/user.ts` | 中 | ✅ 已修复 |
| 10 | getInfo API 调用缺少 token 参数 | `src/stores/user.ts` | 高 | ✅ 已修复 |
| 11 | 用户编辑错误处理不完整 | `src/views/system/user/edit.vue` | 中 | ✅ 已修复 |

## 详细修复说明

### Bug #1-2: Sass @import 弃用警告
**问题**: Dart Sass 3.0 将移除 `@import` 支持，应使用 `@use` 代替

**修复**:
- `src/styles/btn.scss`: `@import './variables.scss'` → `@use './variables.scss' as *`
- `src/layout/index.vue`: `@import` → `@use`

### Bug #3: UserInfo 类型缺少 userId 字段
**问题**: `UserInfo` 接口中没有 `userId` 字段，但代码中多处使用 `row.userId`

**修复**: 在 `src/types/index.ts` 中添加 `userId?: number` 字段

### Bug #4-5: 权限检查逻辑不完整
**问题**: `v-permission` 指令和 `checkPermission` 函数只检查 `permissions` 数组，没有检查 `roles` 数组

**修复**: 修改为同时检查角色和权限：
```typescript
const hasPermission = roles.some((r) => permissionRoles.includes(r)) ||
                    permissions.some((p) => permissionRoles.includes(p))
```

### Bug #6: 响应错误消息不准确
**问题**: 错误处理只显示 `error.message`，没有从 `error.response.data` 获取详细错误信息

**修复**:
```typescript
let errorMsg = '请求失败'
if (error.response?.data) {
  const data = error.response.data
  errorMsg = data.msg || data.message || errorMsg
} else if (error.message) {
  errorMsg = error.message
}
```

### Bug #7-8: 缺少 caseNumber 配置
**问题**: 登录页面使用 `settingsStore.caseNumber`，但配置文件中没有定义

**修复**:
- `src/settings.ts`: 添加 `caseNumber: '京ICP备xxxxxxxx号'`
- `src/stores/settings.ts`: 在接口和 state 中添加 `caseNumber` 字段

### Bug #9: API 参数名不匹配
**问题**: `UserQueryParams` 使用 `pageSize`，但页面组件使用 `limit`

**修复**: 在 `UserQueryParams` 接口中同时支持 `limit` 和 `pageSize`

### Bug #10: getInfo 缺少 token 参数
**问题**: `getInfo(token)` API 定义需要 token 参数，但调用时没有传递

**修复**: `await getInfo()` → `await getInfo(this.token)`

### Bug #11: 用户编辑错误处理不完整
**问题**: 编辑用户失败时 `loading` 状态没有正确重置

**修复**: 添加 `.catch()` 处理并重置 loading 状态

## 现存问题

以下问题已发现但未修复，属于现有代码问题或需要架构讨论：

1. **TypeScript 类型错误**: 项目存在约 60+ 个 TypeScript 类型错误（非本次修复引入）
2. **角色管理 ID 字段不一致**: 代码中混用 `row.id` 和 `row.roleId`
3. **TagsView 类型不兼容**: TagView 接口与实际使用不完全匹配
4. **部分组件未使用的导入**: 多个组件有未使用的变量和导入

## 建议后续改进

1. 统一 ID 字段命名规范 (id vs userId vs roleId)
2. 修复所有 TypeScript 类型错误
3. 添加单元测试覆盖核心功能
4. 实施更严格的 ESLint 规则
5. 为 API 响应添加更严格的类型定义

## 验证步骤

1. ✅ 开发服务器正常启动 (http://localhost:3003/)
2. ✅ Sass 警告已消除
3. ✅ 所有修改的文件没有新增类型错误
4. ✅ HMR (热模块替换) 正常工作

---

**修复完成时间**: 2026-02-06
