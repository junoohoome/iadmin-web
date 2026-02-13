import type { RouteMeta as VueRouterRouteMeta } from "vue-router";

// 通用 API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  msg?: string;
  message?: string;
  data: T;
}

// 分页结果类型 - 匹配 MyBatis-Plus Page 序列化格式
export interface PageResult<T = any> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 登录参数
export interface LoginParams {
  username: string;
  password: string;
  code?: string;
  uuid?: string;
  rememberMe?: boolean;
}

// 用户信息
export interface UserInfo {
  id: number;
  userId?: number; // 兼容字段，某些后端接口返回 userId 而不是 id
  username: string;
  nickname?: string;
  nickName?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  avatar?: string;
  roles?: string[];
  roleNames?: string;
  permissions?: string[];
  createTime?: string;
  status?: number;
  roleIds?: number[];
}

// 用户类型
export type User = UserInfo;

// 菜单项
export interface MenuItem {
  id: number;
  parentId: number;
  name: string;
  path: string;
  component?: string;
  redirect?: string;
  icon?: string;
  type: string; // 'menu' | 'button' | 'directory'
  sort: number;
  visible?: boolean | string; // Backend sends string "0" or "1", frontend expects boolean
  hidden?: boolean | string; // Backend sends string "0" or "1", frontend expects boolean
  children?: MenuItem[];
  meta?: {
    title: string;
    icon?: string;
    noCache?: boolean;
    link?: string | null;
  };
}

export type Menu = MenuItem;

// 角色信息
export interface RoleInfo {
  id: number;
  roleId?: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: string;
  remark?: string;
  createTime?: string;
  menuIds?: number[];
  flag?: boolean;
}

export type Role = RoleInfo;

// 角色选项
export interface RoleOption {
  value: number;
  text: string;
}

// 部门信息
export interface DeptInfo {
  deptId: number;
  parentId: number;
  ancestors?: string;
  deptName: string;
  orderNum: number;
  leader?: string;
  phone?: string;
  email?: string;
  status: string;
  delFlag?: string;
  children?: DeptInfo[];
  createTime?: string;
}

export type Dept = DeptInfo;

// 字典类型
export interface DictType {
  dictId: number;
  dictName: string;
  dictType: string;
  status: string;
  remark?: string;
  createTime?: string;
}

export type Dict = DictType;

// 字典数据
export interface DictData {
  dictCode: number;
  dictSort: number;
  dictLabel: string;
  dictValue: string;
  dictType: string;
  cssClass?: string;
  listClass?: string;
  isDefault?: string;
  status: string;
  remark?: string;
}

export type DictItem = DictData;
export type DictDetail = DictData;

// 字典表单数据
export interface DictFormData {
  dictId: number;
  dictName: string;
  dictType: string;
  status: string;
  remark: string;
}

// 路由元信息 - 扩展 Vue Router 的 RouteMeta
export interface RouteMeta extends VueRouterRouteMeta {
  title: string;
  icon?: string;
  noCache?: boolean;
  link?: string | null;
  hidden?: boolean;
  roles?: string[];
  permissions?: string[];
  affix?: boolean;
}

// Vue Router 原始类型扩展
export type RouteRecordRaw = import("vue-router").RouteRecordRaw;
