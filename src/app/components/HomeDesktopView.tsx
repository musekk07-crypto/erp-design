import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  PlayCircle,
  Plus,
  X,
} from "lucide-react";
import {
  getShortcutMeta,
  SHORTCUT_CATALOG,
  type ShortcutKey,
} from "./shortcutCatalog";

export type HomeShortcutKey = ShortcutKey | "add-shortcut";

export type HomeDesktopMember = {
  name: string;
  loginId: string;
  no: string;
  rank: string;
  region: string;
};

interface HomeDesktopViewProps {
  activeTask: "desktop" | ShortcutKey;
  shortcuts: ShortcutKey[];
  onShortcutClick: (key: HomeShortcutKey) => void;
  onOpenAddShortcut: () => void;
  onRemoveShortcut: (key: ShortcutKey) => void;
  member?: HomeDesktopMember;
}

type MetricCard = {
  label: string;
  value: string;
  unit: string;
};

type DonutSlice = {
  label: string;
  percent: number;
  color: string;
};

type VisitStat = {
  label: string;
  percent: number;
  color: string;
};

type TopProduct = {
  no: number;
  name: string;
  qty: string;
  price: string;
};

const metrics: MetricCard[] = [
  { label: "매출합계", value: "2,305,070", unit: "원" },
  { label: "주문합계", value: "1,652,400", unit: "원" },
  { label: "주문서 건수", value: "135", unit: "건" },
  { label: "신규 회원", value: "18", unit: "명" },
];

const paymentSlices: DonutSlice[] = [
  { label: "카드", percent: 68, color: "#007aff" },
  { label: "온라인", percent: 22, color: "#38bdf8" },
  { label: "현금", percent: 10, color: "#f59e0b" },
];

const orderSlices: DonutSlice[] = [
  { label: "일반구매", percent: 54, color: "#007aff" },
  { label: "교환", percent: 18, color: "#22c55e" },
  { label: "반품", percent: 12, color: "#f97316" },
  { label: "기타", percent: 16, color: "#94a3b8" },
];

const visitStats: VisitStat[] = [
  { label: "서울센터", percent: 42, color: "#007aff" },
  { label: "부산센터", percent: 24, color: "#38bdf8" },
  { label: "대구센터", percent: 18, color: "#22c55e" },
  { label: "광주센터", percent: 10, color: "#f59e0b" },
  { label: "기타", percent: 6, color: "#94a3b8" },
];

const topProducts: TopProduct[] = [
  { no: 1, name: "비타민 종합세트", qty: "128", price: "280,000" },
  { no: 2, name: "오메가3 캡슐", qty: "96", price: "220,000" },
  { no: 3, name: "콜라겐 앰플", qty: "84", price: "180,000" },
  { no: 4, name: "프리미엄 케어세트", qty: "71", price: "450,000" },
  { no: 5, name: "프로바이오틱스", qty: "65", price: "50,000" },
  { no: 6, name: "헬스케어 멀티팩", qty: "58", price: "260,000" },
  { no: 7, name: "스킨케어 토너", qty: "52", price: "69,999" },
  { no: 8, name: "수분크림", qty: "47", price: "70,000" },
  { no: 9, name: "뉴트리션 바", qty: "41", price: "35,000" },
  { no: 10, name: "프리미엄 기프트박스", qty: "36", price: "380,000" },
];

