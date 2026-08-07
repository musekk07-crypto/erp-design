import React from "react";
import { Plus } from "lucide-react";

export type HomeShortcutKey =
  | "dashboard"
  | "member-register"
  | "order-register"
  | "org-chart"
  | "add-shortcut";

interface HomeShortcut {
  key: HomeShortcutKey;
  label: string;
  glyph: string;
  bg: string;
  color: string;
}

const homeShortcuts: HomeShortcut[] = [
  { key: "dashboard", label: "대시보드", glyph: "대", bg: "#dbeafe", color: "#2563eb" },
  { key: "member-register", label: "회원등록", glyph: "회", bg: "#fce7f3", color: "#db2777" },
  { key: "order-register", label: "주문서등록", glyph: "주", bg: "#fee2e2", color: "#dc2626" },
  { key: "org-chart", label: "조직도", glyph: "조", bg: "#dcfce7", color: "#16a34a" },
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
          <>
            <div className="home-desktop-brand">
              <div className="home-desktop-logo">midasNet</div>
              <div className="home-desktop-version">v5.0.0 (build 51)</div>
            </div>

            <div className="home-desktop-shortcuts">
              {homeShortcuts.map((shortcut) => (
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
                    {shortcut.glyph}
                  </span>
                  <span className="home-desktop-shortcut-label">{shortcut.label}</span>
                </button>
              ))}

              <button
                type="button"
                className="home-desktop-shortcut"
                onClick={() => onShortcutClick("add-shortcut")}
              >
                <span className="home-desktop-shortcut-icon home-desktop-shortcut-icon--add">
                  <Plus size={28} strokeWidth={1.5} />
                </span>
                <span className="home-desktop-shortcut-label">바로가기 추가</span>
              </button>
            </div>
          </>
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
