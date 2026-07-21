import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type OrgMemberDetail = {
  memberNo: string;
  name: string;
  ssn: string;
  phone: string;
  address: string;
  recommender: string;
  sponsor: string;
  rank: string;
  salesDate: string;
  withdrawDate: string;
  suspendDate: string;
  footer: string;
};

type HoverState = {
  detail: OrgMemberDetail;
  x: number;
  y: number;
} | null;

type OrgChartHoverContextValue = {
  showFromElement: (detail: OrgMemberDetail, el: HTMLElement) => void;
  scheduleHide: () => void;
  cancelHide: () => void;
  dismiss: () => void;
};

const OrgChartHoverContext = createContext<OrgChartHoverContextValue | null>(null);

export function useOrgChartHover() {
  return useContext(OrgChartHoverContext);
}

const ROWS: { key: keyof OrgMemberDetail; label: string; nav?: boolean }[] = [
  { key: "memberNo", label: "회원번호" },
  { key: "name", label: "이름" },
  { key: "ssn", label: "주민등록번호" },
  { key: "phone", label: "연락처" },
  { key: "address", label: "주소지" },
  { key: "recommender", label: "추천인", nav: true },
  { key: "sponsor", label: "후원인", nav: true },
  { key: "rank", label: "직급" },
  { key: "salesDate", label: "매출일자" },
  { key: "withdrawDate", label: "탈퇴일자" },
  { key: "suspendDate", label: "정지일자" },
];

function OrgMemberHoverPopupPanel({
  detail,
  x,
  y,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  detail: OrgMemberDetail;
  x: number;
  y: number;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useEffect(() => {
    const el = panelRef.current;
    if (!el) {
      setPos({ left: x, top: y });
      return;
    }
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const margin = 8;
    let left = x - w / 2;
    let top = y;
    left = Math.max(margin, Math.min(left, window.innerWidth - w - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - h - margin));
    setPos({ left, top });
  }, [x, y, detail.memberNo]);

  return (
    <div
      ref={panelRef}
      className="org-member-hover-popup"
      style={{ left: pos.left, top: pos.top }}
      role="dialog"
      aria-label="회원 정보"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button type="button" className="org-member-hover-popup__close" aria-label="닫기" onClick={onClose}>
        <X size={14} strokeWidth={2} />
      </button>
      <dl className="org-member-hover-popup__list">
        {ROWS.map((row) => (
          <div key={row.key} className="org-member-hover-popup__row">
            <dt>{row.label}</dt>
            <dd>
              {row.nav ? (
                <span className="org-member-hover-popup__nav-value">
                  <span className="org-member-hover-popup__nav-btn" aria-hidden>
                    ‹
                  </span>
                  <span>{detail[row.key]}</span>
                  <span className="org-member-hover-popup__nav-btn" aria-hidden>
                    ›
                  </span>
                </span>
              ) : (
                detail[row.key]
              )}
            </dd>
          </div>
        ))}
      </dl>
      <div className="org-member-hover-popup__footer">{detail.footer}</div>
    </div>
  );
}

export function OrgChartHoverProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HoverState>(null);
  const hideTimer = useRef<number | undefined>(undefined);

  const cancelHide = useCallback(() => {
    if (hideTimer.current !== undefined) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = undefined;
    }
  }, []);

  const dismiss = useCallback(() => {
    cancelHide();
    setState(null);
  }, [cancelHide]);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => setState(null), 160);
  }, [cancelHide]);

  const showFromElement = useCallback(
    (detail: OrgMemberDetail, el: HTMLElement) => {
      cancelHide();
      const r = el.getBoundingClientRect();
      setState({
        detail,
        x: r.left + r.width / 2,
        y: r.bottom + 6,
      });
    },
    [cancelHide],
  );

  useEffect(() => () => cancelHide(), [cancelHide]);

  const value: OrgChartHoverContextValue = {
    showFromElement,
    scheduleHide,
    cancelHide,
    dismiss,
  };

  return (
    <OrgChartHoverContext.Provider value={value}>
      {children}
      {state &&
        createPortal(
          <OrgMemberHoverPopupPanel
            detail={state.detail}
            x={state.x}
            y={state.y}
            onClose={dismiss}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          />,
          document.body,
        )}
    </OrgChartHoverContext.Provider>
  );
}
