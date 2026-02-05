/**
 * 获取日期范围快捷选项
 */
export function getDateshortcuts() {
  return {
    today: new Date(),
    yesterday: new Date(Date.now() - 3600 * 1000 * 24),
    weekAgo: new Date(Date.now() - 3600 * 1000 * 24 * 7),
  };
}

/**
 * 添加日期范围到查询参数
 */
export function addDateRange(
  params: Record<string, unknown>,
  dateRange: [Date, Date] | [string, string] | [],
  propName?: string,
): Record<string, unknown> {
  const search = params;
  search.params = {};
  if (dateRange && dateRange.length === 2) {
    if (propName) {
      search.params[propName] = dateRange;
    } else {
      search.params.beginTime = dateRange[0];
      search.params.endTime = dateRange[1];
    }
  }
  return search;
}

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(
  time?: Date | string | number,
  cFormat?: string,
): string | null {
  if (arguments.length === 0) {
    return null;
  }
  const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
  let date: Date;
  if (typeof time === "object") {
    date = time;
  } else {
    if (typeof time === "string" && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    }
    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj: Record<string, number> = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{([ymdhisa])+}/g, (_result, key) => {
    const value = formatObj[key];
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    return value.toString().padStart(2, "0");
  });
  return time_str;
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time: number | string, option?: string): string {
  if (("" + time).length === 10) {
    time = parseInt(time as string) * 1000;
  } else {
    time = +time;
  }
  const d = new Date(time);
  const now = Date.now();

  const diff = (now - d.getTime()) / 1000;

  if (diff < 30) {
    return "刚刚";
  } else if (diff < 3600) {
    return Math.ceil(diff / 60) + "分钟前";
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + "小时前";
  } else if (diff < 3600 * 24 * 2) {
    return "1天前";
  }
  if (option) {
    return parseTime(time, option) || "";
  } else {
    return (
      d.getMonth() +
      1 +
      "月" +
      d.getDate() +
      "日" +
      d.getHours() +
      "时" +
      d.getMinutes() +
      "分"
    );
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url: string): Record<string, string> {
  const search = url.split("?")[1];
  if (!search) {
    return {};
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"')
        .replace(/\+/g, " ") +
      '"}',
  );
}

/**
 * 文件下载
 * @param obj 文件对象
 * @param name 文件名
 * @param suffix 文件后缀
 */
export function downloadFile(obj: Blob, name: string, suffix: string): void {
  const url = window.URL.createObjectURL(new Blob([obj]));
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = url;
  const fileName =
    parseTime(new Date(), "{y}{m}{d}{h}{i}{s}") + "-" + name + "." + suffix;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 验证文件
 * @param file 文件对象
 * @param message 消息提示方法
 * @returns {Boolean}
 */
export function validFile(
  file: File,
  message?: (options: { type: string; message: string }) => void,
): boolean {
  const fileExt = file.name.replace(/.+\./, "");
  if (["jpg", "jpeg", "png", "gif"].indexOf(fileExt.toLowerCase()) === -1) {
    message?.({
      type: "warning",
      message: "请上传后缀名为jpg、jpeg、png、gif的附件！",
    });
    return false;
  }
  const isLt3M = file.size / 1024 / 1024 < 3;
  if (!isLt3M) {
    message?.({
      message: "上传文件大小不能超过 3MB",
      type: "warning",
    });
    return false;
  }
  return true;
}

/**
 * 深拷贝对象
 * @param obj 源对象
 * @returns {Object}
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }
  if (typeof obj === "object") {
    const copy: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copy[key] = deepClone(obj[key]);
      }
    }
    return copy as T;
  }
  return obj;
}

/**
 * 防抖函数
 * @param fn 函数
 * @param delay 延迟时间
 * @returns {Function}
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn 函数
 * @param delay 延迟时间
 * @returns {Function}
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}
