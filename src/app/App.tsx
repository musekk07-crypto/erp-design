import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  User, Shield, GitFork, CreditCard, Users, Info,
  BarChart2, ShoppingCart, Settings, Bell, HelpCircle, Home,
  Pin, Clock, ChevronLeft, ChevronRight, RefreshCw,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Theme = "deep-purple" | "light-gray" | "dark";
type SortKey = string | null;
type SortDir = "asc" | "desc";

// 레이아웃 고정 너비 — 회원목록 확장 시 컨텐츠 찌그러짐 방지
const SIDEBAR_WIDTH = 48;
const MEMBER_LIST_MIN_WIDTH = 240;
const MEMBER_LIST_DEFAULT_WIDTH = 240;
const MEMBER_LIST_PAGE_SIZE = 15;
const MEMBER_LIST_MAX_WIDTH =
  36 + 36 + 96 + 100 + 54 + 62 + 84 + 56 + 54 + 54 + 108 + 108 + 84;
const FORM_COLUMN_WIDTH_MIN = 620;
const ORDER_PANEL_MIN_WIDTH = 1080;
const APP_MIN_WIDTH = 1280;
const LIST_PANEL_TRANSITION_MS = 250;
const LAYOUT_TRANSITION = `width ${LIST_PANEL_TRANSITION_MS}ms ease, min-width ${LIST_PANEL_TRANSITION_MS}ms ease`;
const ORG_CARD_W = 118;
const ORG_CARD_H = 126;
const ORG_CHILD_CHIP_H = 38;
const ORG_COL_GAP = 16;
const ORG_HPAD = 6;
const ORG_FOREIGN_PAD = 2;
const ORG_CHART_SIDE_PAD = 20;
const ORG_CHART_CONTENT_TOP = 12;

function getOrgChartTopShift(contentTop: number) {
  return Math.max(ORG_CHART_CONTENT_TOP, ORG_CHART_CONTENT_TOP - contentTop);
}
const ORG_CHART_SVG_WIDTH = ORG_HPAD * 2 + ORG_CARD_W * 3 + ORG_COL_GAP * 2 + ORG_FOREIGN_PAD;
const ORG_CHART_WIDTH = ORG_CHART_SVG_WIDTH + ORG_CHART_SIDE_PAD * 2;
const DETAIL_CONTENT_GAP = 8;
const DETAIL_PANEL_PAD = 8;
const HISTORY_RAIL_COLLAPSED = 40;
const HISTORY_RAIL_EXPANDED = 200;

function getDetailContentWidth(formColumnWidth: number) {
  return formColumnWidth + ORG_CHART_WIDTH + DETAIL_CONTENT_GAP;
}

function getDetailPanelWidth(formColumnWidth: number) {
  return getDetailContentWidth(formColumnWidth) + DETAIL_PANEL_PAD * 2;
}

function calcFormColumnWidth(availableDetailWidth: number) {
  const innerWidth = Math.max(0, availableDetailWidth - DETAIL_PANEL_PAD * 2);
  const idealForm = innerWidth - ORG_CHART_WIDTH - DETAIL_CONTENT_GAP;
  return Math.max(FORM_COLUMN_WIDTH_MIN, idealForm);
}

function clampMemberListWidth(width: number) {
  return Math.max(MEMBER_LIST_MIN_WIDTH, Math.min(MEMBER_LIST_MAX_WIDTH, width));
}

// ─────────────────────────────────────────────
// OrgChart
// ─────────────────────────────────────────────

interface OrgChartProps {
  memberId: number;
  memberName: string;
}

const ORG_SELF_ACCENT = "var(--org-self-accent, var(--org-link))";
const LABEL_GRAY = "var(--org-label)";
const BORDER_GRAY = "var(--org-border)";
const CARD_W = ORG_CARD_W;
const CARD_H = ORG_CARD_H;
const CHILD_CHIP_H = ORG_CHILD_CHIP_H;
const EXTRA_H = 34;
const GAP = 7;
const COL_GAP = ORG_COL_GAP;

function Card({ label, name, id, date, rank, score, isSelf = false }: {
  label: string; name: string; id: number; date: string; rank: string; score: number | string; isSelf?: boolean;
}) {
  return (
    <div style={{
      width: CARD_W,
      height: CARD_H,
      border: isSelf ? `2px solid ${BORDER_GRAY}` : `1px solid ${BORDER_GRAY}`,
      borderRadius: 6,
      background: "var(--org-card-bg)",
      textAlign: "center",
      padding: "8px 6px 11px",
      position: "relative",
      boxSizing: "border-box",
      flexShrink: 0,
    }}>
      {isSelf && (
        <span style={{
          position: "absolute", top: 4, right: 4,
          background: ORG_SELF_ACCENT, color: "var(--on-accent)",
          fontSize: 11, padding: "2px 7px", borderRadius: 10, fontWeight: 700, lineHeight: 1.2,
        }}>자신</span>
      )}
      <div style={{ fontSize: 12, color: LABEL_GRAY, marginBottom: 4 }}>
        {isSelf ? "나" : label}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--org-text)", marginBottom: 2 }}>
        {name}({id})
      </div>
      <div style={{ fontSize: 12, color: "var(--org-text-muted)", marginBottom: 1 }}>{date}</div>
      <div style={{ fontSize: 12, color: "var(--org-text-muted)", marginBottom: 3 }}>{rank}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--org-text)", lineHeight: 1.35 }}>{score}</div>
    </div>
  );
}

function ExtraBox({ label }: { label: string }) {
  return (
    <div style={{
      width: CARD_W, height: EXTRA_H,
      border: `1px dashed ${BORDER_GRAY}`,
      borderRadius: 6, background: "var(--org-extra-bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, color: LABEL_GRAY, boxSizing: "border-box", flexShrink: 0,
    }}>
      {label}
    </div>
  );
}

function ChildChip({ name, id }: { name: string; id: number }) {
  return (
    <div style={{
      border: `1px solid ${BORDER_GRAY}`,
      borderRadius: 6,
      background: "var(--org-card-bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: CHILD_CHIP_H,
      width: CARD_W,
      fontSize: 13,
      fontWeight: 600,
      color: "var(--org-text)",
      boxSizing: "border-box",
    }}>
      {name} ({id})
    </div>
  );
}

type OrgNode = {
  label: string;
  name: string;
  id: number;
  date: string;
  rank: string;
  score: number | string;
};

type OrgLayoutType = "tree" | "linear" | "fork" | "tall-tree";

