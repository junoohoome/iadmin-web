import store from '@/store'

/**
 * @param {Array} value
 * @returns {Boolean}
 * @example see @/views/auth/directive.vue
 */
export default function checkPermission(value) {
  const roles = store.getters && store.getters.roles
  if (roles.indexOf('superadmin') > -1) {
    return true
  }

  if (value && value instanceof Array && value.length > 0) {
    const permissions = store.getters && store.getters.permissions
    const permissionRoles = value
    const hasPermission = permissions.some(p => {
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
