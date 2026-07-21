import { Users, BarChart2, ShoppingCart, Settings, Bell, HelpCircle, Home, CreditCard } from "lucide-react";

const navItems = [
  { icon: Home, label: "홈", key: "home" },
  { icon: Users, label: "회원관리", key: "members" },
  { icon: ShoppingCart, label: "주문서", key: "orders" },
  { icon: BarChart2, label: "수당", key: "stats" },
  { icon: CreditCard, label: "마일리지", key: "mileage" },
  { icon: Bell, label: "알림", key: "notifications" },
];

const bottomItems = [
  { icon: HelpCircle, label: "도움말" },
  { icon: Settings, label: "설정" },
];

type Theme = "deep-purple" | "dark";

const themes: { key: Theme; color: string; label: string }[] = [
  { key: "deep-purple", color: "#1a0a6b", label: "라이트" },
  { key: "dark",        color: "#0f1117", label: "다크" },
];

interface SidebarProps {
  activePanel: string | null;
  onPanelToggle: () => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}

export function Sidebar({ activePanel, onPanelToggle, theme, onThemeChange }: SidebarProps) {
  return (
    <div
      className="flex flex-col items-center py-4 gap-1"
      style={{ width: 48, background: "var(--sidebar-bg, #eceef2)", borderRight: "1px solid var(--border)", flexShrink: 0 }}
    >
      <div className="flex flex-col items-center gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = activePanel === item.key;
          return (
            <button
              key={item.key}
              title={item.label}
              onClick={item.key === "members" ? onPanelToggle : undefined}
              className="w-10 h-10 rounded flex items-center justify-center transition-all duration-200 group relative"
              style={{
                background: isActive ? "var(--sidebar-item-active-bg)" : "transparent",
                border: isActive ? "1px solid var(--sidebar-item-active-border, var(--border))" : "1px solid transparent",
              }}
            >
              <item.icon size={18} style={{ color: isActive ? "var(--accent-primary)" : "var(--sidebar-foreground)" }} />
              <span
                className="absolute left-10 px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                style={{ background: "#1e2130", color: "#fff", fontSize: "11px" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-1 mt-auto">
        {bottomItems.map((item) => (
          <button
            key={item.label}
            title={item.label}
            className="w-10 h-10 rounded flex items-center justify-center transition-all duration-200 group relative"
          >
            <item.icon size={18} style={{ color: "var(--sidebar-foreground)" }} />
            <span
              className="absolute left-10 px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
              style={{ background: "#1e2130", color: "#fff", fontSize: "11px" }}
            >
              {item.label}
            </span>
          </button>
        ))}

        {/* 테마 전환 버튼 */}
        <div className="flex flex-col items-center gap-1.5 mt-2 mb-1">
          {themes.map((t) => (
            <button
              key={t.key}
              title={t.label}
              onClick={() => onThemeChange(t.key)}
              className="group relative"
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: t.color,
                border: theme === t.key ? "2px solid #7c3aed" : "2px solid transparent",
                outline: theme === t.key ? "2px solid #c4b5fd" : "none",
                cursor: "pointer",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              <span
                className="absolute left-6 px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                style={{ background: "#1e2130", color: "#fff", fontSize: "11px" }}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>

        <div
          className="w-9 h-9 rounded flex items-center justify-center mt-1 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}
        >
          <span className="text-white text-xs font-semibold">관</span>
        </div>
      </div>
    </div>
  );
}
