import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type OrgMemberDetail = {
  relationBadge: string;
  name: string;
  memberNo: string;
  grade: string;
  regDate: string;
  realtimeP: string;
};

type HoverState = {
  detail: OrgMemberDetail;
  anchor: DOMRect;
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

const DETAIL_ROWS: { key: "grade" | "regDate" | "realtimeP"; label: string; badge?: boolean }[] = [
  { key: "grade", label: "등급", badge: true },
  { key: "regDate", label: "등록일" },
  { key: "realtimeP", label: "실시간 P" },
];

function OrgMemberHoverPopupPanel({
  detail,
  anchor,
  onMouseEnter,
  onMouseLeave,
}: {
  detail: OrgMemberDetail;
  anchor: DOMRect;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: anchor.left, top: anchor.top, placement: "above" as "above" | "below" });

  useEffect(() => {
    const el = panelRef.current;
    if (!el) {
      setPos({ left: anchor.left, top: anchor.top, placement: "above" });
      return;
    }

    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const margin = 8;
    const gap = 10;
    let left = anchor.left;
    let top = anchor.top - h - gap;
    let placement: "above" | "below" = "above";

    if (top < margin) {
      top = anchor.bottom + gap;
      placement = "below";
    }

    left = Math.max(margin, Math.min(left, window.innerWidth - w - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - h - margin));

    setPos({ left, top, placement });
  }, [anchor, detail.memberNo]);

  return (
    <div
      ref={panelRef}
      className={`org-member-hover-popup org-member-hover-popup--${pos.placement}`}
      style={{ left: pos.left, top: pos.top }}
      role="tooltip"
      aria-label={`${detail.name} 회원 정보`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="org-member-hover-popup__badge">{detail.relationBadge}</span>
      <div className="org-member-hover-popup__title">
        {detail.name} ({detail.memberNo})
      </div>
      <div className="org-member-hover-popup__divider" aria-hidden />
      <dl className="org-member-hover-popup__rows">
        {DETAIL_ROWS.map((row) => (
          <div key={row.key} className="org-member-hover-popup__row">
            <dt>{row.label}</dt>
            <dd>
              {row.badge ? (
                <span className="org-member-hover-popup__grade-badge">{detail[row.key]}</span>
              ) : (
                detail[row.key]
              )}
            </dd>
          </div>
        ))}
      </dl>
      <div className="org-member-hover-popup__footer">더블클릭 시 상세 정보 로드</div>
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
      setState({
        detail,
        anchor: el.getBoundingClientRect(),
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
            anchor={state.anchor}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          />,
          document.body,
        )}
    </OrgChartHoverContext.Provider>
  );
}