function buildDonutBackground(slices: DonutSlice[]) {
  let cursor = 0;
  const stops = slices.map((slice) => {
    const start = cursor;
    cursor += slice.percent;
    return `${slice.color} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function formatTodayLabel(date: Date) {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${weekdays[date.getDay()]}요일`;
}

export function ShortcutAddModal({
  open,
  shortcuts,
  onClose,
  onAdd,
  onRemove,
}: {
  open: boolean;
  shortcuts: ShortcutKey[];
  onClose: () => void;
  onAdd: (key: ShortcutKey) => void;
  onRemove: (key: ShortcutKey) => void;
}) {
  if (!open) return null;

  const available = SHORTCUT_CATALOG.filter((item) => !shortcuts.includes(item.key));
  const current = shortcuts.map((key) => getShortcutMeta(key));

  return (
    <div className="shortcut-add-modal" role="dialog" aria-modal="true" aria-label="바로가기 관리">
      <button type="button" className="shortcut-add-modal__backdrop" aria-label="닫기" onClick={onClose} />
      <div className="shortcut-add-modal__panel">
        <header className="shortcut-add-modal__header">
          <h2 className="shortcut-add-modal__title">바로가기 관리</h2>
          <button type="button" className="shortcut-add-modal__close" aria-label="닫기" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        <div className="shortcut-add-modal__body">
          <section className="shortcut-add-modal__section">
            <h3 className="shortcut-add-modal__section-title">추가 가능한 화면</h3>
            {available.length === 0 ? (
              <p className="shortcut-add-modal__empty">추가할 수 있는 화면이 없습니다.</p>
            ) : (
              <ul className="shortcut-add-modal__list">
                {available.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        className="shortcut-add-modal__item"
                        onClick={() => onAdd(item.key)}
                      >
                        <Icon size={16} strokeWidth={1.75} aria-hidden />
                        <span>{item.label}</span>
                        <Plus size={14} aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="shortcut-add-modal__section">
            <h3 className="shortcut-add-modal__section-title">현재 바로가기</h3>
            {current.length === 0 ? (
              <p className="shortcut-add-modal__empty">등록된 바로가기가 없습니다.</p>
            ) : (
              <ul className="shortcut-add-modal__list">
                {current.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key}>
                      <div className="shortcut-add-modal__item shortcut-add-modal__item--current">
                        <Icon size={16} strokeWidth={1.75} aria-hidden />
                        <span>{item.label}</span>
                        <button
                          type="button"
                          className="shortcut-add-modal__remove"
                          aria-label={`${item.label} 삭제`}
                          onClick={() => onRemove(item.key)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export function HomeDesktopView({
  activeTask,
  shortcuts,
  onShortcutClick,
  onOpenAddShortcut,
  onRemoveShortcut,
}: HomeDesktopViewProps) {
  const [dayOffset, setDayOffset] = useState(0);
  const viewDate = new Date();
  viewDate.setDate(viewDate.getDate() + dayOffset);

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

  const ctaKey = shortcuts.includes("order-register")
    ? "order-register"
    : shortcuts[0];
  const ctaMeta = ctaKey ? getShortcutMeta(ctaKey) : null;

  return (
    <div className="home-desktop">
      <div className="home-desktop-body home-desktop-body--dashboard">
        <div className="home-dash">
          <header className="home-dash-date">
            <button
              type="button"
              className="home-dash-date__nav"
              aria-label="이전 날짜"
              onClick={() => setDayOffset((v) => v - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="home-dash-date__label">{formatTodayLabel(viewDate)}</span>
            <button
              type="button"
              className="home-dash-date__nav"
              aria-label="다음 날짜"
              onClick={() => setDayOffset((v) => v + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </header>

          <section className="home-dash-metrics">
            {metrics.map((metric) => (
              <article key={metric.label} className="home-dash-metric">
                <div className="home-dash-metric__label">{metric.label}</div>
                <div className="home-dash-metric__value">
                  <strong>{metric.value}</strong>
                  <span>{metric.unit}</span>
                </div>
              </article>
            ))}
          </section>

          <section className="home-dash-charts">
            <article className="home-dash-card">
              <h3 className="home-dash-card__title">결제 수단별 매출</h3>
              <div className="home-dash-donut-row">
                <div
                  className="home-dash-donut"
                  style={{ background: buildDonutBackground(paymentSlices) }}
                  aria-hidden
                />
                <ul className="home-dash-legend">
                  {paymentSlices.map((slice) => (
                    <li key={slice.label}>
                      <span className="home-dash-legend__swatch" style={{ background: slice.color }} />
                      <span className="home-dash-legend__label">{slice.label}</span>
                      <span className="home-dash-legend__value">{slice.percent}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <article className="home-dash-card">
              <h3 className="home-dash-card__title">주문/구매 구분 매출</h3>
              <div className="home-dash-donut-row">
                <div
                  className="home-dash-donut"
                  style={{ background: buildDonutBackground(orderSlices) }}
                  aria-hidden
                />
                <ul className="home-dash-legend">
                  {orderSlices.map((slice) => (
                    <li key={slice.label}>
                      <span className="home-dash-legend__swatch" style={{ background: slice.color }} />
                      <span className="home-dash-legend__label">{slice.label}</span>
                      <span className="home-dash-legend__value">{slice.percent}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </section>

          <section className="home-dash-bottom">
            <article className="home-dash-card">
              <h3 className="home-dash-card__title">센터별 출고 통계</h3>
              <ul className="home-dash-bars">
                {visitStats.map((stat) => (
                  <li key={stat.label} className="home-dash-bar">
                    <span className="home-dash-bar__label">{stat.label}</span>
                    <div className="home-dash-bar__track">
                      <div
                        className="home-dash-bar__fill"
                        style={{ width: `${stat.percent}%`, background: stat.color }}
                      />
                    </div>
                    <span className="home-dash-bar__value">{stat.percent}%</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="home-dash-card home-dash-card--table">
              <h3 className="home-dash-card__title">판매량 TOP 상품</h3>
              <div className="home-dash-table-wrap">
                <table className="home-dash-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>상품명</th>
                      <th>수량</th>
                      <th>가격</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((row) => (
                      <tr key={row.no}>
                        <td>{row.no}</td>
                        <td>{row.name}</td>
                        <td>{row.qty}</td>
                        <td>{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="home-dash-card home-dash-card--promo">
              <Package size={42} strokeWidth={1.4} aria-hidden />
              <p className="home-dash-promo__text">
                자주 쓰는 화면은 바로가기에서
                <br />
                빠르게 이동할 수 있습니다.
              </p>
              <div className="home-dash-promo__links">
                {shortcuts.map((key) => {
                  const link = getShortcutMeta(key);
                  const Icon = link.icon;
                  return (
                    <div key={link.key} className="home-dash-promo__link-wrap">
                      <button
                        type="button"
                        className="home-dash-promo__link"
                        onClick={() => onShortcutClick(link.key)}
                      >
                        <Icon size={14} strokeWidth={1.75} aria-hidden />
                        {link.label}
                      </button>
                      <button
                        type="button"
                        className="home-dash-promo__remove"
                        aria-label={`${link.label} 바로가기 삭제`}
                        onClick={() => onRemoveShortcut(link.key)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  className="home-dash-promo__link home-dash-promo__link--add"
                  onClick={onOpenAddShortcut}
                >
                  <Plus size={14} strokeWidth={1.75} aria-hidden />
                  추가
                </button>
              </div>
              {ctaMeta ? (
                <button
                  type="button"
                  className="home-dash-promo__cta"
                  onClick={() => onShortcutClick(ctaMeta.key)}
                >
                  <PlayCircle size={15} strokeWidth={1.75} aria-hidden />
                  {ctaMeta.label} 바로가기
                </button>
              ) : null}
            </article>
          </section>
        </div>
      </div>
    </div>
  );
}
