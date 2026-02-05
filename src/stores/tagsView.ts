import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'

export interface TagView {
  path: string
  name: string
  title: string
  fullPath?: string
  meta?: {
    title?: string
    noCache?: boolean
    affix?: boolean
    icon?: string
  }
}

interface TagsViewState {
  visitedViews: TagView[]
  cachedViews: string[]
}

export const useTagsViewStore = defineStore('tagsView', {
  state: (): TagsViewState => ({
    visitedViews: [],
    cachedViews: []
  }),

  actions: {
    addView(view: RouteLocationNormalized) {
      this.addVisitedView(view)
      this.addCachedView(view)
    },

    addVisitedView(view: RouteLocationNormalized) {
      if (this.visitedViews.some((v) => v.path === view.path)) return

      this.visitedViews.push(
        Object.assign({}, view, {
          title: view.meta?.title || 'no-name',
          name: view.name as string,
          path: view.path,
          meta: view.meta
        }) as TagView
      )
    },

    addCachedView(view: RouteLocationNormalized) {
      if (this.cachedViews.includes(view.name as string)) return
      if (!view.meta?.noCache) {
        this.cachedViews.push(view.name as string)
      }
    },

    delView(view: TagView) {
      return new Promise<{ visitedViews: TagView[]; cachedViews: string[] }>((resolve) => {
        this.delVisitedView(view)
        this.delCachedView(view)
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },

    delVisitedView(view: TagView) {
      return new Promise<TagView[]>((resolve) => {
        for (const [i, v] of this.visitedViews.entries()) {
          if (v.path === view.path) {
            this.visitedViews.splice(i, 1)
            break
          }
        }
        resolve([...this.visitedViews])
      })
    },

    delCachedView(view: TagView) {
      return new Promise<string[]>((resolve) => {
        const index = this.cachedViews.indexOf(view.name)
        if (index > -1) {
          this.cachedViews.splice(index, 1)
        }
        resolve([...this.cachedViews])
      })
    },

    delOthersViews(view: TagView) {
      return new Promise<{ visitedViews: TagView[]; cachedViews: string[] }>((resolve) => {
        this.delOthersVisitedViews(view)
        this.delOthersCachedViews(view)
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },

    delOthersVisitedViews(view: TagView) {
      return new Promise<TagView[]>((resolve) => {
        this.visitedViews = this.visitedViews.filter((v) => {
          return v.meta?.affix || v.path === view.path
        })
        resolve([...this.visitedViews])
      })
    },

    delOthersCachedViews(view: TagView) {
      return new Promise<string[]>((resolve) => {
        const index = this.cachedViews.indexOf(view.name)
        if (index > -1) {
          this.cachedViews = this.cachedViews.slice(index, index + 1)
        }
        resolve([...this.cachedViews])
      })
    },

    delAllViews() {
      return new Promise<{ visitedViews: TagView[]; cachedViews: string[] }>((resolve) => {
        this.delAllVisitedViews()
        this.delAllCachedViews()
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },

    delAllVisitedViews() {
      return new Promise<TagView[]>((resolve) => {
        const affixTags = this.visitedViews.filter((tag) => tag.meta?.affix)
        this.visitedViews = affixTags
        resolve([...this.visitedViews])
      })
    },

    delAllCachedViews() {
      return new Promise<string[]>((resolve) => {
        this.cachedViews = []
        resolve([...this.cachedViews])
      })
    },

    updateVisitedView(view: TagView) {
      for (let v of this.visitedViews) {
        if (v.path === view.path) {
          v = Object.assign(v, view)
          break
        }
      }
    }
  },

  persist: {
    key: 'tagsView-store',
    storage: localStorage
  }
})
