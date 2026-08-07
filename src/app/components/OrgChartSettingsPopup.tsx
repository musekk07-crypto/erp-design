import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

const DISPLAY_ITEMS = [
  "아이디",
  "회원번호",
  "회원명",
  "회원등록일",
  "주문일자",
  "직급",
  "센터명",
];
const MAX_DISPLAY_ITEMS = 3;

const RELATION_OPTIONS = ["후원", "추천"];
const PERIOD_OPTIONS = ["오늘*", "이번 주", "이번 달", "직접 입력"];
const AGGREGATION_OPTIONS = ["주문일자", "수당적용일자"];
const PURCHASE_OPTIONS = ["구매 외 4건", "구매", "교환", "교환구매", "반품", "포인트"];
const COMPRESS_OPTIONS = ["압축없음", "직급별 조직도 압축", "주문서 내용에 따른 압축"];

const DEFAULT_DISPLAY_ITEMS = ["회원명", "회원번호"];

function todayValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export type OrgChartSettingsValues = {
  displayItems: string[];
  memberRegDate: string;
  maxDepth: string;
  relation: string;
  period: string;
  startDate: string;
  endDate: string;
  aggregation: string;
  purchase: string;
  compress: string;
};

type OrgChartSettingsPopupProps = {
  open: boolean;
  onClose: () => void;
  onConfirm?: (values: OrgChartSettingsValues) => void;
};

