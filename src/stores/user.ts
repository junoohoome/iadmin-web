import { defineStore } from "pinia";
import { login, logout, getInfo } from "@/api/login";
import { getToken, setToken, removeToken } from "@/utils/auth";
import type { UserInfo, LoginParams } from "@/types";

interface UserState {
  token: string;
  name: string;
  avatar: string;
  roles: string[];
  permissions: string[];
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    token: getToken() || "",
    name: "",
    avatar: "",
    roles: [],
    permissions: [],
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    hasRoles: (state) => state.roles.length > 0,
  },

  actions: {
    SET_TOKEN(token: string) {
      this.token = token;
      setToken(token);
    },

    SET_NAME(name: string) {
      this.name = name;
    },

    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },

    SET_ROLES(roles: string[]) {
      this.roles = roles;
    },

    SET_PERMISSIONS(permissions: string[]) {
      this.permissions = permissions;
    },

    // 用户登录
    async login(userInfo: LoginParams) {
      const username = userInfo.username.trim();
      const password = userInfo.password;
      const code = userInfo.code || "";
      const uuid = userInfo.uuid || "";

      try {
        const res = await login(username, password, code, uuid);
        this.SET_TOKEN(res.data);
        return res;
      } catch (error) {
        throw error;
      }
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        const res = await getInfo();
        const user = res.data.user;

        const avatar = user.avatar
          ? import.meta.env.VITE_APP_BASE_API + "/avatar/" + user.avatar
          : new URL("@/assets/image/profile.jpg", import.meta.url).href;

        if (res.data.roles && res.data.roles.length > 0) {
          this.SET_ROLES(res.data.roles);
          this.SET_PERMISSIONS(res.data.permissions);
        } else {
          this.SET_ROLES(["ROLE_DEFAULT"]);
        }

        this.SET_NAME(user.username);
        this.SET_AVATAR(avatar);

        return user;
      } catch (error) {
        throw error;
      }
    },

    // 退出系统
    async logout() {
      try {
        await logout(this.token);
        this.SET_TOKEN("");
        this.SET_ROLES([]);
        this.SET_PERMISSIONS([]);
        removeToken();
      } catch (error) {
        throw error;
      }
    },

    // 删除 Token
    resetToken() {
      this.SET_TOKEN("");
      this.SET_ROLES([]);
      removeToken();
    },
  },

  persist: {
    key: "user-store",
    storage: localStorage,
    pick: ["token"],
  },
});
