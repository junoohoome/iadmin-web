import { defineStore } from "pinia";
import settings from "@/settings";

interface SettingsState {
  theme: string;
  showSettings: boolean;
  tagsView: boolean;
  fixedHeader: boolean;
  sidebarLogo: boolean;
  showFooter: boolean;
  footerTxt: string;
  caseNumber: string;
}

export const useSettingsStore = defineStore("settings", {
  state: (): SettingsState => ({
    theme: "#1890ff",
    showSettings: settings.showSettings || false,
    tagsView: settings.tagsView !== undefined ? settings.tagsView : true,
    fixedHeader: settings.fixedHeader || false,
    sidebarLogo:
      settings.sidebarLogo !== undefined ? settings.sidebarLogo : true,
    showFooter: settings.showFooter !== undefined ? settings.showFooter : true,
    footerTxt: settings.footerTxt || "",
    caseNumber: settings.caseNumber || "",
  }),

  actions: {
    changeSetting(payload: {
      key: keyof SettingsState;
      value: string | boolean;
    }) {
      const { key, value } = payload;
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        (this as unknown as Record<string, string | boolean>)[key] = value;
      }
    },
  },

  persist: {
    key: "settings-store",
    storage: localStorage,
  },
});
