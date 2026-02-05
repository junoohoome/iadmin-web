import settings from '@/settings'

const title = settings.title || 'Vue Admin Template'

export default function getPageTitle(pageTitle?: string): string {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
