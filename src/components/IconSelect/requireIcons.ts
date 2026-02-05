// Vite version of requireIcons - using import.meta.glob instead of require.context

const iconModules = import.meta.glob('../../icons/svg/*.svg', { eager: true })

const icons: string[] = []

for (const path in iconModules) {
  const match = path.match(/\.\/(.*)\.svg/)
  if (match) {
    icons.push(match[1])
  }
}

export default icons
