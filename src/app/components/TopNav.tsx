import React, { useState, useEffect } from "react";

const mainMenus = ["기초관리", "회원관리", "주문관리", "수당관리", "출고관리", "옵션"];

const subTabs = ["회원정보", "주문서내역", "수당내역", "로그히스토리", "상담내역", "마일리지", "사용자설정", "마이페이지"];

const actionButtons = [
  { label: "새로만들기", variant: "primary" },
  { label: "저장", variant: "primary" },
  { label: "삭제", variant: "danger" },
  { label: "조직도", variant: "default" },
  { label: "직급조정", variant: "default" },
  { label: "사업자정보", variant: "default" },
  { label: "주문서", variant: "default" },
  { label: "메세지", variant: "default" },
  { label: "새비밀번호", variant: "default" },
  { label: "인쇄", variant: "default" },
];

interface TopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  listOpen: boolean;
  onListToggle: () => void;
}

export function TopNav({ activeTab, onTabChange, listOpen, onListToggle }: TopNavProps) {
  const [memberType, setMemberType] = useState<"일반" | "소비자">("일반");
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ flexShrink: 0 }}>
      {/* Row 1: Main nav */}
      <div className="flex items-center px-4" style={{ background: "var(--nav-bg, #0f1d32)", borderBottom: "1px solid var(--nav-border, #0a1526)", height: 44 }}>
        <div className="flex items-center gap-2 mr-6">
          <div
            className="flex items-center justify-center rounded"
            style={{ width: 28, height: 28, background: "var(--logo-bg, #7c3aed)", fontSize: 12, fontWeight: 700, color: "#fff" }}
          >
            VB
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--nav-text, #fff)" }}>(주)비아블</span>
          <span style={{ fontSize: 12, color: "var(--nav-text-muted, rgba(255,255,255,0.6))", marginLeft: 4 }}>ERP</span>
        </div>
        <div className="flex items-center h-full flex-1">
          {mainMenus.map((menu) => {
            const isActive = menu === "회원관리";
            return (
              <button
                key={menu}
                onClick={menu === "회원관리" ? onListToggle : undefined}
                className="flex items-center h-full px-4 transition-all duration-150"
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--nav-text, #fff)" : "var(--nav-text-muted, rgba(255,255,255,0.7))",
                  borderBottom: isActive ? `2px solid var(--nav-active-border, #fff)` : "2px solid transparent",
                  background: "transparent",
                }}
              >
                {menu}
              </button>
            );
          })}
        </div>
        {/* Right side: user info */}
        <div className="flex items-center gap-3 ml-4">
          <div
            className="flex items-center justify-center rounded"
            style={{ width: 26, height: 26, background: "var(--nav-avatar-bg, rgba(255,255,255,0.2))", fontSize: 12, fontWeight: 600, color: "var(--nav-text, #fff)" }}
          >
            KR
          </div>
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 26, height: 26, background: "#4f7ef8", fontSize: 12, fontWeight: 700, color: "#fff" }}
          >
            디
          </div>
          <span style={{ fontSize: 14, color: "var(--nav-text, #fff)" }}>디자인</span>
          <div style={{ width: 1, height: 14, background: "var(--nav-divider, rgba(255,255,255,0.3))" }} />
          <button style={{ fontSize: 14, color: "var(--nav-text-muted, rgba(255,255,255,0.7))" }}>로그아웃</button>
        </div>
      </div>

      {/* Row 2: Sub tabs + 회원등록 버튼 */}
      <div
        className="flex items-center px-4"
        style={{ background: "#fff", borderBottom: "1px solid var(--border)", height: 38 }}
      >
        <div className="flex items-center flex-1 h-full">
          {subTabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className="flex items-center h-full px-3 whitespace-nowrap transition-all duration-150"
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--accent-primary)" : "var(--muted-foreground)",
                  borderBottom: isActive ? "2px solid var(--accent-primary)" : "2px solid transparent",
                  background: "transparent",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Action buttons */}
      <div
        className="flex items-center gap-1.5 px-4"
        style={{ background: "#fff", borderBottom: "1px solid var(--border)", height: 42 }}
      >
        <div className="flex items-center gap-1.5 flex-1">
          {actionButtons.map((btn, i) => (
            <React.Fragment key={btn.label}>
              {i === 3 && <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 2px" }} />}
              <button
                className="flex items-center justify-center gap-1 px-2 py-0.5 rounded transition-all duration-150"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  background:
                    btn.variant === "primary" ? "var(--accent-light)"
                    : btn.variant === "danger" ? "#fee2e2"
                    : "#f1f3f7",
                  color:
                    btn.variant === "primary" ? "var(--accent-primary)"
                    : btn.variant === "danger" ? "#ef4444"
                    : "var(--foreground)",
                  border: "none",
                }}
              >
                {btn.label}
              </button>
            </React.Fragment>
          ))}
        </div>
        <button
          className="flex items-center justify-center px-2 py-0.5 rounded"
          style={{ fontSize: 13, fontWeight: 500, background: "var(--accent-light)", color: "var(--accent-primary)", border: "none" }}
        >
          회원등록
        </button>
      </div>
    </div>
  );
}