export function OrgChartSettingsPopup({ open, onClose, onConfirm }: OrgChartSettingsPopupProps) {
  const today = useMemo(todayValue, []);
  const [displayItems, setDisplayItems] = useState<string[]>(DEFAULT_DISPLAY_ITEMS);
  const [memberRegDate, setMemberRegDate] = useState(today);
  const [maxDepth, setMaxDepth] = useState("0");
  const [relation, setRelation] = useState(RELATION_OPTIONS[0]);
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [aggregation, setAggregation] = useState(AGGREGATION_OPTIONS[0]);
  const [purchase, setPurchase] = useState(PURCHASE_OPTIONS[0]);
  const [compress, setCompress] = useState(COMPRESS_OPTIONS[0]);

  useEffect(() => {
    if (!open) return;
    setDisplayItems(DEFAULT_DISPLAY_ITEMS);
    setMemberRegDate(today);
    setMaxDepth("0");
    setRelation(RELATION_OPTIONS[0]);
    setPeriod(PERIOD_OPTIONS[0]);
    setStartDate(today);
    setEndDate(today);
    setAggregation(AGGREGATION_OPTIONS[0]);
    setPurchase(PURCHASE_OPTIONS[0]);
    setCompress(COMPRESS_OPTIONS[0]);
  }, [open, today]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function toggleDisplayItem(item: string) {
    setDisplayItems((prev) => {
      if (prev.includes(item)) return prev.filter((entry) => entry !== item);
      if (prev.length >= MAX_DISPLAY_ITEMS) return prev;
      return [...prev, item];
    });
  }

  function handleConfirm() {
    onConfirm?.({
      displayItems,
      memberRegDate,
      maxDepth,
      relation,
      period,
      startDate,
      endDate,
      aggregation,
      purchase,
      compress,
    });
    onClose();
  }

  return (
    <div className="org-settings-modal" role="presentation" onClick={onClose}>
      <div
        className="org-settings-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label="조직도 설정"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="org-settings-modal__header">
          <h2 className="org-settings-modal__title">조직도 설정</h2>
          <button type="button" className="org-settings-modal__close" aria-label="닫기" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="org-settings-modal__body">
          <section className="org-settings-modal__section">
            <h3 className="org-settings-modal__section-title">표기항목 설정</h3>
            <p className="org-settings-modal__hint">
              조직도 인쇄 노드에 표시할 항목을 최대 {MAX_DISPLAY_ITEMS}/{DISPLAY_ITEMS.length}개까지 선택할 수 있습니다.
            </p>
            <div className="org-settings-modal__checklist">
              {DISPLAY_ITEMS.map((item) => {
                const order = displayItems.indexOf(item);
                const checked = order >= 0;
                const disabled = !checked && displayItems.length >= MAX_DISPLAY_ITEMS;
                return (
                  <label
                    key={item}
                    className={`org-settings-modal__check${disabled ? " is-disabled" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleDisplayItem(item)}
                    />
                    <span>{checked ? `${order + 1}. ${item}` : item}</span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="org-settings-modal__section">
            <h3 className="org-settings-modal__section-title">회원 조건</h3>
            <div className="org-settings-modal__row">
              <div className="org-settings-modal__field">
                <label className="org-settings-modal__label" htmlFor="org-settings-reg-date">
                  회원등록일자
                </label>
                <input
                  id="org-settings-reg-date"
                  type="date"
                  className="org-settings-modal__input"
                  value={memberRegDate}
                  onChange={(event) => setMemberRegDate(event.target.value)}
                />
              </div>
              <div className="org-settings-modal__field org-settings-modal__field--narrow">
                <label className="org-settings-modal__label" htmlFor="org-settings-depth">
                  최대높이
                </label>
                <input
                  id="org-settings-depth"
                  type="number"
                  min={0}
                  className="org-settings-modal__input"
                  value={maxDepth}
                  onChange={(event) => setMaxDepth(event.target.value)}
                />
              </div>
              <div className="org-settings-modal__field org-settings-modal__field--narrow">
                <label className="org-settings-modal__label" htmlFor="org-settings-relation">
                  관계라인
                </label>
                <select
                  id="org-settings-relation"
                  className="org-settings-modal__input org-settings-modal__select"
                  value={relation}
                  onChange={(event) => setRelation(event.target.value)}
                >
                  {RELATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="org-settings-modal__section">
            <h3 className="org-settings-modal__section-title">주문서 조건</h3>
            <div className="org-settings-modal__row">
              <div className="org-settings-modal__field org-settings-modal__field--narrow">
                <label className="org-settings-modal__label" htmlFor="org-settings-period">
                  기간선택
                </label>
                <select
                  id="org-settings-period"
                  className="org-settings-modal__input org-settings-modal__select"
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                >
                  {PERIOD_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="org-settings-modal__field">
                <label className="org-settings-modal__label" htmlFor="org-settings-start">
                  시작일자
                </label>
                <input
                  id="org-settings-start"
                  type="date"
                  className="org-settings-modal__input"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div className="org-settings-modal__field">
                <label className="org-settings-modal__label" htmlFor="org-settings-end">
                  종료일자
                </label>
                <input
                  id="org-settings-end"
                  type="date"
                  className="org-settings-modal__input"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
              <div className="org-settings-modal__field">
                <label className="org-settings-modal__label" htmlFor="org-settings-aggregation">
                  집계구분
                </label>
                <select
                  id="org-settings-aggregation"
                  className="org-settings-modal__input org-settings-modal__select"
                  value={aggregation}
                  onChange={(event) => setAggregation(event.target.value)}
                >
                  {AGGREGATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="org-settings-modal__field">
                <label className="org-settings-modal__label" htmlFor="org-settings-purchase">
                  구매구분
                </label>
                <select
                  id="org-settings-purchase"
                  className="org-settings-modal__input org-settings-modal__select"
                  value={purchase}
                  onChange={(event) => setPurchase(event.target.value)}
                >
                  {PURCHASE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="org-settings-modal__section">
            <h3 className="org-settings-modal__section-title">압축옵션</h3>
            <div className="org-settings-modal__radios">
              {COMPRESS_OPTIONS.map((option) => (
                <label key={option} className="org-settings-modal__radio">
                  <input
                    type="radio"
                    name="org-settings-compress"
                    value={option}
                    checked={compress === option}
                    onChange={() => setCompress(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="org-settings-modal__actions">
            <button type="button" className="org-settings-modal__btn" onClick={handleConfirm}>
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
