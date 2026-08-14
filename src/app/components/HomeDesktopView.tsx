import React, { useState } from "react";
import {
  Star,
  User,
  Building2,
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

type FavoriteTab = "process" | "screen";

type FavoriteItem = {
  key: HomeShortcutKey;
  label: string;
  badge: string;
  icon: LucideIcon;
  accent: string;
};

const processFavorites: FavoriteItem[] = [
  { key: "order-register", label: "구매", badge: "구매", icon: ShoppingCart, accent: "#16a34a" },
  { key: "member-register", label: "회원등록", badge: "회원", icon: UserPlus, accent: "#db2777" },
  { key: "order-register", label: "주문서등록", badge: "주문", icon: ShoppingCart, accent: "#dc2626" },
];

const screenFavorites: FavoriteItem[] = [
  { key: "dashboard", label: "대시보드", badge: "화면", icon: LayoutDashboard, accent: "#007aff" },
  { key: "org-chart", label: "조직도", badge: "회원", icon: GitFork, accent: "#16a34a" },
  { key: "member-register", label: "회원정보", badge: "회원", icon: UserPlus, accent: "#db2777" },
];

const noticeItems = [
  { id: 1, title: "2026년 상반기 수당 정산 안내", date: "2026-08-12" },
  { id: 2, title: "주문서 승인 프로세스 변경 공지", date: "2026-08-08" },
  { id: 3, title: "조직도 인쇄 화면 업데이트", date: "2026-08-01" },
  { id: 4, title: "시스템 정기 점검 일정 안내", date: "2026-07-28" },
];

export type HomeDesktopMember = {
  name: string;
  loginId: string;
  no: string;
  rank: string;
  region: string;
};

interface HomeDesktopViewProps {
  activeTask: "desktop" | HomeShortcutKey;
  onShortcutClick: (key: HomeShortcutKey) => void;
  member?: HomeDesktopMember;
}

export function HomeDesktopView({ activeTask, onShortcutClick, member }: HomeDesktopViewProps) {
  const [favoriteTab, setFavoriteTab] = useState<FavoriteTab>("process");
  const favorites = favoriteTab === "process" ? processFavorites : screenFavorites;
  const profile = member ?? {
    name: "김상경",
    loginId: "charm0123",
    no: "10000015",
    rank: "블루",
    region: "영업부",
  };

  if (activeTask !== "desktop") {
    return (
      <div className="home-desktop">
        <div className="home-desktop-body home-desktop-body--placeholder">
          <div className="home-page-placeholder home-page-placeholder--embedded">
            <span className="home-page-placeholder__title">대시보드</span>
            <span className="home-page-placeholder__desc">화면 준비 중입니다.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-desktop">
      <div className="home-desktop-body home-desktop-body--portal">
        <div className="home-portal">
          <aside className="home-portal-left">
            <section className="home-profile-card">
              <div className="home-profile-card__banner" aria-hidden />
              <div className="home-profile-card__avatar" aria-hidden>
                <User size={36} strokeWidth={1.5} />
              </div>
              <div className="home-profile-card__body">
                <h2 className="home-profile-card__name">{profile.name}</h2>
                <p className="home-profile-card__meta">
                  <User size={14} strokeWidth={1.75} aria-hidden />
                  <span>{profile.loginId}</span>
                </p>
                <p className="home-profile-card__meta home-profile-card__meta--dept">
                  <Building2 size={14} strokeWidth={1.75} aria-hidden />
                  <span>{profile.rank} · {profile.region}</span>
                </p>
              </div>
            </section>

            <section className="home-favorite-card">
              <header className="home-favorite-card__head">
                <Star size={16} strokeWidth={1.75} aria-hidden />
                <h3>즐겨찾기</h3>
              </header>

              <div className="home-favorite-card__tabs" role="tablist" aria-label="즐겨찾기 구분">
                <button
                  type="button"
                  role="tab"
                  aria-selected={favoriteTab === "process"}
                  className={`home-favorite-card__tab${favoriteTab === "process" ? " is-active" : ""}`}
                  onClick={() => setFavoriteTab("process")}
                >
                  프로세스
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={favoriteTab === "screen"}
                  className={`home-favorite-card__tab${favoriteTab === "screen" ? " is-active" : ""}`}
                  onClick={() => setFavoriteTab("screen")}
                >
                  화면
                </button>
              </div>

              <ul className="home-favorite-card__list">
                {favorites.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={`${item.key}-${item.label}-${index}`}>
                      <button
                        type="button"
                        className="home-favorite-card__item"
                        onClick={() => onShortcutClick(item.key)}
                      >
                        <span
                          className="home-favorite-card__item-icon"
                          style={{ color: item.accent, background: `${item.accent}18` }}
                        >
                          <Icon size={16} strokeWidth={1.75} aria-hidden />
                        </span>
                        <span className="home-favorite-card__item-text">
                          <span className="home-favorite-card__item-badge">[{item.badge}]</span>
                          {item.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </aside>

          <section className="home-notice-card">
            <header className="home-notice-card__head">
              <h3>공지사항</h3>
            </header>
            <ul className="home-notice-card__list">
              {noticeItems.map((item) => (
                <li key={item.id} className="home-notice-card__item">
                  <span className="home-notice-card__title">{item.title}</span>
                  <span className="home-notice-card__date">{item.date}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