function OrgChartSvg({
  layoutType,
  parent,
  sibling,
  self,
  extraAbove,
  children,
  showExtra,
  stackNodes = [],
}: {
  layoutType: OrgLayoutType;
  parent: OrgNode;
  sibling: OrgNode;
  self: OrgNode;
  extraAbove: string;
  children: { name: string; id: number }[];
  showExtra: boolean;
  stackNodes?: OrgNode[];
}) {
  const HPAD = ORG_HPAD;
  const VPAD = 8;
  const col1X = HPAD;
  const col2X = col1X + CARD_W + COL_GAP;
  const col3X = col2X + CARD_W + COL_GAP;
  const railMid = col2X - COL_GAP / 2;
  const railRight = col3X - COL_GAP / 2;

  if (layoutType === "linear") {
    const centerY = CARD_H / 2;
    const yShift = getOrgChartTopShift(0);
    const svgW = col3X + CARD_W + ORG_FOREIGN_PAD + HPAD;
    const svgH = CARD_H + yShift + VPAD;
  return (
      <svg width={svgW} height={svgH} style={{ overflow: "visible", display: "block" }}>
        <g transform={`translate(0, ${yShift})`}>
        <foreignObject x={col1X} y={centerY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
          <Card {...parent} />
        </foreignObject>
        <line x1={col1X + CARD_W} y1={centerY} x2={col2X} y2={centerY} stroke={BORDER_GRAY} strokeWidth={1} />
        <foreignObject x={col2X} y={centerY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
          <Card {...self} isSelf />
        </foreignObject>
        {children[0] && (
          <>
            <line x1={col2X + CARD_W} y1={centerY} x2={col3X} y2={centerY} stroke={BORDER_GRAY} strokeWidth={1} />
            <foreignObject x={col3X} y={centerY - CHILD_CHIP_H / 2} width={CARD_W + 2} height={CHILD_CHIP_H + 2}>
              <ChildChip {...children[0]} />
            </foreignObject>
          </>
        )}
        </g>
      </svg>
    );
  }

  if (layoutType === "fork") {
    const stackH = CHILD_CHIP_H * 2 + GAP;
    const blockH = Math.max(CARD_H, stackH);
    const centerY = blockH / 2;
    const c1y = centerY - CHILD_CHIP_H / 2 - GAP / 2;
    const c2y = centerY + CHILD_CHIP_H / 2 + GAP / 2;
    const contentTop = Math.min(centerY - CARD_H / 2, c1y - CHILD_CHIP_H / 2);
    const yShift = getOrgChartTopShift(contentTop);
    const svgW = col3X + CARD_W + ORG_FOREIGN_PAD + HPAD;
    const svgH = blockH + yShift + VPAD;

    return (
      <svg width={svgW} height={svgH} style={{ overflow: "visible", display: "block" }}>
        <g transform={`translate(0, ${yShift})`}>
        <foreignObject x={col1X} y={centerY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
          <Card {...parent} />
        </foreignObject>
        <line x1={col1X + CARD_W} y1={centerY} x2={col2X} y2={centerY} stroke={BORDER_GRAY} strokeWidth={1} />
        <foreignObject x={col2X} y={centerY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
          <Card {...self} isSelf />
        </foreignObject>
        <line x1={col2X + CARD_W} y1={centerY} x2={railRight} y2={centerY} stroke={BORDER_GRAY} strokeWidth={1} />
        <line x1={railRight} y1={c1y} x2={railRight} y2={c2y} stroke={BORDER_GRAY} strokeWidth={1} />
        {children[0] && (
          <>
            <line x1={railRight} y1={c1y} x2={col3X} y2={c1y} stroke={BORDER_GRAY} strokeWidth={1} />
            <foreignObject x={col3X} y={c1y - CHILD_CHIP_H / 2} width={CARD_W + 2} height={CHILD_CHIP_H + 2}>
              <ChildChip {...children[0]} />
            </foreignObject>
          </>
        )}
        {children[1] && (
          <>
            <line x1={railRight} y1={c2y} x2={col3X} y2={c2y} stroke={BORDER_GRAY} strokeWidth={1} />
            <foreignObject x={col3X} y={c2y - CHILD_CHIP_H / 2} width={CARD_W + 2} height={CHILD_CHIP_H + 2}>
              <ChildChip {...children[1]} />
            </foreignObject>
          </>
        )}
        </g>
      </svg>
    );
  }

  if (layoutType === "tall-tree") {
    const col2Items = [
      { type: "extra" as const, h: EXTRA_H },
      { type: "node" as const, h: CARD_H },
      ...stackNodes.map(() => ({ type: "node" as const, h: CARD_H })),
    ];
    const selfIdx = 1;
    const totalCol2H = col2Items.reduce((a, b) => a + b.h, 0) + GAP * (col2Items.length - 1);

    const col2Ys: number[] = [];
    let y = 0;
    col2Items.forEach((item) => {
      col2Ys.push(y + item.h / 2);
      y += item.h + GAP;
    });

    const selfCenterY = col2Ys[selfIdx];
    const childYs =
      children.length > 1
        ? children.map((_, i) => {
            const stackH = CHILD_CHIP_H * children.length + GAP * (children.length - 1);
            const top = selfCenterY - stackH / 2 + CHILD_CHIP_H / 2;
            return top + i * (CHILD_CHIP_H + GAP);
          })
        : [selfCenterY];
    const col3Top = childYs.length > 1 ? childYs[0] - CHILD_CHIP_H / 2 : 0;
    const col3Bottom = childYs.length > 1 ? childYs[childYs.length - 1] + CHILD_CHIP_H / 2 : totalCol2H;
    const contentTop = Math.min(0, col3Top);
    const yShift = getOrgChartTopShift(contentTop);
    const contentH = Math.max(totalCol2H, col3Bottom);
    const svgW = col3X + CARD_W + ORG_FOREIGN_PAD + HPAD;
    const svgH = contentH + yShift + VPAD;

    return (
      <svg width={svgW} height={svgH} style={{ overflow: "visible", display: "block" }}>
        <g transform={`translate(0, ${yShift})`}>
        <foreignObject x={col1X} y={selfCenterY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
          <Card {...parent} />
        </foreignObject>
        <line x1={col1X + CARD_W} y1={selfCenterY} x2={railMid} y2={selfCenterY} stroke={BORDER_GRAY} strokeWidth={1} />
        <line
          x1={railMid}
          y1={col2Ys[0]}
          x2={railMid}
          y2={col2Ys[col2Ys.length - 1]}
          stroke={BORDER_GRAY}
          strokeWidth={1}
        />
        {col2Ys.map((cy, i) => (
          <line key={i} x1={railMid} y1={cy} x2={col2X} y2={cy} stroke={BORDER_GRAY} strokeWidth={1} />
        ))}
        <foreignObject x={col2X} y={0} width={CARD_W + 2} height={EXTRA_H + 2}>
          <ExtraBox label={extraAbove} />
        </foreignObject>
        <foreignObject x={col2X} y={col2Ys[selfIdx] - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
          <Card {...self} isSelf />
        </foreignObject>
        {stackNodes.map((node, i) => (
          <foreignObject
            key={`${node.id}-${i}`}
            x={col2X}
            y={col2Ys[selfIdx + 1 + i] - CARD_H / 2}
            width={CARD_W + 2}
            height={CARD_H + 2}
          >
            <Card {...node} />
          </foreignObject>
        ))}
        {children.length > 0 && (
          <>
            <line x1={col2X + CARD_W} y1={selfCenterY} x2={railRight} y2={selfCenterY} stroke={BORDER_GRAY} strokeWidth={1} />
            {children.length > 1 && (
              <line
                x1={railRight}
                y1={childYs[0]}
                x2={railRight}
                y2={childYs[childYs.length - 1]}
                stroke={BORDER_GRAY}
                strokeWidth={1}
              />
            )}
            {children.map((child, i) => (
              <g key={`${child.id}-${i}`}>
                <line x1={railRight} y1={childYs[i]} x2={col3X} y2={childYs[i]} stroke={BORDER_GRAY} strokeWidth={1} />
                <foreignObject x={col3X} y={childYs[i] - CHILD_CHIP_H / 2} width={CARD_W + 2} height={CHILD_CHIP_H + 2}>
                  <ChildChip {...child} />
                </foreignObject>
              </g>
            ))}
          </>
        )}
        </g>
      </svg>
    );
  }

  // tree — 상위 → (외 N명 / 나 / 형제) → 하위
  const col2Items = showExtra
    ? [
        { type: "extra" as const, h: EXTRA_H },
        { type: "node" as const, h: CARD_H },
        { type: "node" as const, h: CARD_H },
      ]
    : [
        { type: "node" as const, h: CARD_H },
        { type: "node" as const, h: CARD_H },
      ];
  const selfIdx = showExtra ? 1 : 0;
  const siblingIdx = showExtra ? 2 : 1;
  const totalCol2H = col2Items.reduce((a, b) => a + b.h, 0) + GAP * (col2Items.length - 1);

  const col2Ys: number[] = [];
  let y = 0;
  col2Items.forEach((item) => {
    col2Ys.push(y + item.h / 2);
    y += item.h + GAP;
  });

  const selfCenterY = col2Ys[selfIdx];
  const childYs =
    children.length > 1
      ? (() => {
          const stackH = CHILD_CHIP_H * children.length + GAP * (children.length - 1);
          const top = selfCenterY - stackH / 2 + CHILD_CHIP_H / 2;
          return children.map((_, i) => top + i * (CHILD_CHIP_H + GAP));
        })()
      : children.length === 1
        ? [selfCenterY]
        : [];
  const col3Bottom = childYs.length > 0 ? childYs[childYs.length - 1] + CHILD_CHIP_H / 2 : 0;
  const col3Top = childYs.length > 0 ? childYs[0] - CHILD_CHIP_H / 2 : 0;
  const contentTop = Math.min(0, col3Top);
  const yShift = getOrgChartTopShift(contentTop);
  const contentH = Math.max(totalCol2H, col3Bottom);
  const svgW = col3X + CARD_W + ORG_FOREIGN_PAD + HPAD;
  const svgH = contentH + yShift + VPAD;

  return (
    <svg width={svgW} height={svgH} style={{ overflow: "visible", display: "block" }}>
      <g transform={`translate(0, ${yShift})`}>
      <foreignObject x={col1X} y={selfCenterY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
        <Card {...parent} />
      </foreignObject>
      <line x1={col1X + CARD_W} y1={selfCenterY} x2={railMid} y2={selfCenterY} stroke={BORDER_GRAY} strokeWidth={1} />
      <line
        x1={railMid}
        y1={col2Ys[0]}
        x2={railMid}
        y2={col2Ys[col2Ys.length - 1]}
        stroke={BORDER_GRAY}
        strokeWidth={1}
      />
      {col2Ys.map((cy, i) => (
        <line key={i} x1={railMid} y1={cy} x2={col2X} y2={cy} stroke={BORDER_GRAY} strokeWidth={1} />
      ))}
      {showExtra && (
        <foreignObject x={col2X} y={0} width={CARD_W + 2} height={EXTRA_H + 2}>
          <ExtraBox label={extraAbove} />
        </foreignObject>
      )}
      <foreignObject x={col2X} y={col2Ys[selfIdx] - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
        <Card {...self} isSelf />
      </foreignObject>
      <foreignObject x={col2X} y={col2Ys[siblingIdx] - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
        <Card {...sibling} />
      </foreignObject>
      {children.length > 1 && (
        <>
          <line x1={col2X + CARD_W} y1={selfCenterY} x2={railRight} y2={selfCenterY} stroke={BORDER_GRAY} strokeWidth={1} />
          <line
            x1={railRight}
            y1={childYs[0]}
            x2={railRight}
            y2={childYs[childYs.length - 1]}
            stroke={BORDER_GRAY}
            strokeWidth={1}
          />
          {children.map((child, i) => (
            <g key={`${child.id}-${i}`}>
              <line x1={railRight} y1={childYs[i]} x2={col3X} y2={childYs[i]} stroke={BORDER_GRAY} strokeWidth={1} />
              <foreignObject x={col3X} y={childYs[i] - CHILD_CHIP_H / 2} width={CARD_W + 2} height={CHILD_CHIP_H + 2}>
                <ChildChip {...child} />
              </foreignObject>
            </g>
          ))}
        </>
      )}
      {children.length === 1 && (
        <>
          <line x1={col2X + CARD_W} y1={selfCenterY} x2={col3X} y2={selfCenterY} stroke={BORDER_GRAY} strokeWidth={1} />
          <foreignObject x={col3X} y={selfCenterY - CHILD_CHIP_H / 2} width={CARD_W + 2} height={CHILD_CHIP_H + 2}>
            <ChildChip {...children[0]} />
          </foreignObject>
        </>
      )}
      </g>
    </svg>
  );
}

function OrgChart({ memberId, memberName }: OrgChartProps) {
  const member = getMemberById(memberId);
  const variant = buildOrgChartVariant(memberId, memberName, member);

  return (
    <div key={memberId} style={{ overflow: "visible", padding: "0 0 8px 0", display: "flex", justifyContent: "center", width: "100%" }}>
      <OrgChartSvg {...variant} />
    </div>
  );
}

// ─────────────────────────────────────────────
// MemberTable
// ─────────────────────────────────────────────

export const members = [
  { id: 1,  no: "N26431021", loginId: "hmc0810",      name: "한미채", type: "일반",  regDate: "2026-06-08", status: "정상", rank: "멤버",  grade: "멤버",  phone: "010-0000-0000", ssn: "701129-2000...", region: "서울 강남" },
  { id: 2,  no: "N26482827", loginId: "kr7841",        name: "황기봉", type: "일반",  regDate: "2026-05-14", status: "정상", rank: "멤버",  grade: "멤버",  phone: "010-1111-2222", ssn: "530419-2000...", region: "상주 마공" },
  { id: 3,  no: "N26081224", loginId: "lsb8579",       name: "황찬하", type: "일반",  regDate: "2026-04-20", status: "정상", rank: "멤버",  grade: "멤버",  phone: "010-2222-3333", ssn: "470220-1000...", region: "부산 해운대" },
  { id: 4,  no: "N26614351", loginId: "Mjr2893",       name: "홍세라", type: "일반",  regDate: "2026-03-15", status: "정상", rank: "준회원", grade: "준회원", phone: "010-3333-4444", ssn: "650511-2000...", region: "경기 의정부" },
  { id: 5,  no: "N26455673", loginId: "ljh5891",       name: "김성남", type: "일반",  regDate: "2026-02-28", status: "정상", rank: "준회원", grade: "준회원", phone: "010-4444-5555", ssn: "601101-1000...", region: "서울 신릉" },
  { id: 6,  no: "N26414074", loginId: "hyunju7158",    name: "이숙련", type: "일반",  regDate: "2026-01-10", status: "정상", rank: "멤버",  grade: "멤버",  phone: "010-5555-6666", ssn: "960501-2000...", region: "서울 신릉" },
  { id: 7,  no: "N26783741", loginId: "yys0767",       name: "장은경", type: "일반",  regDate: "2025-12-05", status: "정상", rank: "멤버",  grade: "멤버",  phone: "010-6666-7777", ssn: "070427-4000...", region: "인천 부평" },
  { id: 8,  no: "N26648797", loginId: "n_myworld9722", name: "방지유", type: "일반",  regDate: "2025-11-22", status: "정상", rank: "준회원", grade: "준회원", phone: "010-7777-8888", ssn: "940802-2000...", region: "뉴시아04" },
  { id: 9,  no: "N26445001", loginId: "lky6000",       name: "엄진희", type: "소비자", regDate: "2025-10-18", status: "탈퇴", rank: "탈퇴자", grade: "멤버",  phone: "",             ssn: "999999-9999...", region: "광주 수완" },
  { id: 10, no: "N26950500", loginId: "Jkh3890",       name: "김소유", type: "일반",  regDate: "2025-09-30", status: "정상", rank: "멤버",  grade: "준회원", phone: "010-3641-3800", ssn: "701222-1000...", region: "광주 수완" },
  { id: 11, no: "N26905000", loginId: "pos3684",       name: "박옥순", type: "일반",  regDate: "2025-08-14", status: "정상", rank: "준회원", grade: "준회원", phone: "010-5551-3600", ssn: "550136-2000...", region: "경기 양주" },
  { id: 12, no: "N26403500", loginId: "Bcs0122",       name: "방옥순", type: "일반",  regDate: "2025-07-03", status: "정상", rank: "핀플",  grade: "핀플",  phone: "010-5493-9000", ssn: "990122-2000...", region: "시아이350" },
  { id: 13, no: "N26848528", loginId: "ijlee77",       name: "이인자", type: "소비자", regDate: "2025-06-20", status: "정상", rank: "멤버",  grade: "멤버",  phone: "010-3456-7890", ssn: "650620-2000...", region: "경기 성남" },
  { id: 14, no: "N26445650", loginId: "ksjung",        name: "정경선", type: "일반",  regDate: "2025-05-11", status: "정상", rank: "준회원", grade: "준회원", phone: "010-4567-8901", ssn: "720511-2000...", region: "서울 송파" },
  { id: 15, no: "N26521742", loginId: "gelee",         name: "이가은", type: "일반",  regDate: "2025-04-08", status: "정상", rank: "멤버",  grade: "멤버",  phone: "010-5678-9012", ssn: "880408-2000...", region: "대전 유성" },
  { id: 16, no: "N26683868", loginId: "mrshin",        name: "신미라", type: "일반",  regDate: "2025-03-25", status: "정상", rank: "멤버",  grade: "멤버",  phone: "010-6789-0123", ssn: "790325-2000...", region: "부산 사하" },
  { id: 17, no: "N26454707", loginId: "mskim",         name: "김묘신", type: "일반",  regDate: "2025-02-14", status: "정상", rank: "준회원", grade: "준회원", phone: "010-7890-1234", ssn: "660214-2000...", region: "울산 남구" },
];

type Member = (typeof members)[number];

function getMemberById(id: number): Member {
  return members.find((m) => m.id === id) ?? members[0];
}

function shiftOrgDate(dateStr: string, dayOffset: number) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

function buildOrgChartVariant(memberId: number, memberName: string, member: Member) {
  if (memberId === 1) {
    return {
      layoutType: "tree" as const,
      parent: {
        label: "상위",
        name: "고병도",
        id: 6,
        date: "2026-02-20",
        rank: "매니저",
        score: 72.63,
      },
      sibling: {
        label: "형제",
        name: "한숙자",
        id: 15,
        date: "2026-04-28",
        rank: "정회원",
        score: 0,
      },
      self: {
        label: "나",
        name: memberName,
        id: memberId,
        date: member.regDate,
        rank: "그린",
        score: 7.18,
      },
      extraAbove: "외 15명",
      children: [
        { name: "김성남", id: 5 },
        { name: getMemberById(6).name, id: 6 },
        { name: getMemberById(8).name, id: 8 },
        { name: getMemberById(10).name, id: 10 },
        { name: getMemberById(11).name, id: 11 },
      ],
      showExtra: true,
    };
  }

  if (memberId === 2) {
    const orgNode = (id: number, label: string): OrgNode => {
      const ref = getMemberById(id);
      return {
        label,
        name: ref.name,
        id: ref.id,
        date: ref.regDate,
        rank: ref.rank,
        score: ((ref.id * 2.1) % 40).toFixed(1),
      };
    };

    return {
      layoutType: "tall-tree" as const,
      parent: {
        label: "상위",
        name: "장은경",
        id: 7,
        date: "2025-11-01",
        rank: "디렉터",
        score: 58.2,
      },
      sibling: orgNode(1, "형제"),
      stackNodes: [orgNode(1, "형제"), orgNode(3, "형제"), orgNode(4, "형제"), orgNode(5, "형제")],
      self: {
        label: "나",
        name: memberName,
        id: memberId,
        date: member.regDate,
        rank: member.rank,
        score: 12.5,
      },
      extraAbove: "외 22명",
      children: [
        { name: getMemberById(6).name, id: 6 },
        { name: getMemberById(8).name, id: 8 },
      ],
      showExtra: true,
    };
  }

  const n = members.length;
  const pick = (offset: number) => members[(memberId * 3 + offset) % n];
  const layoutType = (["tree", "linear", "fork"] as const)[memberId % 3];

  const parentRanks = ["매니저", "이사", "디렉터", "실버", "골드", "퍼플"];
  const orgRanks = ["정회원", "그린", "골드", "준회원", "핀플", "멤버", "일반회원"];

  const parentRef = pick(2);
  const siblingRef = pick(5);
  const childRef = pick(7);
  const child2Ref = pick(9);

  const parent = {
    label: "상위",
    name: parentRef.name,
    id: parentRef.id % 100,
    date: shiftOrgDate(parentRef.regDate, -20 - (memberId % 40)),
    rank: parentRanks[memberId % parentRanks.length],
    score: (38 + (memberId * 5.17) % 58).toFixed(2),
  };
  const sibling = {
    label: memberId % 4 === 0 ? "동료" : "형제",
    name: siblingRef.name,
    id: siblingRef.id % 100,
    date: shiftOrgDate(siblingRef.regDate, memberId % 12),
    rank: orgRanks[(memberId + 1) % orgRanks.length],
    score: ((memberId * 1.9) % 28).toFixed(1),
  };
  const self = {
    label: "나",
    name: memberName,
    id: memberId % 100,
    date: member.regDate,
    rank: member.rank,
    score: ((memberId * 3.7) % 99 + 1).toFixed(2),
  };

  const children =
    layoutType === "fork"
      ? [
          { name: childRef.name, id: childRef.id % 100 },
          { name: child2Ref.name, id: child2Ref.id % 100 },
        ]
      : [{ name: childRef.name, id: childRef.id % 100 }];

  return {
    layoutType,
    parent,
    sibling,
    self,
    extraAbove: `외 ${6 + (memberId % 19)}명`,
    children,
    showExtra: layoutType === "tree" && memberId % 2 === 0,
  };
}

const columns = [
  { key: "id",      label: "No",       width: 36 },
  { key: "no",      label: "회원번호",  width: 96 },
  { key: "loginId", label: "아이디",   width: 100 },
  { key: "name",    label: "이름",     width: 54 },
  { key: "type",    label: "회원구분",  width: 62 },
  { key: "regDate", label: "등록일자",  width: 84 },
  { key: "status",  label: "상태명",   width: 56 },
  { key: "rank",    label: "직급명",   width: 54 },
  { key: "grade",   label: "등급명",   width: 54 },
  { key: "phone",   label: "핸드폰",   width: 108 },
  { key: "ssn",     label: "주민등록번호", width: 108 },
  { key: "region",  label: "센티명",   width: 84 },
];

interface MemberTableProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function MemberTable({ selectedId, onSelect }: MemberTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  const tableViewRef = useRef<HTMLDivElement>(null);
  const tableInnerRef = useRef<HTMLDivElement>(null);
  const hScrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startX: 0, scrollLeft: 0 });

  function syncTableOffset(scrollLeft: number) {
    if (tableInnerRef.current) {
      tableInnerRef.current.style.transform = `translateX(-${scrollLeft}px)`;
    }
  }

  function syncHScroll() {
    syncTableOffset(hScrollRef.current?.scrollLeft ?? 0);
  }

  function onHScrollMouseDown(e: React.MouseEvent) {
    dragState.current = { dragging: true, startX: e.clientX, scrollLeft: hScrollRef.current?.scrollLeft ?? 0 };
  }
  function onHScrollMouseMove(e: React.MouseEvent) {
    if (!dragState.current.dragging || !hScrollRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragState.current.startX;
    hScrollRef.current.scrollLeft = dragState.current.scrollLeft - dx;
    syncHScroll();
  }
  function onHScrollMouseUp() { dragState.current.dragging = false; }
  function onHScrollMouseLeave() { dragState.current.dragging = false; }

  const filtered = members.filter(
    (m) => m.name.includes(search) || m.no.includes(search) || m.loginId.includes(search)
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = (a as any)[sortKey] ?? "";
        const bv = (b as any)[sortKey] ?? "";
        return sortDir === "asc" ? String(av).localeCompare(String(bv), "ko") : String(bv).localeCompare(String(av), "ko");
      })
    : filtered;

  const totalPages = Math.max(1, Math.ceil(sorted.length / MEMBER_LIST_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice(
    (currentPage - 1) * MEMBER_LIST_PAGE_SIZE,
    currentPage * MEMBER_LIST_PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, sortKey, sortDir]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function toggleAll() {
    const pageIds = paged.map((m) => m.id);
    const allPageChecked = pageIds.length > 0 && pageIds.every((id) => checked.has(id));
    setChecked((prev) => {
      const next = new Set(prev);
      if (allPageChecked) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function toggleOne(id: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function SortIcon({ col }: { col: string }) {
    if (sortKey !== col) return <ChevronsUpDown size={11} style={{ color: "var(--sort-icon-muted)", flexShrink: 0 }} />;
    return sortDir === "asc"
      ? <ChevronUp size={11} style={{ color: "var(--accent-primary)", flexShrink: 0 }} />
      : <ChevronDown size={11} style={{ color: "var(--accent-primary)", flexShrink: 0 }} />;
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--surface-panel)", width: "100%", maxWidth: MEMBER_LIST_MAX_WIDTH }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-2 py-2 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="flex items-center gap-1.5 rounded px-2 py-1.5 min-w-0"
          style={{
            background: "var(--surface-toolbar)",
            border: "1px solid var(--border)",
            flex: 1,
            maxWidth: 168,
          }}
        >
          <Search size={13} style={{ color: "var(--muted-foreground)" }} />
          <input
            className="bg-transparent outline-none flex-1"
            placeholder="이름 또는 회원번호 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: "12px", color: "var(--foreground)" }}
          />
        </div>
        <span className="shrink-0 whitespace-nowrap" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
          총 <strong style={{ color: "var(--foreground)" }}>{sorted.length}</strong>명
        </span>
      </div>

      {/* Table → 페이지네이션 → 가로 스크롤(맨 아래) */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div
          ref={tableViewRef}
          className="shrink-0 overflow-x-hidden"
        >
          <div ref={tableInnerRef} style={{ width: MEMBER_LIST_MAX_WIDTH }}>
          <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 36 }} />
            {columns.map((c) => <col key={c.key} style={{ width: c.width }} />)}
          </colgroup>
          <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <tr style={{ background: "var(--surface-table-header)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ width: 36, padding: "6px 5px", textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={paged.length > 0 && paged.every((m) => checked.has(m.id))}
                  onChange={toggleAll}
                  style={{ accentColor: "var(--accent-primary)", cursor: "pointer" }}
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    padding: "6px 5px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: sortKey === col.key ? "var(--accent-primary)" : "var(--text-muted)",
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((member) => {
              const isSelected = selectedId === member.id;
              const isChecked = checked.has(member.id);
              const cellBase: React.CSSProperties = {
                padding: "5px 5px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              };
              return (
                <tr
                  key={member.id}
                  onClick={() => onSelect(member.id)}
                  className={`member-table-row${isSelected ? " is-selected" : isChecked ? " is-checked" : ""}`}
                >
                  <td style={{ padding: "5px 5px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleOne(member.id)} style={{ accentColor: "var(--accent-primary)", cursor: "pointer" }} />
                  </td>
                  <td style={{ ...cellBase, fontSize: 12, color: "var(--text-subtle)" }}>{member.id}</td>
                  <td style={{ ...cellBase, fontSize: 12, fontFamily: "monospace", color: isSelected ? "var(--accent-primary)" : "var(--text-body)", fontWeight: isSelected ? 600 : 400 }}>{member.no}</td>
                  <td style={{ ...cellBase, fontSize: 12, color: "var(--text-secondary)" }}>{member.loginId}</td>
                  <td style={{ ...cellBase, fontSize: 12, color: isSelected ? "var(--accent-primary)" : "var(--text-body)", fontWeight: isSelected ? 600 : 500 }}>{member.name}</td>
                  <td style={{ ...cellBase }}>
                    <span style={{ fontSize: 12, padding: "2px 7px", borderRadius: 4, background: member.type === "소비자" ? "var(--badge-type-consumer-bg)" : "var(--badge-type-general-bg)", color: member.type === "소비자" ? "var(--badge-type-consumer-fg)" : "var(--badge-type-general-fg)" }}>{member.type}</span>
                  </td>
                  <td style={{ ...cellBase, fontSize: 12, color: "var(--text-muted)" }}>{member.regDate}</td>
                  <td style={{ ...cellBase }}>
                    <span style={{ fontSize: 12, padding: "2px 7px", borderRadius: 4, background: member.status === "탈퇴" ? "var(--badge-status-withdraw-bg)" : "var(--badge-status-active-bg)", color: member.status === "탈퇴" ? "var(--badge-status-withdraw-fg)" : "var(--badge-status-active-fg)" }}>{member.status}</span>
                  </td>
                  <td style={{ ...cellBase, fontSize: 12, color: "var(--text-secondary)" }}>{member.rank}</td>
                  <td style={{ ...cellBase, fontSize: 12, color: "var(--text-secondary)" }}>{member.grade}</td>
                  <td style={{ ...cellBase, fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>{member.phone}</td>
                  <td style={{ ...cellBase, fontSize: 12, color: "var(--text-subtle)", fontFamily: "monospace" }}>{member.ssn}</td>
                  <td style={{ ...cellBase, fontSize: 12, color: "var(--text-secondary)" }}>{member.region}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
          </div>
        </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-center gap-1 px-3 shrink-0"
          style={{ background: "var(--surface-panel)", paddingTop: 6, paddingBottom: 6, marginTop: 12, marginBottom: 6 }}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded transition-colors"
            style={{
              width: 24,
              height: 24,
              fontSize: 16,
              lineHeight: 1,
              border: "1px solid var(--border)",
              background: "var(--surface-button-muted)",
              color: currentPage === 1 ? "var(--text-subtle)" : "var(--text-body)",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className="rounded transition-colors"
                style={{
                  minWidth: 24,
                  height: 24,
                  padding: "0 6px",
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  border: isActive ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                  background: isActive ? "var(--accent-light)" : "var(--surface-button-muted)",
                  color: isActive ? "var(--accent-primary)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded transition-colors"
            style={{
              width: 24,
              height: 24,
              fontSize: 16,
              lineHeight: 1,
              border: "1px solid var(--border)",
              background: "var(--surface-button-muted)",
              color: currentPage === totalPages ? "var(--text-subtle)" : "var(--text-body)",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            ›
          </button>
        </div>
      )}

        <div className="flex-1 min-h-0 shrink" aria-hidden />

        <div
          ref={hScrollRef}
          className="overflow-x-auto shrink-0"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "var(--scrollbar-thumb) transparent",
            cursor: "grab",
            borderTop: totalPages > 1 ? "none" : "1px solid var(--border)",
            background: "var(--surface-panel)",
          }}
          onScroll={syncHScroll}
          onMouseDown={onHScrollMouseDown}
          onMouseMove={onHScrollMouseMove}
          onMouseUp={onHScrollMouseUp}
          onMouseLeave={onHScrollMouseLeave}
        >
          <div style={{ width: MEMBER_LIST_MAX_WIDTH, height: 1 }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Detail split panel (주문서내역 · 수당내역 공통)
// ─────────────────────────────────────────────

type SplitTableColumn = { key: string; label: string; width: number };

function SplitTableBlock({
  columns,
  rows = [],
}: {
  columns: SplitTableColumn[];
  rows?: Record<string, string | number>[];
}) {
  const checkboxWidth = 36;
  const columnsWeight = columns.reduce((sum, col) => sum + col.width, 0);
  const totalWeight = checkboxWidth + columnsWeight;

  const cellStyle: React.CSSProperties = {
    padding: "5px 5px",
    fontSize: 12,
    color: "var(--text-body)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full" style={{ border: "1px solid var(--border)", background: "var(--surface-panel)" }}>
      <div className="flex-1 min-h-0 w-full overflow-auto">
        <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: `${(checkboxWidth / totalWeight) * 100}%` }} />
            {columns.map((col) => (
              <col key={col.key} style={{ width: `${(col.width / totalWeight) * 100}%` }} />
            ))}
          </colgroup>
          <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
            <tr style={{ background: "var(--surface-table-header)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "6px 5px", textAlign: "center" }}>
                <input type="checkbox" readOnly style={{ accentColor: "var(--accent-primary)", cursor: "pointer" }} />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: "6px 5px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    background: "var(--surface-table-header)",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="member-table-row">
                <td style={{ ...cellStyle, textAlign: "center" }}>
                  <input type="checkbox" readOnly style={{ accentColor: "var(--accent-primary)", cursor: "pointer" }} />
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      ...cellStyle,
                      fontFamily: ["memberNo", "providerNo", "allowanceTypeNo", "deductNo", "orderNo", "bundleNo", "productCode", "uniqueNo"].includes(col.key)
                        ? "monospace"
                        : undefined,
                      color: ["memberNo", "memberName", "recipient", "orderNo"].includes(col.key)
                        ? "var(--accent-primary)"
                        : cellStyle.color,
                      fontWeight: ["memberName", "recipient"].includes(col.key) ? 600 : 400,
                    }}
                  >
                    {row[col.key] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetailSplitPanelView({
  topColumns,
  bottomColumns,
  topRows,
  bottomRows,
}: {
  topColumns: SplitTableColumn[];
  bottomColumns: SplitTableColumn[];
  topRows?: Record<string, string | number>[];
  bottomRows?: Record<string, string | number>[];
}) {
  return (
    <div
      className="flex flex-col h-full min-h-0 w-full overflow-hidden"
      style={{ background: "var(--surface-page)", padding: 8 }}
    >
      <button
        type="button"
        className="flex items-center gap-1.5 shrink-0 self-start mb-1.5 rounded transition-colors"
        style={{
          fontSize: 13,
          color: "var(--text-body)",
          padding: "4px 8px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <RefreshCw size={13} style={{ color: "var(--muted-foreground)" }} />
        새로고침
      </button>

      <div className="flex-1 min-h-0 flex flex-col gap-0 overflow-hidden">
        <SplitTableBlock columns={topColumns} rows={topRows} />
        <div style={{ height: 6, background: "var(--border)", flexShrink: 0 }} />
        <SplitTableBlock columns={bottomColumns} rows={bottomRows} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// OrderHistoryView
// ─────────────────────────────────────────────

const orderHeaderColumns: SplitTableColumn[] = [
  { key: "no", label: "No", width: 36 },
  { key: "deductNo", label: "공제번호", width: 88 },
  { key: "deductStatus", label: "공제신고상태명", width: 100 },
  { key: "orderNo", label: "주문서번호", width: 96 },
  { key: "orderDate", label: "주문일자", width: 84 },
  { key: "allowanceDate", label: "수당적용일자", width: 92 },
  { key: "plan", label: "플랜명", width: 72 },
  { key: "purchaseType", label: "구매구분명", width: 80 },
  { key: "orderStatus", label: "주문서상태명", width: 88 },
  { key: "cash", label: "현금", width: 64 },
  { key: "online", label: "온라인", width: 64 },
  { key: "card", label: "카드", width: 64 },
  { key: "pointTotal", label: "포인트합", width: 72 },
  { key: "supplyTotal", label: "공급가합", width: 72 },
  { key: "salesTotal", label: "매출금액합", width: 80 },
  { key: "recipient", label: "인수자명", width: 72 },
  { key: "note", label: "비고", width: 96 },
];

const orderLineColumns: SplitTableColumn[] = [
  { key: "no", label: "No", width: 36 },
  { key: "bundleNo", label: "묶음번호", width: 88 },
  { key: "orderStatus", label: "주문서상태", width: 80 },
  { key: "shipType", label: "발송구분", width: 72 },
  { key: "deliveryType", label: "배송구분", width: 72 },
  { key: "warehouse", label: "출고지역", width: 80 },
  { key: "shipDate", label: "출고예정일자", width: 92 },
  { key: "productCode", label: "상품코드", width: 88 },
  { key: "productName", label: "상품명", width: 120 },
  { key: "uniqueNo", label: "고유번호", width: 88 },
  { key: "price", label: "가격", width: 72 },
  { key: "qty", label: "수량", width: 56 },
];

function buildOrderSampleData(member: Member) {
  const headerRow = {
    no: 1,
    deductNo: "D202605001",
    deductStatus: "신고완료",
    orderNo: "O20260512001",
    orderDate: "2026-05-12",
    allowanceDate: "2026-06-01",
    plan: "기본플랜",
    purchaseType: "일반구매",
    orderStatus: "출고완료",
    cash: "0",
    online: "150,000",
    card: "320,000",
    pointTotal: "30,000",
    supplyTotal: "420,000",
    salesTotal: "500,000",
    recipient: member.name,
    note: member.region,
  };

  const lineRows = [
    {
      no: 1,
      bundleNo: "B20260512001",
      orderStatus: "출고완료",
      shipType: "택배",
      deliveryType: "일반배송",
      warehouse: "서울센터",
      shipDate: "2026-05-14",
      productCode: "P-VB-001",
      productName: "비타민 종합세트",
      uniqueNo: "U00018492",
      price: "280,000",
      qty: "1",
    },
    {
      no: 2,
      bundleNo: "B20260512001",
      orderStatus: "출고완료",
      shipType: "택배",
      deliveryType: "일반배송",
      warehouse: "서울센터",
      shipDate: "2026-05-14",
      productCode: "P-VB-012",
      productName: "오메가3 캡슐",
      uniqueNo: "U00018493",
      price: "220,000",
      qty: "1",
    },
  ];

  return { headerRows: [headerRow], lineRows };
}

function OrderHistoryView({ memberId }: { memberId: number }) {
  const member = getMemberById(memberId);
  const { headerRows, lineRows } = buildOrderSampleData(member);

  return (
    <DetailSplitPanelView
      topColumns={orderHeaderColumns}
      bottomColumns={orderLineColumns}
      topRows={headerRows}
      bottomRows={lineRows}
    />
  );
}

// ─────────────────────────────────────────────
// AllowanceHistoryView
// ─────────────────────────────────────────────

const allowanceHeaderColumns: SplitTableColumn[] = [
  { key: "no", label: "No", width: 36 },
  { key: "issueName", label: "수당발급명", width: 88 },
  { key: "post", label: "게시", width: 48 },
  { key: "payDate", label: "지급일자", width: 84 },
  { key: "memberNo", label: "회원번호", width: 96 },
  { key: "memberName", label: "회원명", width: 72 },
  { key: "occurrenceTotal", label: "발생총계", width: 72 },
  { key: "returnDeduct", label: "반품공제", width: 72 },
  { key: "otherDeduct", label: "기타공제", width: 72 },
  { key: "deductTotal", label: "공제합산", width: 72 },
  { key: "allowanceTotal", label: "수당합산", width: 72 },
  { key: "withdrawal", label: "인출", width: 56 },
  { key: "gift", label: "선물", width: 56 },
  { key: "productPurchase", label: "상품구매", width: 72 },
  { key: "points", label: "적립", width: 56 },
  { key: "fee", label: "수수료", width: 56 },
  { key: "balance", label: "Balance", width: 72 },
];

const allowanceLineColumns: SplitTableColumn[] = [
  { key: "no", label: "No", width: 36 },
  { key: "closeDate", label: "마감일자", width: 84 },
  { key: "payDate", label: "지급일자", width: 84 },
  { key: "memberNo", label: "회원번호", width: 96 },
  { key: "memberName", label: "회원명", width: 72 },
  { key: "providerNo", label: "제공자번호", width: 88 },
  { key: "providerName", label: "제공자명", width: 72 },
  { key: "allowanceTypeNo", label: "수당구분번호", width: 88 },
  { key: "allowanceTotal", label: "수당합산", width: 72 },
  { key: "memo", label: "메모", width: 96 },
  { key: "createdAt", label: "생성일시", width: 108 },
  { key: "createdBy", label: "생성자", width: 72 },
  { key: "name", label: "이름", width: 72 },
];

function buildAllowanceSampleData(member: Member) {
  const headerRow = {
    no: 1,
    issueName: "2026년 05월 수당",
    post: "게시",
    payDate: "2026-06-01",
    memberNo: member.no,
    memberName: member.name,
    occurrenceTotal: "1,250,000",
    returnDeduct: "50,000",
    otherDeduct: "10,000",
    deductTotal: "60,000",
    allowanceTotal: "1,190,000",
    withdrawal: "500,000",
    gift: "0",
    productPurchase: "200,000",
    points: "30,000",
    fee: "15,000",
    balance: "445,000",
  };

  const lineRows = [
    {
      no: 1,
      closeDate: "2026-05-31",
      payDate: "2026-06-01",
      memberNo: member.no,
      memberName: member.name,
      providerNo: "N26455673",
      providerName: "김성남",
      allowanceTypeNo: "A101",
      allowanceTotal: "680,000",
      memo: "직접판매 수당",
      createdAt: "2026-06-01 09:12",
      createdBy: "system",
      name: member.name,
    },
    {
      no: 2,
      closeDate: "2026-05-31",
      payDate: "2026-06-01",
      memberNo: member.no,
      memberName: member.name,
      providerNo: "N26414074",
      providerName: "이숙련",
      allowanceTypeNo: "A205",
      allowanceTotal: "510,000",
      memo: "후원 수당",
      createdAt: "2026-06-01 09:12",
      createdBy: "system",
      name: member.name,
    },
  ];

  return { headerRows: [headerRow], lineRows };
}

function AllowanceHistoryView({ memberId }: { memberId: number }) {
  const member = getMemberById(memberId);
  const { headerRows, lineRows } = buildAllowanceSampleData(member);

  return (
    <DetailSplitPanelView
      topColumns={allowanceHeaderColumns}
      bottomColumns={allowanceLineColumns}
      topRows={headerRows}
      bottomRows={lineRows}
    />
  );
}

// ─────────────────────────────────────────────
// MemberDetail
// ─────────────────────────────────────────────

function MemberTypeToggle({ type }: { type: "일반" | "소비자" }) {
  const [selected, setSelected] = useState<"일반" | "소비자">(type);
  useEffect(() => setSelected(type), [type]);
  return (
    <div
      className="flex items-center ml-1"
      style={{ background: "var(--brand-toggle-track)", borderRadius: 20, padding: 2, border: "1px solid var(--brand-light)" }}
    >
      {(["일반", "소비자"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setSelected(t)}
          style={{
            fontSize: "12px",
            padding: "2px 10px",
            borderRadius: 20,
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s",
            background: selected === t ? "var(--brand-primary)" : "transparent",
            color: selected === t ? "var(--on-accent)" : "var(--muted-foreground)",
            fontWeight: selected === t ? 600 : 400,
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function StatBento({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-3 rounded"
      style={{
        background: "var(--surface-toggle-track)",
        border: "1px solid var(--accent-light)",
        minWidth: 90,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: "monospace" }}>
        {value}
      </span>
      <span className="mt-0.5" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
        {label}
      </span>
    </div>
  );
}

function FormSection({ title, icon, subtitle, children, bodyPadding = "6px 12px 8px", clipBody = true, className = "" }: {
  title: string; icon: React.ReactNode; subtitle?: string; children: React.ReactNode; bodyPadding?: string; clipBody?: boolean; className?: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`rounded content-form-section ${className}`.trim()} style={{ background: "var(--surface-panel)", border: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 transition-all duration-150"
        style={{ cursor: "pointer", background: "transparent", borderBottom: open ? "1px solid var(--border)" : "none", paddingTop: 7, paddingBottom: 7 }}
      >
        <span className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: "var(--section-icon-bg)" }}>
          <span style={{ color: "var(--accent-primary)" }}>{icon}</span>
        </span>
        <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{title}</span>
        <div className="flex-1" />
        <ChevronDown
          size={12}
          style={{
            color: "var(--muted-foreground)",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        />
      </button>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.25s ease" }}>
        <div style={{ overflow: clipBody ? "hidden" : "visible" }}>
          <div className="content-form-body" style={{ padding: bodyPadding }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, placeholder, type = "text", full = false, mono = false }: {
  label: string; value?: string; placeholder?: string; type?: string; full?: boolean; mono?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block mb-1" style={{ fontSize: "12px", color: "var(--form-label-color)" }}>{label}</label>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full rounded px-2.5 py-2 text-sm outline-none transition-all duration-200"
        style={{
          background: "var(--input-background)",
          border: "none",
          color: "var(--foreground)",
          fontFamily: mono ? "monospace" : undefined,
        }}
        onFocus={(e) => {
          e.target.style.background = "var(--input-focus-bg)";
        }}
        onBlur={(e) => {
          e.target.style.background = "var(--input-background)";
        }}
      />
    </div>
  );
}

function GenderToggle() {
  const [selected, setSelected] = useState("남");
  return (
    <div>
      <label className="block mb-1.5" style={{ fontSize: "12px", color: "var(--form-label-color)" }}>성별</label>
      <div className="flex gap-2">
        {["남", "여"].map((g) => (
          <button
            key={g}
            onClick={() => setSelected(g)}
            className="px-4 py-2.5 rounded text-sm font-medium transition-all duration-200"
            style={{
              background: selected === g ? "var(--accent-gradient)" : "var(--input-background)",
              color: selected === g ? "var(--on-accent)" : "var(--muted-foreground)",
              border: selected === g ? "1px solid var(--accent-primary)" : "1px solid var(--border)",
            }}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}

function GenderToggleInline() {
  const [selected, setSelected] = useState("남");
  return (
    <div className="flex gap-2">
      {["남", "여"].map((g) => (
        <button
          key={g}
          onClick={() => setSelected(g)}
          className="rounded font-medium transition-all duration-200"
          style={{
            fontSize: 12,
            padding: "2px 12px",
            background: selected === g ? "var(--accent-gradient)" : "var(--input-background)",
            color: selected === g ? "var(--on-accent)" : "var(--muted-foreground)",
            border: selected === g ? "1px solid var(--accent-primary)" : "1px solid var(--border)",
          }}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

function MemberDetail({ memberId, listOpen, formColumnWidth }: { memberId: number; listOpen: boolean; formColumnWidth: number }) {
  const member = getMemberById(memberId);
  const detailContentWidth = getDetailContentWidth(formColumnWidth);
  const memberType = member.type === "소비자" ? "소비자" : "일반";

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: listOpen ? getDetailPanelWidth(formColumnWidth) : "100%",
        minWidth: listOpen ? getDetailPanelWidth(formColumnWidth) : 0,
        flexShrink: 0,
      }}
    >
      <div
        className="flex-1 content-scroll"
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          background: "var(--surface-page)",
          padding: DETAIL_PANEL_PAD,
        }}
      >
        <div
          key={member.id}
          style={{
            width: listOpen ? detailContentWidth : "100%",
            minWidth: listOpen ? detailContentWidth : 0,
            boxSizing: "border-box",
          }}
        >
        {/* Member Header Card */}
        <div
          className="rounded content-member-header p-1.5 mb-2"
          style={{ background: "var(--surface-panel)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center font-bold shrink-0"
              style={{ background: "var(--brand-gradient)", color: "var(--on-accent)", fontSize: 12 }}
            >
              {member.name.charAt(0)}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>{member.name} · {member.loginId}</span>
              <span style={{ width: 1, height: 14, background: "var(--border)", display: "inline-block" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-body)" }}>{member.no}</span>
              <MemberTypeToggle type={memberType} />
            </div>
          </div>
        </div>

        <div
          className="flex items-start"
          style={{
            width: "100%",
            gap: DETAIL_CONTENT_GAP,
            boxSizing: "border-box",
          }}
        >
        {/* 왼쪽 폼 — 최소 560px 유지, 넓으면 자동 확장 */}
        <div
          style={
            listOpen
              ? {
                  width: formColumnWidth,
                  minWidth: formColumnWidth,
                  flex: "0 0 auto",
                  flexShrink: 0,
                }
              : {
                  flex: "1 1 0",
                  minWidth: FORM_COLUMN_WIDTH_MIN,
                }
          }
        >

        {/* Login Info */}
        <FormSection title="로그인 사용정보" icon={<Shield size={12} />}>
          <table className="content-form-grid content-form-grid--6 content-form-grid--member" style={{ width: "100%", borderCollapse: "collapse" }}>
            <colgroup>
              <col className="col-label-1" />
              <col className="col-field-1" />
              <col className="col-label-2" />
              <col className="col-field-2" />
              <col className="col-label-3" />
              <col className="col-field-3" />
            </colgroup>
            <tbody>
              <tr>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: 500 }}>* 회원번호</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input type="text" defaultValue={member.no} className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)", fontFamily: "monospace" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: 500 }}>* 아이디</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
                  <input type="text" defaultValue={member.loginId} className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)", fontFamily: "monospace" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              <tr className="form-row-triple">
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>비밀번호</span>
                </td>
                <td style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input type="password" placeholder="변경 시에만 입력" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>보안 비밀번호</span>
                </td>
                <td style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input type="password" placeholder="····" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>전자메일주소</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
                  <input type="email" defaultValue={`${member.loginId}@email.com`} className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
            </tbody>
          </table>
        </FormSection>

        {/* 일반 회원정보 */}
        <FormSection title="일반 회원정보" subtitle="16개 항목" icon={<User size={12} />}>
          <table className="content-form-grid content-form-grid--6 content-form-grid--member" style={{ width: "100%", borderCollapse: "collapse" }}>
            <colgroup>
              <col className="col-label-1" />
              <col className="col-field-1" />
              <col className="col-label-2" />
              <col className="col-field-2" />
              <col className="col-label-3" />
              <col className="col-field-3" />
            </colgroup>
            <tbody>
              <tr>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: 500 }}>* 회원 등록일자</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input type="date" key={`reg-${member.id}`} defaultValue={member.regDate} className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>한글명</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
                  <input key={`name-${member.id}`} defaultValue={member.name} className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: 500 }}>* 고객 이름/성</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <div className="flex gap-2">
                    <input defaultValue="미채" className="flex-1 min-w-0 rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                    <input defaultValue="Mi-chae" className="flex-1 min-w-0 rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                  </div>
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>성</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
                  <input defaultValue="Han" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>Nick Name</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input placeholder="닉네임" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>Business Name</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
                  <input placeholder="사업자명" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>Legal Name</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input placeholder="법적 이름" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>생년월일</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
                  <input type="date" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>주민등록번호</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <div className="flex gap-1 items-center">
                    <input key={`ssn-${member.id}`} defaultValue={member.ssn} className="flex-1 rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                    <div className="relative" style={{ flexShrink: 0 }}>
                      <select defaultValue="여" className="rounded outline-none appearance-none" style={{ fontSize: 12, padding: "4px 28px 4px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }}>
                        <option value="남">남</option>
                        <option value="여">여</option>
                      </select>
                      <ChevronDown size={12} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
                    </div>
                    <button style={{ fontSize: 12, padding: "3px 8px", background: "var(--surface-button-muted)", color: "var(--accent-primary)", border: "1px solid var(--accent-border)", borderRadius: 4, whiteSpace: "nowrap" }}>✓ 실명인증</button>
                  </div>
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>EIN Number</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
                  <input placeholder="미국 사업자 번호" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>비자종류</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <div className="relative" style={{ display: "inline-block", width: "100%" }}>
                    <select className="w-full rounded outline-none appearance-none" style={{ fontSize: 12, padding: "4px 28px 4px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }}>
                      <option>() 내국인</option>
                      <option>F-2 거주</option>
                      <option>F-4 재외동포</option>
                      <option>F-6 결혼이민</option>
                    </select>
                    <ChevronDown size={12} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
                  </div>
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>체류기간 만료일자</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
                  <input type="date" placeholder="YYYY-MM-DD" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>주소지</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <div className="flex gap-2">
                    <input key={`addr-${member.id}`} defaultValue={member.region} className="flex-1 min-w-0 rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                    <button className="shrink-0" style={{ fontSize: 12, padding: "3px 12px", background: "var(--surface-button-muted)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: 4 }}>검색</button>
                  </div>
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>휴대폰번호</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
                  <input key={`phone-${member.id}`} defaultValue={member.phone} className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>우편번호</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input defaultValue="06236" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>연락처</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
                  <input defaultValue="02-3456-7890" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "top", paddingTop: 8 }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>메모</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "top", paddingTop: 8 }}>
                  <textarea
                    key={`memo-${member.id}`}
                    defaultValue={`${member.name} · ${member.rank} · ${member.grade} · ${member.region} (${member.status})`}
                    rows={3}
                    className="w-full rounded outline-none transition-all duration-200 resize-none"
                    style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }}
                    onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }}
                    onBlur={(e) => { e.target.style.background = "var(--input-background)"; }}
                  />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "top", paddingTop: 8 }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>세금신고번호</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "top", paddingTop: 8 }}>
                  <input defaultValue="220-81-12345" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
            </tbody>
          </table>
        </FormSection>

        {/* 거래은행 정보 */}
        <FormSection title="거래은행 정보" icon={<CreditCard size={12} />}>
          <table className="content-form-grid content-form-grid--6 content-form-grid--member content-form-grid--bank" style={{ width: "100%", borderCollapse: "collapse" }}>
            <colgroup>
              <col className="col-label-1" />
              <col className="col-field-1" />
              <col className="col-label-2" />
              <col className="col-field-2" />
              <col className="col-label-3" />
              <col className="col-field-3" />
            </colgroup>
            <tbody>
              <tr className="form-row-triple">
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>은행명</span>
                </td>
                <td style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input defaultValue="신한은행" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>계좌번호</span>
                </td>
                <td style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input defaultValue="110-234-567890" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>예금주</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
                  <input key={`holder-${member.id}`} defaultValue={member.name} className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>SwiftCode</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input defaultValue="SHBKKRSE" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>Branch Number</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
                  <input defaultValue="0234" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>은행통합 거래번호</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <div className="flex gap-1 items-center">
                    <input defaultValue="88012345" className="flex-1 min-w-0 rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                    <span className="shrink-0" style={{ fontSize: 12, padding: "3px 8px", background: "var(--badge-status-active-bg)", color: "var(--accent-primary)", border: "1px solid var(--accent-border)", borderRadius: 4, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      ✓ 인증완료
                    </span>
                  </div>
                </td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </FormSection>

        {/* 상위 회원과의 관계 + 소속 그룹 정보 */}
        <FormSection title="상위 회원과의 관계" icon={<Users size={12} />}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="shrink-0" style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: 500 }}>* 추천인</span>
              <input readOnly value="100012" className="rounded px-2 py-1 outline-none" style={{ fontSize: 12, width: 72, background: "var(--surface-input-readonly)", border: "none", color: "var(--foreground)", fontFamily: "monospace" }} />
              <input readOnly value="박민수" className="rounded px-2 py-1 outline-none" style={{ fontSize: 12, width: 60, background: "var(--surface-input-readonly)", border: "none", color: "var(--foreground)" }} />
              <span style={{ fontSize: 12, padding: "2px 8px", background: "var(--accent-light)", color: "var(--accent-primary)", border: "1px solid var(--accent-border)", borderRadius: 4, whiteSpace: "nowrap" }}>38명</span>
              <button className="rounded p-1 flex items-center justify-center" style={{ background: "var(--surface-button-muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
              <span className="shrink-0" style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: 500 }}>* 후원인</span>
              <input readOnly value="100008" className="rounded px-2 py-1 outline-none" style={{ fontSize: 12, width: 72, background: "var(--surface-input-readonly)", border: "none", color: "var(--foreground)", fontFamily: "monospace" }} />
              <input readOnly value="이정환" className="rounded px-2 py-1 outline-none" style={{ fontSize: 12, width: 60, background: "var(--surface-input-readonly)", border: "none", color: "var(--foreground)" }} />
              <span style={{ fontSize: 12, padding: "2px 8px", background: "var(--accent-light)", color: "var(--accent-primary)", border: "1px solid var(--accent-border)", borderRadius: 4, whiteSpace: "nowrap" }}>12명</span>
              <button className="rounded p-1 flex items-center justify-center" style={{ background: "var(--surface-button-muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </div>
            <div style={{ height: 1, background: "var(--border)" }} />
            <div className="flex items-center gap-4 flex-wrap">
              <span className="shrink-0" style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 600 }}>소속 그룹 정보</span>
              <span className="shrink-0" style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: 500 }}>* 센터</span>
              <div className="relative" style={{ flex: "1 1 140px", minWidth: 120, maxWidth: 200 }}>
                <select
                  className="w-full rounded py-1.5 text-sm outline-none appearance-none"
                  style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)", paddingLeft: 10, paddingRight: 36, fontSize: 13 }}
                >
                  <option>본사</option>
                  <option>광주 수완</option>
                  <option>서울 강남</option>
                  <option>부산 해운대</option>
                </select>
                <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ width: 32 }}>
                  <ChevronDown size={13} style={{ color: "var(--muted-foreground)" }} />
                </div>
              </div>
              <span className="shrink-0" style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>직급</span>
              <div className="relative" style={{ flex: "1 1 140px", minWidth: 120, maxWidth: 200 }}>
                <select
                  className="w-full rounded py-1.5 text-sm outline-none appearance-none"
                  style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)", paddingLeft: 10, paddingRight: 36, fontSize: 13 }}
                >
                  <option>다이아몬드</option>
                  <option>플래티넘</option>
                  <option>골드</option>
                  <option>실버</option>
                </select>
                <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ width: 32 }}>
                  <ChevronDown size={13} style={{ color: "var(--muted-foreground)" }} />
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        {/* 기타 회원정보 */}
        <FormSection title="기타 회원정보" icon={<Info size={12} />}>
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { label: "SMS 수신동의", checked: true },
              { label: "EMail 수신동의", checked: true },
              { label: "신분증 사본등록", checked: false },
              { label: "신분증 등록 신청서 접수", checked: false },
            ].map((item) => (
              <label key={item.label} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={item.checked}
                  style={{ accentColor: "var(--accent-primary)", width: 14, height: 14, cursor: "pointer" }}
                />
                <span style={{ fontSize: 12, color: "var(--foreground)" }}>{item.label}</span>
              </label>
            ))}
          </div>
        </FormSection>

        {/* 등록/저장 버튼 */}
        <div className="flex justify-end pt-2 pb-6">
          <button
            className="rounded font-medium transition-all duration-200"
            style={{ fontSize: 12, padding: "7px 13px", background: "var(--save-btn-bg, var(--accent-gradient))", color: "var(--on-accent)", border: "none" }}
          >
            등록/저장
          </button>
        </div>
        </div>{/* 왼쪽 폼 끝 */}

        {/* 오른쪽: 조직도 카드 — 네임카드·폼과 동일한 행 너비 안에 고정 */}
        <div style={{ flex: `0 0 ${ORG_CHART_WIDTH}px`, width: ORG_CHART_WIDTH, overflow: "hidden" }}>
          <FormSection title="조직도" icon={<GitFork size={12} />} className="content-form-section--org" bodyPadding={`16px ${ORG_CHART_SIDE_PAD}px 12px`} clipBody={true}>
            <OrgChart memberId={member.id} memberName={member.name} />
          </FormSection>
        </div>

        </div>{/* flex row 끝 */}
        </div>{/* content-detail-align 끝 */}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TopNav
// ─────────────────────────────────────────────

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

interface PageHistoryItem {
  id: string;
  screen: string;
  memberId: number;
  memberNo: string;
  memberName: string;
}

function makePageId(screen: string, memberId: number) {
  return `${screen}-${memberId}`;
}

function toHistoryItem(screen: string, memberId: number): PageHistoryItem | null {
  const member = members.find((m) => m.id === memberId);
  if (!member) return null;
  return {
    id: makePageId(screen, memberId),
    screen,
    memberId,
    memberNo: member.no,
    memberName: member.name,
  };
}

interface HistoryItemButtonProps {
  item: PageHistoryItem;
  isActive: boolean;
  onSelect: (item: PageHistoryItem) => void;
  onRemove?: (id: string) => void;
}

function HistoryItemButton({ item, isActive, onSelect, onRemove }: HistoryItemButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="w-full text-left rounded transition-all duration-150 group"
      style={{
        padding: "7px 8px",
        marginBottom: 4,
        background: isActive ? "var(--surface-row-selected)" : "transparent",
        border: isActive ? "1px solid var(--accent-border)" : "1px solid transparent",
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <div
            style={{
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--accent-primary)" : "var(--text-body)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.screen}
          </div>
          <div
            style={{
              fontSize: 12,
              fontFamily: "monospace",
              color: "var(--text-muted)",
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.memberNo}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-subtle)",
              marginTop: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.memberName}
          </div>
        </div>
        {onRemove && (
          <span
            role="presentation"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="shrink-0 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
            style={{ fontSize: 16, lineHeight: 1, color: "var(--text-muted)", padding: "0 2px" }}
          >
            ×
          </span>
        )}
      </div>
    </button>
  );
}

interface RecentPinRailProps {
  expanded: boolean;
  onToggleExpand: () => void;
  pinned: PageHistoryItem[];
  recent: PageHistoryItem[];
  activeId: string;
  onSelect: (item: PageHistoryItem) => void;
  onPinCurrent: () => void;
  onUnpin: (id: string) => void;
}

function RailTooltip({ label, align = "left" }: { label: string; align?: "left" | "right" }) {
  return (
    <span
      className={`absolute top-1/2 -translate-y-1/2 px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 ${
        align === "right" ? "right-full mr-1.5" : "left-12"
      }`}
      style={{ background: "var(--tooltip-bg)", color: "var(--tooltip-fg)", fontSize: "12px" }}
    >
      {label}
    </span>
  );
}

function RecentPinRail({
  expanded,
  onToggleExpand,
  pinned,
  recent,
  activeId,
  onSelect,
  onPinCurrent,
  onUnpin,
}: RecentPinRailProps) {
  const width = expanded ? HISTORY_RAIL_EXPANDED : HISTORY_RAIL_COLLAPSED;

  if (!expanded) {
    return (
      <div
        className="recent-pin-rail flex flex-col items-center py-3 gap-3 shrink-0"
        style={{
          width,
          minWidth: width,
          height: "100%",
          background: "var(--surface-panel)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        <button
          type="button"
          onClick={onToggleExpand}
          className="w-8 h-8 rounded flex items-center justify-center transition-colors"
          style={{ background: "var(--surface-button-muted)", border: "1px solid var(--border)" }}
        >
          <ChevronLeft size={14} style={{ color: "var(--text-muted)" }} />
        </button>
        <button
          type="button"
          onClick={onPinCurrent}
          className="group relative w-8 h-8 rounded flex items-center justify-center transition-colors"
          style={{ background: "var(--surface-button-muted)", border: "1px solid var(--border)" }}
        >
          <Pin size={13} style={{ color: "var(--accent-primary)" }} />
          <RailTooltip label="현재 화면 고정" align="right" />
        </button>
        <div style={{ width: 20, height: 1, background: "var(--border)" }} />
        <button
          type="button"
          onClick={onToggleExpand}
          className="group relative flex flex-col items-center gap-1.5 rounded p-1 transition-colors hover:opacity-80"
        >
          <Pin size={12} style={{ color: "var(--text-subtle)" }} />
          {pinned.length > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--accent-primary)",
                background: "var(--accent-light)",
                borderRadius: 8,
                padding: "1px 5px",
                minWidth: 16,
                textAlign: "center",
              }}
            >
              {pinned.length}
            </span>
          )}
          <RailTooltip label="고정" align="right" />
        </button>
        <button
          type="button"
          onClick={onToggleExpand}
          className="group relative flex flex-col items-center gap-1.5 rounded p-1 transition-colors hover:opacity-80"
        >
          <Clock size={12} style={{ color: "var(--text-subtle)" }} />
          {recent.length > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                background: "var(--surface-button-muted)",
                borderRadius: 8,
                padding: "1px 5px",
                minWidth: 16,
                textAlign: "center",
              }}
            >
              {recent.length}
            </span>
          )}
          <RailTooltip label="최근" align="right" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="recent-pin-rail flex flex-col shrink-0"
      style={{
        width,
        minWidth: width,
        height: "100%",
        background: "var(--surface-panel)",
        borderLeft: "1px solid var(--border)",
      }}
    >
      <div
        className="flex items-center justify-between px-3 shrink-0"
        style={{ height: 40, borderBottom: "1px solid var(--border)" }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-body)" }}>방문 기록</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPinCurrent}
            className="group relative w-7 h-7 rounded flex items-center justify-center transition-colors"
            style={{ background: "var(--accent-light)", border: "1px solid var(--accent-border)" }}
          >
            <Pin size={12} style={{ color: "var(--accent-primary)" }} />
            <RailTooltip label="현재 화면 고정" align="right" />
          </button>
          <button
            type="button"
            onClick={onToggleExpand}
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ background: "var(--surface-button-muted)", border: "1px solid var(--border)" }}
          >
            <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2" style={{ scrollbarWidth: "thin" }}>
        <div className="flex items-center gap-1.5 px-1 mb-1.5">
          <Pin size={11} style={{ color: "var(--accent-primary)" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>고정</span>
        </div>
        {pinned.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--text-subtle)", padding: "4px 8px 12px" }}>
            고정 버튼으로 현재 화면을 고정하세요
          </p>
        ) : (
          pinned.map((item) => (
            <HistoryItemButton
              key={item.id}
              item={item}
              isActive={item.id === activeId}
              onSelect={onSelect}
              onRemove={onUnpin}
            />
          ))
        )}

        <div style={{ height: 1, background: "var(--border)", margin: "8px 4px 10px" }} />

        <div className="flex items-center gap-1.5 px-1 mb-1.5">
          <Clock size={11} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>최근</span>
        </div>
        {recent.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--text-subtle)", padding: "4px 8px" }}>
            방문한 화면이 여기에 표시됩니다
          </p>
        ) : (
          recent.map((item) => (
            <HistoryItemButton
              key={item.id}
              item={item}
              isActive={item.id === activeId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface TopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  listOpen: boolean;
  onListToggle: () => void;
}

function TopNav({ activeTab, onTabChange, listOpen, onListToggle }: TopNavProps) {
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
    <div style={{ flexShrink: 0, minWidth: APP_MIN_WIDTH }}>
      {/* Row 1: Main nav */}
      <div
        className="flex items-center flex-nowrap px-4"
        style={{ background: "var(--nav-bg, #1a0a6b)", borderBottom: "1px solid var(--nav-border, #140854)", height: 40 }}
      >
        <div className="flex items-center gap-2 mr-6 shrink-0">
          <div
            className="flex items-center justify-center rounded"
            style={{ width: 28, height: 28, background: "var(--logo-bg, #7c3aed)", fontSize: 12, fontWeight: 700, color: "var(--on-accent)" }}
          >
            VB
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--nav-text, #fff)" }}>(주)비아블</span>
          <span style={{ fontSize: 12, color: "var(--nav-text-muted, rgba(255,255,255,0.6))", marginLeft: 4 }}>ERP</span>
        </div>
        <div className="flex items-center h-full flex-1 min-w-0">
          {mainMenus.map((menu) => {
            const isActive = menu === "회원관리";
            return (
              <button
                key={menu}
                onClick={menu === "회원관리" ? onListToggle : undefined}
                className="flex items-center h-full px-4 shrink-0 whitespace-nowrap transition-all duration-150"
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
        <div className="flex items-center gap-3 ml-4 shrink-0 whitespace-nowrap">
          <div
            className="flex items-center justify-center rounded"
            style={{ width: 26, height: 26, background: "var(--nav-avatar-bg, rgba(255,255,255,0.2))", fontSize: 12, fontWeight: 600, color: "var(--nav-text, #fff)" }}
          >
            KR
          </div>
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 26, height: 26, background: "#4f7ef8", fontSize: 12, fontWeight: 700, color: "var(--on-accent)" }}
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
        className="flex items-center flex-nowrap px-4"
        style={{ background: "var(--surface-subnav)", borderBottom: "1px solid var(--border)", height: 34 }}
      >
        <div className="flex items-center flex-1 min-w-0 h-full">
          {subTabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className="flex items-center h-full px-3 shrink-0 whitespace-nowrap transition-all duration-150"
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
        className="flex items-center flex-nowrap gap-1.5 px-4"
        style={{ background: "var(--surface-subnav)", borderBottom: "1px solid var(--border)", height: 36 }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {actionButtons.map((btn, i) => (
            <React.Fragment key={btn.label}>
              {i === 3 && <div className="shrink-0" style={{ width: 1, height: 16, background: "var(--border)", margin: "0 2px" }} />}
              <button
                className="flex items-center justify-center gap-1 px-2 py-0.5 rounded shrink-0 whitespace-nowrap transition-all duration-150"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  background:
                    btn.variant === "primary" ? "var(--accent-light)"
                    : btn.variant === "danger" ? "var(--action-btn-danger-bg)"
                    : "var(--action-btn-default-bg)",
                  color:
                    btn.variant === "primary" ? "var(--accent-primary)"
                    : btn.variant === "danger" ? "var(--action-btn-danger-fg)"
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
          className="flex items-center justify-center px-2 py-0.5 rounded shrink-0 whitespace-nowrap"
          style={{ fontSize: 13, fontWeight: 500, background: "var(--accent-light)", color: "var(--accent-primary)", border: "none" }}
        >
          회원등록
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────

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

const themes: { key: Theme; color: string; label: string }[] = [
  { key: "deep-purple", color: "#1a0a6b", label: "딥퍼플" },
  { key: "light-gray",  color: "#e2e4ea", label: "라이트그레이" },
  { key: "dark",        color: "#0f1117", label: "다크" },
];

interface SidebarProps {
  activePanel: string | null;
  onPanelToggle: () => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}

function Sidebar({ activePanel, onPanelToggle, theme, onThemeChange }: SidebarProps) {
  return (
    <div
      className="app-sidebar flex flex-col items-center py-4 gap-1"
      style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH, height: "100%", background: "var(--sidebar-bg, #f1f2ff)", borderRight: "1px solid var(--border)", flexShrink: 0 }}
    >
      <div className="flex flex-col items-center gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = activePanel === item.key;
          return (
            <button
              key={item.key}
              onClick={item.key === "members" ? onPanelToggle : undefined}
              className="w-10 h-10 rounded flex items-center justify-center transition-all duration-200 group relative"
              style={{
                background: isActive ? "var(--sidebar-item-active-bg)" : "transparent",
                border: isActive ? "1px solid var(--accent-border)" : "1px solid transparent",
              }}
            >
              <item.icon size={18} style={{ color: isActive ? "var(--accent-primary)" : "var(--sidebar-foreground)" }} />
              <span
                className="absolute left-10 px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                style={{ background: "var(--tooltip-bg)", color: "var(--tooltip-fg)", fontSize: "12px" }}
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
            className="w-10 h-10 rounded flex items-center justify-center transition-all duration-200 group relative"
          >
            <item.icon size={18} style={{ color: "var(--sidebar-foreground)" }} />
            <span
              className="absolute left-10 px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
              style={{ background: "var(--tooltip-bg)", color: "var(--tooltip-fg)", fontSize: "12px" }}
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
              onClick={() => onThemeChange(t.key)}
              className="group relative"
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: t.color,
                border: theme === t.key ? "2px solid var(--accent-primary)" : "2px solid transparent",
                outline: theme === t.key ? "2px solid var(--accent-border)" : "none",
                cursor: "pointer",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              <span
                className="absolute left-6 px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                style={{ background: "var(--tooltip-bg)", color: "var(--tooltip-fg)", fontSize: "12px" }}
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

// ─────────────────────────────────────────────
// App (default export)
// ─────────────────────────────────────────────

export default function App() {
  const [selectedMember, setSelectedMember] = useState(1);
  const [listOpen, setListOpen] = useState(false);
  const [isListResizing, setIsListResizing] = useState(false);
  const [listWidth, setListWidth] = useState(() => clampMemberListWidth(MEMBER_LIST_DEFAULT_WIDTH));
  const [activeTab, setActiveTab] = useState("회원정보");
  const [theme, setTheme] = useState<Theme>("deep-purple");
  const [historyRailExpanded, setHistoryRailExpanded] = useState(false);
  const [pinnedPages, setPinnedPages] = useState<PageHistoryItem[]>([
    { id: "수당내역-1", screen: "수당내역", memberId: 1, memberNo: "N26431021", memberName: "한미채" },
  ]);
  const [recentPages, setRecentPages] = useState<PageHistoryItem[]>([
    { id: "회원정보-1", screen: "회원정보", memberId: 1, memberNo: "N26431021", memberName: "한미채" },
    { id: "주문서내역-2", screen: "주문서내역", memberId: 2, memberNo: "N26482827", memberName: "황기봉" },
    { id: "로그히스토리-1", screen: "로그히스토리", memberId: 1, memberNo: "N26431021", memberName: "한미채" },
  ]);
  const [appContentWidth, setAppContentWidth] = useState(0);
  const appContentRef = useRef<HTMLDivElement>(null);
  const resizing = useRef(false);

  const formColumnWidth = useMemo(() => {
    if (!listOpen || appContentWidth <= 0) {
      return FORM_COLUMN_WIDTH_MIN;
    }
    const availableDetail = appContentWidth - listWidth;
    return calcFormColumnWidth(availableDetail);
  }, [listOpen, listWidth, appContentWidth]);

  const isMemberInfoTab = activeTab === "회원정보";

  const detailPanelMinWidth = useMemo(() => {
    if (isMemberInfoTab) {
      return getDetailPanelWidth(formColumnWidth);
    }
    return ORDER_PANEL_MIN_WIDTH;
  }, [isMemberInfoTab, formColumnWidth]);

  const isFixedDetailWidth = listOpen && !isMemberInfoTab;

  const contentRowMinWidth = listOpen
    ? listWidth + detailPanelMinWidth
    : 0;

  const activePageId = makePageId(activeTab, selectedMember);

  useEffect(() => {
    const item = toHistoryItem(activeTab, selectedMember);
    if (!item) return;
    setRecentPages((prev) => {
      const filtered = prev.filter((p) => p.id !== item.id);
      return [item, ...filtered].slice(0, 8);
    });
  }, [activeTab, selectedMember]);

  const handleHistorySelect = useCallback((item: PageHistoryItem) => {
    setActiveTab(item.screen);
    setSelectedMember(item.memberId);
  }, []);

  const handlePinCurrent = useCallback(() => {
    const item = toHistoryItem(activeTab, selectedMember);
    if (!item) return;
    setPinnedPages((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;
      return [item, ...prev];
    });
  }, [activeTab, selectedMember]);

  const handleUnpin = useCallback((id: string) => {
    setPinnedPages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  useEffect(() => {
    const el = appContentRef.current;
    if (!el) return;
    const syncWidth = () => setAppContentWidth(el.clientWidth);
    const ro = new ResizeObserver(syncWidth);
    ro.observe(el);
    syncWidth();
    return () => ro.disconnect();
  }, [historyRailExpanded]);

  useEffect(() => {
    function onWindowResize() {
      setListWidth((w) => clampMemberListWidth(w));
    }
    window.addEventListener("resize", onWindowResize);
    return () => window.removeEventListener("resize", onWindowResize);
  }, []);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    setIsListResizing(true);
    function onMove(ev: MouseEvent) {
      if (!resizing.current) return;
      const sidebarOffset = SIDEBAR_WIDTH;
      const newWidth = ev.clientX - sidebarOffset;
      setListWidth(clampMemberListWidth(newWidth));
    }
    function onUp() {
      resizing.current = false;
      setIsListResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  return (
    <div
      className="flex flex-col"
      data-theme={theme}
      style={{ height: "100vh", width: "100%", overflowX: "auto", overflowY: "hidden", background: "var(--surface-page)" }}
    >
      <div
        className="flex flex-col"
        style={{ minWidth: APP_MIN_WIDTH, width: "100%", height: "100%", flex: "1 0 auto" }}
      >
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        listOpen={listOpen}
        onListToggle={() => setListOpen((v) => !v)}
      />

      {/* 본문 — 가로 스크롤 영역과 방문기록 패널 분리 */}
      <div
        className="app-body"
        style={{ flex: 1, display: "flex", minHeight: 0, minWidth: 0, overflow: "hidden" }}
      >
        <Sidebar activePanel={listOpen ? "members" : null} onPanelToggle={() => setListOpen((v) => !v)} theme={theme} onThemeChange={setTheme} />

        <div
          ref={appContentRef}
          className="app-content"
          style={{ flex: 1, overflowX: listOpen ? "auto" : "hidden", overflowY: "hidden", minHeight: 0, minWidth: 0 }}
        >
          <div
            className="app-content-row"
            style={{
              display: "flex",
              height: "100%",
              width: listOpen ? contentRowMinWidth : "100%",
              minWidth: listOpen ? contentRowMinWidth : 0,
              flexShrink: 0,
            }}
          >

        {/* 왼쪽 회원목록 패널 */}
        <div
          className="member-list-panel"
          style={{
            width: listOpen ? listWidth : 0,
            minWidth: listOpen ? listWidth : 0,
            flexShrink: 0,
            flexGrow: 0,
            overflow: "hidden",
            transition: isListResizing ? "none" : LAYOUT_TRANSITION,
            background: "var(--surface-panel)",
            position: "relative",
            height: "100%",
          }}
        >
          <div style={{ width: Math.min(listWidth, MEMBER_LIST_MAX_WIDTH), height: "100%" }}>
            <MemberTable selectedId={selectedMember} onSelect={setSelectedMember} />
          </div>
          {listOpen && (
            <div
              onMouseDown={onResizeStart}
              style={{
                position: "absolute", top: 0, right: 0,
                width: 5, height: "100%",
                cursor: "col-resize", background: "transparent", zIndex: 20,
                borderRight: "2px solid var(--border)", transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          )}
        </div>

        {/* 오른쪽 상세 패널 — 절대 축소 불가 */}
        <div
          className="app-content-detail"
          style={{
            width: isFixedDetailWidth ? ORDER_PANEL_MIN_WIDTH : listOpen ? undefined : "100%",
            minWidth: listOpen ? detailPanelMinWidth : 0,
            maxWidth: isFixedDetailWidth ? ORDER_PANEL_MIN_WIDTH : undefined,
            flexShrink: listOpen ? 0 : 1,
            flexGrow: isFixedDetailWidth ? 0 : 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            background: "var(--surface-page)",
            overflow: "hidden",
          }}
        >
          {isMemberInfoTab ? (
            <MemberDetail memberId={selectedMember} listOpen={listOpen} formColumnWidth={formColumnWidth} />
          ) : activeTab === "주문서내역" ? (
            <OrderHistoryView memberId={selectedMember} />
          ) : activeTab === "수당내역" ? (
            <AllowanceHistoryView memberId={selectedMember} />
          ) : (
            <div className="flex items-center justify-center h-full" style={{ color: "var(--text-muted)", fontSize: 14 }}>
              {activeTab} 화면 준비 중입니다.
            </div>
          )}
        </div>
          </div>
        </div>

        <RecentPinRail
          expanded={historyRailExpanded}
          onToggleExpand={() => setHistoryRailExpanded((v) => !v)}
          pinned={pinnedPages}
          recent={recentPages}
          activeId={activePageId}
          onSelect={handleHistorySelect}
          onPinCurrent={handlePinCurrent}
          onUnpin={handleUnpin}
        />
      </div>
      </div>
    </div>
  );
}
