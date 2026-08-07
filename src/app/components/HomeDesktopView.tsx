import React from "react";
import {
  Plus,
  LayoutDashboard,
  UserPlus,
  ShoppingCart,
  GitFork,
  type LucideIcon,
} from "lucide-react";

export type HomeShortcutKey =
  | "dashboard"
  | "member-register"
  | "order-register"
  | "org-chart"
  | "add-shortcut";

interface HomeShortcut {
  key: HomeShortcutKey;
  label: string;
  icon: LucideIcon;
  bg: string;
  color: string;
}

const homeShortcuts: HomeShortcut[] = [
  { key: "dashboard", label: "대시보드", icon: LayoutDashboard, bg: "#93c5fd", color: "#0284c7" },
  { key: "member-register", label: "회원등록", icon: UserPlus, bg: "#f9a8d4", color: "#db2777" },
  { key: "order-register", label: "주문서등록", icon: ShoppingCart, bg: "#fca5a5", color: "#dc2626" },
  { key: "org-chart", label: "조직도", icon: GitFork, bg: "#86efac", color: "#16a34a" },
];

interface HomeDesktopViewProps {
  activeTask: "desktop" | HomeShortcutKey;
  onShortcutClick: (key: HomeShortcutKey) => void;
}

export function HomeDesktopView({ activeTask, onShortcutClick }: HomeDesktopViewProps) {
  return (
    <div className="home-desktop">
      <div className="home-desktop-body">
        {activeTask === "desktop" ? (
            <div className="home-desktop-shortcuts">
              {homeShortcuts.map((shortcut) => {
                const Icon = shortcut.icon;
                return (
                  <button
                    key={shortcut.key}
                    type="button"
                    className="home-desktop-shortcut"
                    onClick={() => onShortcutClick(shortcut.key)}
                  >
                    <span
                      className="home-desktop-shortcut-icon"
                      style={{ background: shortcut.bg, color: shortcut.color }}
                    >
                      <Icon size={28} strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="home-desktop-shortcut-label">{shortcut.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                className="home-desktop-shortcut home-desktop-shortcut--disabled"
                disabled
                aria-label="바로가기 추가 (준비 중)"
              >
                <span className="home-desktop-shortcut-icon home-desktop-shortcut-icon--add">
                  <Plus size={28} strokeWidth={1.75} aria-hidden />
                </span>
              <span className="home-desktop-shortcut-label">바로가기 추가</span>
            </button>
            </div>
        ) : (
          <div className="home-page-placeholder home-page-placeholder--embedded">
            <span className="home-page-placeholder__title">
              {homeShortcuts.find((item) => item.key === activeTask)?.label ?? "화면"}
            </span>
            <span className="home-page-placeholder__desc">화면 준비 중입니다.</span>
          </div>
        )}
      </div>
    </div>
  );
}
