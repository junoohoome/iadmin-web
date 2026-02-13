import { useUserStore } from '@/stores/user'
import type { Directive, DirectiveBinding } from 'vue'

/**
 * 权限指令
 * 用法: v-permission="['admin', 'editor']"
 */
const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    const roles = userStore.roles
    const permissions = userStore.permissions

    if (roles && roles.includes('superadmin')) {
      return
    }

    if (value && value instanceof Array && value.length > 0) {
      const permissionRoles = value

      // 同时检查角色和权限
      const hasPermission = roles.some((r) => permissionRoles.includes(r)) ||
                          permissions.some((p) => permissionRoles.includes(p))

      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error(`need permissions! Like v-permission="['admin','editor']"`)
    }
  }
}

export default permission
