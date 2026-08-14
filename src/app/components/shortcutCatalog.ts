import {
  LayoutDashboard,
  UserPlus,
  ShoppingCart,
  GitFork,
  type LucideIcon,
} from "lucide-react";

export type ShortcutKey =
  | "dashboard"
  | "member-register"
  | "order-register"
  | "org-chart";

export type ShortcutItem = {
  key: ShortcutKey;
  label: string;
  icon: LucideIcon;
};

export const SHORTCUT_CATALOG: ShortcutItem[] = [
  { key: "dashboard", label: "대시보드", icon: LayoutDashboard },
  { key: "member-register", label: "회원등록", icon: UserPlus },
  { key: "order-register", label: "주문서등록", icon: ShoppingCart },
  { key: "org-chart", label: "조직도", icon: GitFork },
];

export const DEFAULT_SHORTCUTS: ShortcutKey[] = [
  "dashboard",
  "member-register",
  "order-register",
  "org-chart",
];

const STORAGE_KEY = "erp-user-shortcuts";

export function getShortcutMeta(key: ShortcutKey): ShortcutItem {
  return SHORTCUT_CATALOG.find((item) => item.key === key) ?? SHORTCUT_CATALOG[0];
}

export function loadShortcuts(): ShortcutKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_SHORTCUTS];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_SHORTCUTS];
    const valid = parsed.filter((key): key is ShortcutKey =>
      SHORTCUT_CATALOG.some((item) => item.key === key),
    );
    return valid.length > 0 ? valid : [...DEFAULT_SHORTCUTS];
  } catch {
    return [...DEFAULT_SHORTCUTS];
  }
}

export function saveShortcuts(keys: ShortcutKey[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // ignore quota / private mode
  }
}
