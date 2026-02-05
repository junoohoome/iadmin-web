interface Picker {
  $emit: (event: string, value: [Date, Date]) => void;
}

interface ShortcutItem {
  text: string;
  onClick: (picker: Picker) => void;
}

interface DateShortcuts {
  shortcuts: ShortcutItem[];
}

/**
 * 获取时间插件的快捷选择对象
 */
export function getDateshortcuts(): DateShortcuts {
  return {
    shortcuts: [
      {
        text: "最近一周",
        onClick(picker: Picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "最近一个月",
        onClick(picker: Picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "最近三个月",
        onClick(picker: Picker) {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
          picker.$emit("pick", [start, end]);
        },
      },
    ],
  };
}

interface SearchParams {
  beginTime?: Date;
  endTime?: Date;
  [key: string]: unknown;
}

// 添加日期范围
export function addDateRange(
  params: Record<string, unknown>,
  dateRange: Date[] | null,
): SearchParams {
  let search: SearchParams = { ...params } as SearchParams;
  if (dateRange != null) {
    search = {
      beginTime: dateRange[0],
      endTime: dateRange[1],
    };
  }
  return search;
}
