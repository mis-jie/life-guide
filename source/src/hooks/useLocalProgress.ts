import { useEffect, useState } from "react";

export type ItemProgress = {
  status: "done" | "todo" | null;
  favorite: boolean;
};

type ProgressMap = Record<string, ItemProgress>;

const PROGRESS_KEY = "better-life-progress";
const LAST_READ_KEY = "better-life-last-read";
const emptyProgress: ItemProgress = { status: null, favorite: false };

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
}

export function useLocalProgress() {
  const [progress, setProgress] = useState<ProgressMap>(() => readJson(PROGRESS_KEY, {}));

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // 本地存储不可用时，当前页面内的状态仍然可以使用。
    }
  }, [progress]);

  const get = (id: string) => progress[id] || emptyProgress;

  const toggleStatus = (id: string, status: "done" | "todo") => {
    setProgress((current) => {
      const item = current[id] || emptyProgress;
      return {
        ...current,
        [id]: { ...item, status: item.status === status ? null : status },
      };
    });
  };

  const toggleFavorite = (id: string) => {
    setProgress((current) => {
      const item = current[id] || emptyProgress;
      return { ...current, [id]: { ...item, favorite: !item.favorite } };
    });
  };

  return { progress, get, toggleStatus, toggleFavorite };
}

export function readLastTipId() {
  try {
    return localStorage.getItem(LAST_READ_KEY) || "";
  } catch {
    return "";
  }
}

export function rememberLastTip(id: string) {
  try {
    localStorage.setItem(LAST_READ_KEY, id);
  } catch {
    // 阅读本身不依赖本地存储。
  }
}
