import { useUserStore } from '@/stores/user'

/**
 * Check if user has the required permissions
 * @param value - Array of permission roles to check
 * @returns Boolean indicating if user has permissions
 * @example see @/views/auth/directive.vue
 */
export default function checkPermission(value: string[]): boolean {
  const userStore = useUserStore()
  const roles = userStore.roles

  if (roles.includes('superadmin')) {
    return true
  }

  if (value && Array.isArray(value) && value.length > 0) {
    const permissions = userStore.permissions
    const permissionRoles = value
    const hasPermission = permissions.some((p: string) => {
      return permissionRoles.includes(p)
    })

    if (!hasPermission) {
      return false
    }
    return true
  } else {
    console.error(`need roles! Like v-permission="['admin','editor']"`)
    return false
  }
}
