import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  User, Shield, GitFork, CreditCard, Users, Info,
  BarChart2, ShoppingCart, Settings, Bell, HelpCircle, Home,
  Pin, Clock, ChevronLeft, ChevronRight, RefreshCw,
  FilePlus, Save, Trash2, Award, Briefcase, MessageCircle, Key, Printer,
  Globe, Landmark, Contact, CheckCircle2, Phone, ExternalLink, Camera,
} from "lucide-react";
import { OrderManagementView } from "./components/OrderManagementView";
import { Mm2ProfileCard, buildMm2ProfileFields } from "./components/Mm2ProfileCard";
import { OrgChartHoverProvider, useOrgChartHover, type OrgMemberDetail } from "./components/OrgMemberHoverPopup";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Theme = "deep-purple" | "dark";
type SortKey = string | null;
type SortDir = "asc" | "desc";

// 레이아웃 고정 너비 — 회원목록 확장 시 컨텐츠 찌그러짐 방지
const SIDEBAR_WIDTH = 48;
const MEMBER_LIST_MIN_WIDTH = 240;
const MEMBER_LIST_DEFAULT_WIDTH = 240;
const MEMBER_LIST_PAGE_SIZE = 15;
const MEMBER_LIST_MAX_WIDTH =
  36 + 36 + 96 + 100 + 54 + 62 + 84 + 56 + 54 + 54 + 108 + 108 + 84;
const FORM_COLUMN_WIDTH_MIN = 1000;
const ORDER_PANEL_MIN_WIDTH = 1520;
const APP_MIN_WIDTH = 1280;
const LIST_PANEL_TRANSITION_MS = 250;
const LAYOUT_TRANSITION = `width ${LIST_PANEL_TRANSITION_MS}ms ease, min-width ${LIST_PANEL_TRANSITION_MS}ms ease`;
const ORG_CARD_W = 167;
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

function calcOrgChartMaxSvgHeight(maxChildren = 5) {
  const extraH = 34;
  const cardH = ORG_CARD_H;
  const childChipH = ORG_CHILD_CHIP_H;
  const gap = 7;
  const col2Heights = [extraH, cardH, cardH];
  const totalCol2H = col2Heights.reduce((sum, h) => sum + h, 0) + gap * (col2Heights.length - 1);
  const col2Ys: number[] = [];
  let y = 0;
  col2Heights.forEach((h) => {
    col2Ys.push(y + h / 2);
    y += h + gap;
  });
  const selfCenterY = col2Ys[1];
  const stackH = childChipH * maxChildren + gap * (maxChildren - 1);
  const top = selfCenterY - stackH / 2 + childChipH / 2;
  const childYs = Array.from({ length: maxChildren }, (_, i) => top + i * (childChipH + gap));
  const col3Bottom = childYs[maxChildren - 1] + childChipH / 2;
  const col3Top = childYs[0] - childChipH / 2;
  const contentTop = Math.min(0, col3Top);
  const yShift = getOrgChartTopShift(contentTop);
  const contentH = Math.max(totalCol2H, col3Bottom);
  return contentH + yShift + 8;
}

const ORG_CHART_SVG_WIDTH = ORG_HPAD * 2 + ORG_CARD_W * 3 + ORG_COL_GAP * 2 + ORG_FOREIGN_PAD;
const ORG_CHART_WIDTH = ORG_CHART_SVG_WIDTH + ORG_CHART_SIDE_PAD * 2;
const ORG_CHART_MAX_SVG_HEIGHT = calcOrgChartMaxSvgHeight(5);
const ORG_CHART_SECTION_HEADER_H = 38;
const ORG_CHART_BODY_PAD_V = 28;
const ORG_CHART_PANEL_HEIGHT = ORG_CHART_SECTION_HEADER_H + ORG_CHART_BODY_PAD_V + ORG_CHART_MAX_SVG_HEIGHT;
const MM2_ORG_CHART_SCALE = 686 / ORG_CHART_WIDTH;
const MM2_ORG_CHART_CONTENT_W = Math.ceil(ORG_CHART_WIDTH * MM2_ORG_CHART_SCALE);
const MM2_ORG_CHART_CONTENT_H = Math.ceil(ORG_CHART_MAX_SVG_HEIGHT * MM2_ORG_CHART_SCALE);
const MM2_ORG_CHART_WIDTH = MM2_ORG_CHART_CONTENT_W + 2;
const ORG_CARD_NAME_FONT_SIZE = 14.6 / MM2_ORG_CHART_SCALE;
const MM2_ORG_CHART_PANEL_HEIGHT =
  ORG_CHART_SECTION_HEADER_H + ORG_CHART_BODY_PAD_V + MM2_ORG_CHART_CONTENT_H + 2;
const DETAIL_CONTENT_GAP = 12;
const DETAIL_PANEL_PAD = 12;
const HISTORY_BAR_COLLAPSED_HEIGHT = 40;
const HISTORY_BAR_EXPANDED_HEIGHT = 84;

function getDetailContentWidth(formColumnWidth: number) {
  return formColumnWidth + ORG_CHART_WIDTH + DETAIL_CONTENT_GAP;
}

function getDetailPanelWidth(formColumnWidth: number) {
  return getDetailContentWidth(formColumnWidth) + DETAIL_PANEL_PAD * 2;
}

function calcFormColumnWidth(availableDetailWidth: number) {
  const innerWidth = Math.max(0, availableDetailWidth - DETAIL_PANEL_PAD * 2);
  const idealForm = innerWidth - ORG_CHART_WIDTH - DETAIL_CONTENT_GAP;
  if (idealForm >= FORM_COLUMN_WIDTH_MIN) {
    return idealForm;
  }
  return FORM_COLUMN_WIDTH_MIN;
}

const MM2_INFO_GROUP_WIDTH = 1140;

function getMm2DetailContentWidth(infoGroupWidth: number) {
  return infoGroupWidth + MM2_ORG_CHART_WIDTH + DETAIL_CONTENT_GAP;
}

function getMm2DetailPanelWidth(infoGroupWidth: number) {
  return getMm2DetailContentWidth(infoGroupWidth) + DETAIL_PANEL_PAD * 2;
}

function getMm2PanelMinWidth() {
  return getMm2DetailPanelWidth(MM2_INFO_GROUP_WIDTH);
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

const ORG_CARD_LABEL_FONT_SIZE = 13;
const ORG_CARD_META_FONT_SIZE = 13;
const ORG_CARD_BADGE_FONT_SIZE = 12;

function resolveOrgMemberNo(id: number, fallback?: string) {
  const ref = members.find((m) => m.id === id);
  return ref?.no ?? fallback ?? `N2643${String(id).padStart(4, "0")}`;
}

function createOrgNode(
  label: string,
  name: string,
  id: number,
  grade: string,
  options?: { memberNo?: string },
): OrgNode {
  return {
    label,
    name,
    id,
    memberNo: options?.memberNo ?? resolveOrgMemberNo(id),
    grade,
  };
}

function resolveOrgMemberRecord(id: number, name: string) {
  return members.find((m) => m.id === id) ?? members.find((m) => m.name === name);
}

function buildOrgMemberDetail(id: number, name: string, memberNo: string, grade: string): OrgMemberDetail {
  const member = resolveOrgMemberRecord(id, name);
  const recommender = members[(Math.max(id, 1) + 2) % members.length];
  const sponsor = members[(Math.max(id, 1) + 4) % members.length];
  const dash = "-";
  return {
    memberNo: member?.no ?? memberNo,
    name: member?.name ?? name,
    ssn: member?.ssn ?? "******-*******",
    phone: member?.phone?.trim() ? member.phone : dash,
    address: member?.region ?? dash,
    recommender: recommender.name,
    sponsor: sponsor.name,
    rank: grade || member?.rank || dash,
    salesDate: member?.regDate ?? dash,
    withdrawDate: member?.status === "탈퇴" ? (member.regDate ?? dash) : dash,
    suspendDate: dash,
    footer: `${member?.regDate ?? "2026-05-07"} 11:58:09 · ${member?.loginId ?? "member"}`,
  };
}

function Card({ label, name, memberNo, grade, id, isSelf = false }: {
  label: string;
  name: string;
  memberNo: string;
  grade: string;
  id: number;
  isSelf?: boolean;
}) {
  const hover = useOrgChartHover();
  const rootRef = useRef<HTMLDivElement>(null);
  const metaStyle: React.CSSProperties = {
    fontSize: ORG_CARD_META_FONT_SIZE,
    color: "var(--org-text-muted)",
    lineHeight: 1.35,
    fontWeight: 400,
  };

  return (
    <div
      ref={rootRef}
      className="org-chart-card org-chart-card--interactive"
      onMouseEnter={() => {
        if (!hover || !rootRef.current) return;
        hover.cancelHide();
        hover.showFromElement(buildOrgMemberDetail(id, name, memberNo, grade), rootRef.current);
      }}
      onMouseLeave={() => hover?.scheduleHide()}
      style={{
      width: CARD_W,
      height: CARD_H,
      border: isSelf ? `2px solid ${ORG_SELF_ACCENT}` : `1px solid ${BORDER_GRAY}`,
      borderRadius: 6,
      overflow: "hidden",
      background: "var(--org-card-bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "8px 6px",
      position: "relative",
      boxSizing: "border-box",
      flexShrink: 0,
    }}
    >
      {isSelf && (
        <span style={{
          position: "absolute", top: 4, right: 4,
          background: ORG_SELF_ACCENT, color: "var(--on-accent)",
          fontSize: ORG_CARD_BADGE_FONT_SIZE, padding: "2px 7px", borderRadius: 10, fontWeight: 700, lineHeight: 1.2,
        }}>자신</span>
      )}
      <div style={{ fontSize: ORG_CARD_LABEL_FONT_SIZE, color: LABEL_GRAY, marginBottom: 4 }}>
        {isSelf ? "나" : label}
      </div>
      <div style={{ fontSize: ORG_CARD_NAME_FONT_SIZE, fontWeight: 700, color: "var(--org-text)", marginBottom: 2 }}>
        {name}
      </div>
      <div style={{ ...metaStyle, marginBottom: 4 }}>{memberNo}</div>
      <div>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          height: 20,
          padding: "0 8px",
          borderRadius: 999,
          fontSize: ORG_CARD_BADGE_FONT_SIZE,
          fontWeight: 400,
          background: "var(--org-grade-badge-bg, var(--accent-light))",
          color: "var(--org-grade-badge-fg, var(--accent-primary))",
        }}>
          {grade}
        </span>
      </div>
    </div>
  );
}

function ExtraBox({ label }: { label: string }) {
  return (
    <div
      className="org-chart-card org-chart-card--extra"
      style={{
      width: CARD_W, height: EXTRA_H,
      border: `1px dashed ${BORDER_GRAY}`,
      borderRadius: 6,
      overflow: "hidden",
      background: "var(--org-extra-bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: ORG_CARD_LABEL_FONT_SIZE, color: LABEL_GRAY, boxSizing: "border-box", flexShrink: 0,
    }}
    >
      {label}
    </div>
  );
}

function ChildChip({ name, id }: { name: string; id: number }) {
  const hover = useOrgChartHover();
  const rootRef = useRef<HTMLDivElement>(null);
  const memberNo = resolveOrgMemberNo(id);
  const member = resolveOrgMemberRecord(id, name);
  const grade = member?.grade ?? "멤버";

  return (
    <div
      ref={rootRef}
      className="org-chart-card org-chart-card--chip org-chart-card--interactive"
      onMouseEnter={() => {
        if (!hover || !rootRef.current) return;
        hover.cancelHide();
        hover.showFromElement(buildOrgMemberDetail(id, name, memberNo, grade), rootRef.current);
      }}
      onMouseLeave={() => hover?.scheduleHide()}
      style={{
      border: `1px solid ${BORDER_GRAY}`,
      borderRadius: 6,
      overflow: "hidden",
      background: "var(--org-card-bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: CHILD_CHIP_H,
      width: CARD_W,
      fontSize: ORG_CARD_NAME_FONT_SIZE,
      fontWeight: 600,
      color: "var(--org-text)",
      boxSizing: "border-box",
    }}
    >
      {name} ({id})
    </div>
  );
}

type OrgNode = {
  label: string;
  name: string;
  id: number;
  memberNo: string;
  grade: string;
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
    <OrgChartHoverProvider>
      <div key={memberId} style={{ overflow: "visible", padding: "0 0 8px 0", display: "flex", justifyContent: "center", width: "100%" }}>
        <OrgChartSvg {...variant} />
      </div>
    </OrgChartHoverProvider>
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
      parent: createOrgNode("상위", "고병도", 6, "매니저"),
      sibling: createOrgNode("형제", "한숙자", 15, "정회원"),
      self: createOrgNode("나", memberName, memberId, "다이아몬드", {
        memberNo: member.no,
      }),
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
      return createOrgNode(label, ref.name, ref.id, ref.grade);
    };

    return {
      layoutType: "tall-tree" as const,
      parent: createOrgNode("상위", "장은경", 7, "디렉터"),
      sibling: orgNode(1, "형제"),
      stackNodes: [orgNode(1, "형제"), orgNode(3, "형제"), orgNode(4, "형제"), orgNode(5, "형제")],
      self: createOrgNode("나", memberName, memberId, member.grade, {
        memberNo: member.no,
      }),
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

  const parent = createOrgNode("상위", parentRef.name, parentRef.id, parentRanks[memberId % parentRanks.length]);
  const sibling = createOrgNode(
    memberId % 4 === 0 ? "동료" : "형제",
    siblingRef.name,
    siblingRef.id,
    orgRanks[(memberId + 1) % orgRanks.length],
  );
  const self = createOrgNode("나", memberName, memberId, member.grade, {
    memberNo: member.no,
  });

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
  listOpen?: boolean;
  listWidth?: number;
}

function MemberTable({ selectedId, onSelect, listOpen = false, listWidth = MEMBER_LIST_DEFAULT_WIDTH }: MemberTableProps) {
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

  useEffect(() => {
    if (listOpen && listWidth >= MEMBER_LIST_MAX_WIDTH) {
      syncTableOffset(0);
    }
  }, [listOpen, listWidth]);

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
                  style={{ accentColor: "var(--checkbox-accent)", cursor: "pointer" }}
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
                    <input type="checkbox" checked={isChecked} onChange={() => toggleOne(member.id)} style={{ accentColor: "var(--checkbox-accent)", cursor: "pointer" }} />
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

        {!listOpen || listWidth < MEMBER_LIST_MAX_WIDTH ? (
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
        ) : null}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Detail split panel (주문서내역 · 수당내역 공통)
// ─────────────────────────────────────────────

type SplitTableColumn = { key: string; label: string; width: number; align?: "left" | "center" | "right" };

const SPLIT_TABLE_DEFAULT_ALIGN: NonNullable<SplitTableColumn["align"]> = "center";

function getSplitColumnAlign(col: SplitTableColumn) {
  return col.align ?? SPLIT_TABLE_DEFAULT_ALIGN;
}

const SPLIT_TABLE_CHECKBOX_WIDTH = 36;
const SPLIT_TABLE_CHECKBOX_PAD_LEFT = 14;
const SPLIT_TABLE_HEADER_PAD_Y = 6;

function getSplitTableWeight(columns: SplitTableColumn[]) {
  return SPLIT_TABLE_CHECKBOX_WIDTH + columns.reduce((sum, col) => sum + col.width, 0);
}

function SplitTableBlock({
  columns,
  rows = [],
}: {
  columns: SplitTableColumn[];
  rows?: Record<string, string | number>[];
}) {
  const checkboxWidth = SPLIT_TABLE_CHECKBOX_WIDTH;
  const columnsWeight = columns.reduce((sum, col) => sum + col.width, 0);
  const dataColumnsWeight = columnsWeight;

  const checkboxCellStyle: React.CSSProperties = {
    padding: `${SPLIT_TABLE_HEADER_PAD_Y}px 8px ${SPLIT_TABLE_HEADER_PAD_Y}px ${SPLIT_TABLE_CHECKBOX_PAD_LEFT}px`,
    textAlign: "left",
  };

  const checkboxHeaderStyle: React.CSSProperties = {
    padding: `${SPLIT_TABLE_HEADER_PAD_Y}px 8px ${SPLIT_TABLE_HEADER_PAD_Y}px ${SPLIT_TABLE_CHECKBOX_PAD_LEFT}px`,
    textAlign: "left",
  };

  const cellStyle: React.CSSProperties = {
    padding: `${SPLIT_TABLE_HEADER_PAD_Y}px 8px`,
    fontSize: 13,
    color: "var(--text-body)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div
      className="split-table-block flex flex-col flex-1 min-h-0"
      style={{ width: "100%", border: "1px solid var(--border)", background: "var(--surface-panel)" }}
    >
      <div className="flex-1 min-h-0" style={{ width: "100%", overflowY: "auto", overflowX: "hidden" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: checkboxWidth }} />
            {columns.map((col) => (
              <col key={col.key} style={{ width: `${(col.width / dataColumnsWeight) * 100}%` }} />
            ))}
          </colgroup>
          <thead className="split-table-head" style={{ position: "sticky", top: 0, zIndex: 2 }}>
            <tr style={{ background: "var(--split-table-header-bg, var(--surface-table-header))", borderBottom: "1px solid var(--split-table-header-border, var(--border))" }}>
              <th style={checkboxHeaderStyle}>
                <input type="checkbox" readOnly style={{ accentColor: "var(--checkbox-accent)", cursor: "pointer" }} />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: `${SPLIT_TABLE_HEADER_PAD_Y}px 8px`,
                    textAlign: getSplitColumnAlign(col),
                    fontSize: 13,
                    fontWeight: 400,
                    color: "var(--split-table-header-fg, var(--text-muted))",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    background: "var(--split-table-header-bg, var(--surface-table-header))",
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
                <td style={{ ...cellStyle, ...checkboxCellStyle }}>
                  <input type="checkbox" readOnly style={{ accentColor: "var(--checkbox-accent)", cursor: "pointer" }} />
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      ...cellStyle,
                      textAlign: getSplitColumnAlign(col),
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
  const unifiedMinWidth = Math.max(getSplitTableWeight(topColumns), getSplitTableWeight(bottomColumns));

  return (
    <div
      className="flex flex-col h-full min-h-0 w-full overflow-hidden"
      style={{ background: "var(--surface-page)" }}
    >
      <button
        type="button"
        className="flex items-center gap-1.5 shrink-0 self-start rounded transition-colors"
        style={{
          fontSize: 13,
          color: "var(--text-body)",
          padding: "4px 8px",
          marginBottom: 6,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <RefreshCw size={13} style={{ color: "var(--muted-foreground)" }} />
        새로고침
      </button>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden" style={{ width: "100%" }}>
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden flex flex-col">
          <div
            className="flex flex-col flex-1 min-h-0"
            style={{ width: "100%", minWidth: unifiedMinWidth }}
          >
            <SplitTableBlock columns={topColumns} rows={topRows} />
            <div style={{ height: 6, background: "var(--border)", flexShrink: 0 }} />
            <SplitTableBlock columns={bottomColumns} rows={bottomRows} />
          </div>
        </div>
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
      className="member-type-toggle flex items-center ml-1"
      style={{ background: "var(--brand-toggle-track)", borderRadius: 20, padding: 2, border: "1px solid var(--brand-light)" }}
    >
      {(["일반", "소비자"] as const).map((t) => (
        <button
          key={t}
          type="button"
          className={selected === t ? "is-selected" : undefined}
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
        style={{
          cursor: "pointer",
          background: "var(--content-form-section-header-bg, transparent)",
          borderBottom: open ? "1px solid var(--content-form-section-header-border, var(--border))" : "none",
          paddingTop: 9,
          paddingBottom: 9,
        }}
      >
        <span className="content-form-section-icon shrink-0 inline-flex items-center justify-center" style={{ color: "var(--section-icon-color)" }}>
          {icon}
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

function MemberHeaderCard({ member }: { member: Member }) {
  const memberType = member.type === "소비자" ? "소비자" : "일반";
  return (
    <div className="rounded content-member-header p-1.5 mb-2">
      <div className="flex items-center gap-3">
        <div
          className="content-member-header-avatar w-8 h-8 rounded flex items-center justify-center font-bold shrink-0"
          style={{ fontSize: 12 }}
        >
          {member.name.charAt(0)}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="content-member-header-text" style={{ fontSize: 13 }}>{member.name} · {member.loginId}</span>
          <span className="content-member-header-divider" style={{ width: 1, height: 14, display: "inline-block" }} />
          <span className="content-member-header-no" style={{ fontSize: 13, fontWeight: 600 }}>{member.no}</span>
          <MemberTypeToggle type={memberType} />
        </div>
      </div>
    </div>
  );
}

const mm2Sections = [
  { id: "login", label: "1. 로그인 및 이름 정보", icon: Key },
  { id: "personal", label: "2. 개인 정보", icon: User },
  { id: "country", label: "3. 국가 및 기타 정보", icon: Globe },
  { id: "account", label: "4. 계좌 정보", icon: Landmark },
  { id: "relation", label: "5. 소속/관계 및 동의 여부", icon: Users },
] as const;

type Mm2SectionId = (typeof mm2Sections)[number]["id"];

type Mm2DetailRow =
  | {
      kind?: "single";
      label: string;
      viewValue: React.ReactNode;
      editValue?: React.ReactNode;
      readOnly?: boolean;
    }
  | {
      kind: "dual";
      left: {
        label: string;
        viewValue: React.ReactNode;
        editValue?: React.ReactNode;
        readOnly?: boolean;
      };
      right: {
        label: string;
        viewValue: React.ReactNode;
        editValue?: React.ReactNode;
        readOnly?: boolean;
      };
    };

function Mm2DetailInput({
  suffix,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { suffix?: React.ReactNode }) {
  return (
    <span className="mm2-field-value">
      <input className={`mm2-detail-input ${className}`.trim()} {...props} />
      {suffix ? <span className="mm2-field-suffix">{suffix}</span> : null}
    </span>
  );
}

function Mm2DetailSelect({
  suffix,
  children,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { suffix?: React.ReactNode }) {
  return (
    <span className="mm2-field-value">
      <select className={`mm2-detail-select ${className}`.trim()} {...props}>
        {children}
      </select>
      {suffix ? <span className="mm2-field-suffix">{suffix}</span> : null}
    </span>
  );
}

function Mm2DetailTextarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`mm2-detail-textarea ${className}`.trim()} {...props} />;
}

function Mm2DetailHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mm2-detail-header">
      <span className="mm2-detail-header-icon">{icon}</span>
      <span className="mm2-detail-header-title">{title}</span>
    </div>
  );
}

function Mm2EditableCell({
  cellKey,
  activeKey,
  onActivate,
  onDeactivate,
  readOnly,
  viewValue,
  editValue,
  className = "",
}: {
  cellKey: string;
  activeKey: string | null;
  onActivate: (key: string) => void;
  onDeactivate: () => void;
  readOnly?: boolean;
  viewValue: React.ReactNode;
  editValue?: React.ReactNode;
  className?: string;
}) {
  const cellRef = useRef<HTMLDivElement>(null);
  const isEditing = activeKey === cellKey;
  const canEdit = !readOnly && editValue !== undefined;

  useEffect(() => {
    if (!isEditing) return;
    const focusable = cellRef.current?.querySelector<HTMLElement>("input, select, textarea");
    focusable?.focus();
  }, [isEditing]);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !cellRef.current?.contains(next)) {
      onDeactivate();
    }
  };

  return (
    <div
      ref={cellRef}
      className={`mm2-detail-value${className ? ` ${className}` : ""}${canEdit ? " is-clickable" : ""}${isEditing ? " is-editing" : ""}`}
      onClick={() => {
        if (canEdit && !isEditing) onActivate(cellKey);
      }}
      onBlur={handleBlur}
      onKeyDown={(event) => {
        if (!canEdit || isEditing) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivate(cellKey);
        }
      }}
      role={canEdit ? "button" : undefined}
      tabIndex={canEdit && !isEditing ? 0 : undefined}
    >
      {isEditing ? editValue : viewValue}
    </div>
  );
}

function Mm2DetailTable({ rows }: { rows: Mm2DetailRow[] }) {
  const [activeCell, setActiveCell] = useState<string | null>(null);

  return (
    <div className={`mm2-detail-table${activeCell ? " has-active-cell" : ""}`}>
      {rows.map((row) => {
        if (row.kind === "dual") {
          return (
            <div key={`${row.left.label}-${row.right.label}`} className="mm2-detail-row mm2-detail-row--dual">
              <div className="mm2-detail-label">{row.left.label}</div>
              <Mm2EditableCell
                cellKey={`${row.left.label}-${row.right.label}-left`}
                activeKey={activeCell}
                onActivate={setActiveCell}
                onDeactivate={() => setActiveCell(null)}
                readOnly={row.left.readOnly}
                viewValue={row.left.viewValue}
                editValue={row.left.editValue}
                className="mm2-detail-value--half"
              />
              <div className="mm2-detail-label mm2-detail-label--secondary">{row.right.label}</div>
              <Mm2EditableCell
                cellKey={`${row.left.label}-${row.right.label}-right`}
                activeKey={activeCell}
                onActivate={setActiveCell}
                onDeactivate={() => setActiveCell(null)}
                readOnly={row.right.readOnly}
                viewValue={row.right.viewValue}
                editValue={row.right.editValue}
                className="mm2-detail-value--half"
              />
            </div>
          );
        }

        return (
          <div key={row.label} className="mm2-detail-row">
            <div className="mm2-detail-label">{row.label}</div>
            <Mm2EditableCell
              cellKey={row.label}
              activeKey={activeCell}
              onActivate={setActiveCell}
              onDeactivate={() => setActiveCell(null)}
              readOnly={row.readOnly}
              viewValue={row.viewValue}
              editValue={row.editValue}
            />
          </div>
        );
      })}
    </div>
  );
}

function Mm2DetailPanel({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Mm2DetailRow[];
}) {
  return (
    <div className="mm2-detail-panel">
      <Mm2DetailHeader icon={icon} title={title} />
      <div className="mm2-detail-body">
        <Mm2DetailTable rows={rows} />
      </div>
    </div>
  );
}

function buildMm2SectionRows(member: Member): Record<Mm2SectionId, Mm2DetailRow[]> {
  const searchSuffix = <Search size={14} className="mm2-field-icon" />;
  const chevronSuffix = <ChevronDown size={14} className="mm2-field-icon" />;
  const verifiedSuffix = (
    <span className="mm2-verified-badge">
      <CheckCircle2 size={12} /> 인증완료
    </span>
  );

  return {
    login: [
      {
        kind: "dual",
        left: {
          label: "회원번호",
          viewValue: <span className="mm2-field-highlight">4121337</span>,
          editValue: <Mm2DetailInput defaultValue="4121337" readOnly />,
          readOnly: true,
        },
        right: {
          label: "아이디",
          viewValue: "minsoo",
          editValue: <Mm2DetailInput defaultValue="minsoo" />,
        },
      },
      {
        label: "비밀번호",
        viewValue: <span className="mm2-field-muted">변경 시에만 입력</span>,
        editValue: <Mm2DetailInput type="password" placeholder="변경 시에만 입력" />,
      },
      {
        label: "보안비밀번호",
        viewValue: <span className="mm2-field-masked">····</span>,
        editValue: <Mm2DetailInput type="password" placeholder="변경 시에만 입력" />,
      },
      {
        label: "회원등록일자",
        viewValue: "2025-06-12",
        editValue: <Mm2DetailInput type="date" defaultValue="2025-06-12" />,
      },
      {
        label: "성명",
        viewValue: (
          <>
            Minsoo <span className="mm2-field-sep">|</span> Kim
          </>
        ),
        editValue: (
          <span className="mm2-detail-name-row">
            <input className="mm2-detail-input mm2-name-box" defaultValue="Minsoo" />
            <input className="mm2-detail-input mm2-name-box" defaultValue="Kim" />
          </span>
        ),
      },
      {
        label: "한글명",
        viewValue: "김민수",
        editValue: <Mm2DetailInput defaultValue="김민수" />,
      },
      {
        label: "닉네임",
        viewValue: "Minsoo Kim",
        editValue: <Mm2DetailInput defaultValue="Minsoo Kim" />,
      },
      {
        label: "Business Name",
        viewValue: "",
        editValue: <Mm2DetailInput placeholder="Business Name" />,
      },
      {
        label: "Legal Name",
        viewValue: "",
        editValue: <Mm2DetailInput placeholder="Legal Name" />,
      },
    ],
    personal: [
      {
        label: "생년월일",
        viewValue: "1989-12-03",
        editValue: <Mm2DetailInput type="date" defaultValue="1989-12-03" />,
      },
      {
        label: "주민등록번호",
        viewValue: <Mm2FieldValue suffix={verifiedSuffix}>891203-1002399</Mm2FieldValue>,
        editValue: (
          <Mm2DetailInput defaultValue="891203-1002399" suffix={verifiedSuffix} />
        ),
      },
      {
        label: "성별",
        viewValue: "남",
        editValue: (
          <Mm2DetailSelect defaultValue="남" suffix={chevronSuffix}>
            <option value="남">남</option>
            <option value="여">여</option>
          </Mm2DetailSelect>
        ),
      },
      {
        label: "연락처",
        viewValue: "02-583-9201",
        editValue: <Mm2DetailInput defaultValue="02-583-9201" />,
      },
      {
        label: "휴대폰번호",
        viewValue: "010-3948-2918",
        editValue: <Mm2DetailInput defaultValue="010-3948-2918" />,
      },
      {
        label: "우편번호",
        viewValue: "06123",
        editValue: <Mm2DetailInput defaultValue="06123" suffix={searchSuffix} />,
      },
      {
        label: "기본주소",
        viewValue: "서울특별시 강남구 테헤란로 123",
        editValue: <Mm2DetailInput defaultValue="서울특별시 강남구 테헤란로 123" />,
      },
      {
        label: "상세주소",
        viewValue: "삼원빌딩 5층",
        editValue: <Mm2DetailInput defaultValue="삼원빌딩 5층" />,
      },
    ],
    country: [
      {
        label: "국가",
        viewValue: "대한민국",
        editValue: (
          <Mm2DetailSelect defaultValue="대한민국" suffix={chevronSuffix}>
            <option value="대한민국">대한민국</option>
            <option value="미국">미국</option>
          </Mm2DetailSelect>
        ),
      },
      {
        label: "State",
        viewValue: "강남구",
        editValue: <Mm2DetailInput defaultValue="강남구" />,
      },
      {
        label: "City",
        viewValue: "서울특별시",
        editValue: <Mm2DetailInput defaultValue="서울특별시" />,
      },
      {
        label: "비자종류",
        viewValue: "내국인",
        editValue: (
          <Mm2DetailSelect defaultValue="내국인" suffix={chevronSuffix}>
            <option value="내국인">내국인</option>
            <option value="F-4">F-4</option>
          </Mm2DetailSelect>
        ),
      },
      {
        label: "체류만료일자",
        viewValue: "2029-12-31",
        editValue: <Mm2DetailInput type="date" defaultValue="2029-12-31" />,
      },
      {
        label: "EIN Number",
        viewValue: "미국 사업자 번호",
        editValue: <Mm2DetailInput defaultValue="미국 사업자 번호" />,
      },
      {
        label: "세금신고번호",
        viewValue: "120-00-11111",
        editValue: <Mm2DetailInput defaultValue="120-00-11111" />,
      },
      {
        label: "특이사항",
        viewValue: "우수 대리점장 관리대상. 추천 수당 가산 2% 적용 회원.",
        editValue: (
          <Mm2DetailTextarea defaultValue="우수 대리점장 관리대상. 추천 수당 가산 2% 적용 회원." />
        ),
      },
    ],
    account: [
      {
        label: "은행명",
        viewValue: "국민은행",
        editValue: (
          <Mm2DetailSelect defaultValue="국민은행" suffix={chevronSuffix}>
            <option value="국민은행">국민은행</option>
            <option value="신한은행">신한은행</option>
          </Mm2DetailSelect>
        ),
      },
      {
        label: "계좌번호",
        viewValue: <Mm2FieldValue suffix={verifiedSuffix}>482901-01-293819</Mm2FieldValue>,
        editValue: <Mm2DetailInput defaultValue="482901-01-293819" suffix={verifiedSuffix} />,
      },
      {
        label: "예금주",
        viewValue: member.name,
        editValue: <Mm2DetailInput defaultValue={member.name} />,
      },
      {
        label: "SwiftCode",
        viewValue: "SHBKKRSE",
        editValue: <Mm2DetailInput defaultValue="SHBKKRSE" />,
      },
      {
        label: "Branch Number",
        viewValue: "0234",
        editValue: <Mm2DetailInput defaultValue="0234" />,
      },
      {
        label: "은행 거래번호",
        viewValue: "88012345",
        editValue: <Mm2DetailInput defaultValue="88012345" />,
      },
    ],
    relation: [
      {
        label: "추천인",
        viewValue: (
          <Mm2FieldValue>
            10001150 <span className="mm2-field-sep">|</span> 이순신 <span className="mm2-field-sep">|</span> 12명
          </Mm2FieldValue>
        ),
        editValue: <Mm2DetailInput defaultValue="10001150 | 이순신 | 12명" suffix={searchSuffix} />,
      },
      {
        label: "후원인",
        viewValue: (
          <Mm2FieldValue>
            10001201 <span className="mm2-field-sep">|</span> 홍길동 <span className="mm2-field-sep">|</span> 6명
          </Mm2FieldValue>
        ),
        editValue: <Mm2DetailInput defaultValue="10001201 | 홍길동 | 6명" suffix={searchSuffix} />,
      },
      {
        label: "센터",
        viewValue: "서울본점",
        editValue: (
          <Mm2DetailSelect defaultValue="서울본점" suffix={chevronSuffix}>
            <option value="서울본점">서울본점</option>
            <option value="서울센터">서울센터</option>
          </Mm2DetailSelect>
        ),
      },
      {
        label: "영업소",
        viewValue: "구로점",
        editValue: (
          <Mm2DetailSelect defaultValue="구로점" suffix={chevronSuffix}>
            <option value="구로점">구로점</option>
            <option value="강남영업소">강남영업소</option>
          </Mm2DetailSelect>
        ),
      },
      {
        label: "동의 항목",
        viewValue: <Mm2ConsentList />,
        editValue: <Mm2ConsentList editable />,
      },
    ],
  };
}

function Mm2FieldValue({ children, suffix }: { children: React.ReactNode; suffix?: React.ReactNode }) {
  return (
    <span className="mm2-field-value">
      <span className="mm2-field-text">{children}</span>
      {suffix ? <span className="mm2-field-suffix">{suffix}</span> : null}
    </span>
  );
}

function Mm2ConsentList({ editable = false }: { editable?: boolean }) {
  const items = [
    { label: "SMS 동의", checked: true },
    { label: "이메일 수신", checked: true },
    { label: "신분증 제출", checked: false },
    { label: "통장 사본등록", checked: false },
  ];
  return (
    <div className="mm2-consent-list">
      {items.map((item) => (
        <label key={item.label} className="mm2-consent-item">
          <input type="checkbox" defaultChecked={item.checked} readOnly={!editable} />
          <span>{item.label}</span>
        </label>
      ))}
    </div>
  );
}

function MemberManagement2View({
  memberId,
  listOpen,
  activeTab,
  onTabChange,
}: {
  memberId: number;
  listOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const member = getMemberById(memberId);
  const isMemberInfoTab = activeTab === "회원정보";
  const mm2DetailContentWidth = getMm2DetailContentWidth(MM2_INFO_GROUP_WIDTH);
  const mm2DetailPanelWidth = getMm2DetailPanelWidth(MM2_INFO_GROUP_WIDTH);
  const contentAlignWidth = isMemberInfoTab && listOpen ? mm2DetailContentWidth : "100%";
  const [activeSection, setActiveSection] = useState<Mm2SectionId>("login");
  const activeMeta = mm2Sections.find((s) => s.id === activeSection)!;
  const ActiveIcon = activeMeta.icon;
  const sectionRows = useMemo(() => buildMm2SectionRows(member), [member]);

  const profileFields = buildMm2ProfileFields(member);
  const orgSelfGrade = useMemo(
    () => buildOrgChartVariant(memberId, member.name, member).self.grade,
    [memberId, member],
  );

  return (
    <div
      className="flex flex-col h-full w-full min-h-0 mm2-member-view"
      style={{
        width: isMemberInfoTab && listOpen ? mm2DetailPanelWidth : "100%",
        flexShrink: isMemberInfoTab && listOpen ? 0 : undefined,
      }}
    >
      <div
        className={`flex flex-col flex-1 min-h-0${isMemberInfoTab ? " content-scroll" : ""}`}
        style={{
          overflowY: isMemberInfoTab ? "auto" : "hidden",
          overflowX: "hidden",
          background: "var(--surface-page)",
          padding: DETAIL_PANEL_PAD,
        }}
      >
        <div
          key={member.id}
          className={isMemberInfoTab ? undefined : "flex flex-col flex-1 min-h-0"}
          style={{
            width: contentAlignWidth,
            boxSizing: "border-box",
          }}
        >
          <MemberPageChrome activeTab={activeTab} onTabChange={onTabChange} />

          {isMemberInfoTab ? (
            <div className="mm2-content-row" style={{ gap: DETAIL_CONTENT_GAP }}>
              <div className="mm2-info-group">
                <Mm2ProfileCard member={member} profileFields={profileFields} rankBadge={orgSelfGrade} />

                <div className="mm2-body">
                  <nav className="mm2-sidebar">
                    {mm2Sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = section.id === activeSection;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          className={`mm2-sidebar-item${isActive ? " is-active" : ""}`}
                          onClick={() => setActiveSection(section.id)}
                        >
                          <Icon size={16} strokeWidth={1.5} />
                          <span>{section.label}</span>
                        </button>
                      );
                    })}
                  </nav>

                  <Mm2DetailPanel
                    key={activeSection}
                    title={activeMeta.label}
                    icon={<ActiveIcon size={14} />}
                    rows={sectionRows[activeSection]}
                  />
                </div>
              </div>

              <div
                className="mm2-org-chart"
                style={{
                  width: MM2_ORG_CHART_WIDTH,
                  height: MM2_ORG_CHART_PANEL_HEIGHT,
                  ["--mm2-org-chart-scale" as string]: MM2_ORG_CHART_SCALE,
                }}
              >
                <FormSection
                  title="조직도"
                  icon={<GitFork size={12} />}
                  className="content-form-section--org mm2-org-section"
                  bodyPadding="16px 0 12px"
                  clipBody={false}
                >
                  <div
                    className="mm2-org-chart-scale-host"
                    style={{ width: MM2_ORG_CHART_CONTENT_W, height: MM2_ORG_CHART_CONTENT_H }}
                  >
                    <div
                      className="mm2-org-chart-inner"
                      style={{
                        width: ORG_CHART_WIDTH,
                        height: ORG_CHART_MAX_SVG_HEIGHT,
                        ["--mm2-org-chart-scale" as string]: MM2_ORG_CHART_SCALE,
                      }}
                    >
                      <OrgChart memberId={member.id} memberName={member.name} />
                    </div>
                  </div>
                </FormSection>
              </div>
            </div>
          ) : activeTab === "주문서내역" ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              <OrderHistoryView memberId={memberId} />
            </div>
          ) : activeTab === "수당내역" ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              <AllowanceHistoryView memberId={memberId} />
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1" style={{ color: "var(--text-muted)", fontSize: 14, minHeight: 200 }}>
              {activeTab} 화면 준비 중입니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberManagementView({
  memberId,
  listOpen,
  formColumnWidth,
  activeTab,
  onTabChange,
}: {
  memberId: number;
  listOpen: boolean;
  formColumnWidth: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const member = getMemberById(memberId);
  const isMemberInfoTab = activeTab === "회원정보";
  const detailContentWidth = getDetailContentWidth(formColumnWidth);
  const contentAlignWidth = isMemberInfoTab && listOpen ? detailContentWidth : "100%";

  return (
    <div
      className="flex flex-col h-full w-full min-h-0"
      style={{
        width: isMemberInfoTab && listOpen ? getDetailPanelWidth(formColumnWidth) : "100%",
        minWidth: isMemberInfoTab && listOpen ? getDetailPanelWidth(formColumnWidth) : 0,
        flexShrink: isMemberInfoTab && listOpen ? 0 : undefined,
      }}
    >
      <div
        className={`flex flex-col flex-1 min-h-0${isMemberInfoTab ? " content-scroll" : ""}`}
        style={{
          overflowY: isMemberInfoTab ? "auto" : "hidden",
          overflowX: "hidden",
          background: "var(--surface-page)",
          padding: DETAIL_PANEL_PAD,
        }}
      >
        <div
          key={member.id}
          className={isMemberInfoTab ? undefined : "flex flex-col flex-1 min-h-0"}
          style={{
            width: contentAlignWidth,
            minWidth: isMemberInfoTab && listOpen ? detailContentWidth : 0,
            boxSizing: "border-box",
          }}
        >
          <MemberPageChrome activeTab={activeTab} onTabChange={onTabChange} />

          {isMemberInfoTab ? (
            <MemberInfoBody memberId={memberId} listOpen={listOpen} formColumnWidth={formColumnWidth} member={member} />
          ) : activeTab === "주문서내역" ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              <OrderHistoryView memberId={memberId} />
            </div>
          ) : activeTab === "수당내역" ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              <AllowanceHistoryView memberId={memberId} />
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1" style={{ color: "var(--text-muted)", fontSize: 14, minHeight: 200 }}>
              {activeTab} 화면 준비 중입니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberInfoBody({
  memberId,
  listOpen,
  formColumnWidth,
  member,
}: {
  memberId: number;
  listOpen: boolean;
  formColumnWidth: number;
  member: Member;
}) {
  const detailContentWidth = getDetailContentWidth(formColumnWidth);

  return (
        <div
          className="flex items-start"
          style={{
            width: listOpen ? detailContentWidth : "100%",
            minWidth: listOpen ? detailContentWidth : 0,
            gap: DETAIL_CONTENT_GAP,
            boxSizing: "border-box",
          }}
        >
        {/* 왼쪽 폼 — 최소 1000px 유지, 넓으면 자동 확장 */}
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
        <MemberHeaderCard member={member} />

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
                  <span style={{ fontSize: "12px", color: "var(--required-color)", fontWeight: 500 }}>* 회원번호</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input type="text" defaultValue={member.no} className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)", fontFamily: "monospace" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--required-color)", fontWeight: 500 }}>* 아이디</span>
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
                  <span style={{ fontSize: "12px", color: "var(--required-color)", fontWeight: 500 }}>* 회원 등록일자</span>
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
                  <span style={{ fontSize: "12px", color: "var(--required-color)", fontWeight: 500 }}>* 고객 이름/성</span>
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
                    <button type="button" className="member-form-action-chip member-form-action-chip--auth">✓ 실명인증</button>
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
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>메모</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input
                    key={`memo-${member.id}`}
                    defaultValue={`${member.name} · ${member.rank} · ${member.grade} · ${member.region} (${member.status})`}
                    className="w-full rounded outline-none transition-all duration-200"
                    style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }}
                    onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }}
                    onBlur={(e) => { e.target.style.background = "var(--input-background)"; }}
                  />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>세금신고번호</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
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
              <tr className="form-row-triple">
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>SwiftCode</span>
                </td>
                <td style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input defaultValue="SHBKKRSE" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>Branch Number</span>
                </td>
                <td style={{ padding: "3px 10px 3px 0", verticalAlign: "middle" }}>
                  <input defaultValue="0234" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>은행통합 거래번호</span>
                </td>
                <td style={{ padding: "3px 0 3px 0", verticalAlign: "middle" }}>
                  <div className="flex gap-1 items-center">
                    <input defaultValue="88012345" className="flex-1 min-w-0 rounded outline-none transition-all duration-200" style={{ fontSize: 12, padding: "3px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                    <span className="member-form-action-chip member-form-action-chip--verified">✓ 인증완료</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </FormSection>

        {/* 상위 회원과의 관계 + 소속 그룹 정보 */}
        <FormSection title="상위 회원과의 관계" icon={<Users size={12} />}>
          <div className="member-relation-row">
            <div className="member-relation-segment">
              <div className="member-relation-group">
                <span style={{ fontSize: "12px", color: "var(--required-color)", fontWeight: 500 }}>* 추천인</span>
                <input readOnly value="100012" className="member-relation-input-id rounded outline-none" />
                <input readOnly value="박민수" className="member-relation-input-name rounded outline-none" />
                <span style={{ fontSize: 12, padding: "2px 8px", background: "var(--accent-light)", color: "var(--required-color)", border: "1px solid var(--accent-border)", borderRadius: 4, whiteSpace: "nowrap" }}>38명</span>
                <button className="rounded p-1 flex items-center justify-center" style={{ background: "var(--surface-button-muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
              </div>
            </div>
            <div className="member-relation-segment">
              <div className="member-relation-group">
                <span style={{ fontSize: "12px", color: "var(--required-color)", fontWeight: 500 }}>* 후원인</span>
                <input readOnly value="100008" className="member-relation-input-id rounded outline-none" />
                <input readOnly value="이정환" className="member-relation-input-name rounded outline-none" />
                <span style={{ fontSize: 12, padding: "2px 8px", background: "var(--accent-light)", color: "var(--required-color)", border: "1px solid var(--accent-border)", borderRadius: 4, whiteSpace: "nowrap" }}>12명</span>
                <button className="rounded p-1 flex items-center justify-center" style={{ background: "var(--surface-button-muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
              </div>
            </div>
            <div className="member-relation-segment">
              <div className="member-relation-group">
                <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 600 }}>소속 그룹 정보</span>
                <span style={{ fontSize: "12px", color: "var(--required-color)", fontWeight: 500 }}>* 센터</span>
                <div className="relative member-relation-select">
                  <select
                    className="w-full rounded py-1.5 text-sm outline-none appearance-none"
                    style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)", paddingLeft: 10, paddingRight: 28, fontSize: 13 }}
                  >
                    <option>본사</option>
                    <option>광주 수완</option>
                    <option>서울 강남</option>
                    <option>부산 해운대</option>
                  </select>
                  <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ width: 24 }}>
                    <ChevronDown size={13} style={{ color: "var(--muted-foreground)" }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="member-relation-segment">
              <div className="member-relation-group">
                <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>직급</span>
                <div className="relative member-relation-select">
                  <select
                    className="w-full rounded py-1.5 text-sm outline-none appearance-none"
                    style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)", paddingLeft: 10, paddingRight: 28, fontSize: 13 }}
                  >
                    <option>다이아몬드</option>
                    <option>플래티넘</option>
                    <option>골드</option>
                    <option>실버</option>
                  </select>
                  <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ width: 24 }}>
                    <ChevronDown size={13} style={{ color: "var(--muted-foreground)" }} />
                  </div>
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
                  style={{ accentColor: "var(--checkbox-accent)", width: 14, height: 14, cursor: "pointer" }}
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
            style={{ fontSize: 12, padding: "7px 13px", background: "var(--save-btn-bg, #2843b8)", color: "var(--on-accent)", border: "none" }}
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

    </div>
  );
}

// ─────────────────────────────────────────────
// TopNav
// ─────────────────────────────────────────────

const mainMenus = ["기초관리", "회원관리", "회원관리2", "주문관리", "수당관리", "출고관리", "옵션"];

type MemberSubMenuGroup = {
  title: string;
  items: string[];
};

const memberSubMenuGroups: MemberSubMenuGroup[] = [
  {
    title: "회원관리",
    items: ["회원등록", "조직도인쇄"],
  },
  {
    title: "세미나 관리",
    items: ["세미나 종류", "세미나 참석 관리"],
  },
  {
    title: "리포트",
    items: ["판매원 리포트", "조직 구성원", "직급 히스토리", "사용자 직급할당", "사용자 설정"],
  },
  {
    title: "상담 관리",
    items: [],
  },
];

const subTabs = ["회원정보", "주문서내역", "수당내역", "로그히스토리", "상담내역", "마일리지", "사용자설정", "마이페이지"];

const memberInfoToolbarItems = [
  { label: "새로 만들기", icon: FilePlus },
  { label: "저장", icon: Save },
  { label: "삭제", icon: Trash2 },
  null,
  { label: "조직도", icon: GitFork },
  { label: "직급조정", icon: Award },
  { label: "사업자정보", icon: Briefcase },
  { label: "주문서", icon: ShoppingCart },
  { label: "메세지", icon: MessageCircle },
  { label: "새비밀번호", icon: Key },
  { label: "인쇄", icon: Printer },
] as const;

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

function HistoryItemChip({ item, isActive, onSelect, onRemove }: HistoryItemButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`visit-history-chip group${isActive ? " is-active" : ""}`}
    >
      <span className="visit-history-chip-screen">{item.screen}</span>
      <span className="visit-history-chip-meta">
        <span className="visit-history-chip-no">{item.memberNo}</span>
        <span className="visit-history-chip-sep">·</span>
        <span className="visit-history-chip-name">{item.memberName}</span>
      </span>
      {onRemove && (
        <span
          role="presentation"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="visit-history-chip-remove"
        >
          ×
        </span>
      )}
    </button>
  );
}

interface VisitHistoryBarProps {
  expanded: boolean;
  onToggleExpand: () => void;
  pinned: PageHistoryItem[];
  recent: PageHistoryItem[];
  activeId: string;
  onSelect: (item: PageHistoryItem) => void;
  onPinCurrent: () => void;
  onUnpin: (id: string) => void;
}

function BarTooltip({ label }: { label: string }) {
  return (
    <span
      className="visit-history-tooltip"
      style={{ background: "var(--tooltip-bg)", color: "var(--tooltip-fg)", fontSize: "13px" }}
    >
      {label}
    </span>
  );
}

function VisitHistoryIconButton({
  label,
  onClick,
  children,
  accent = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`visit-history-icon-btn group${accent ? " is-accent" : ""}`}
      aria-label={label}
    >
      {children}
      <BarTooltip label={label} />
    </button>
  );
}

function VisitHistoryBar({
  expanded,
  onToggleExpand,
  pinned,
  recent,
  activeId,
  onSelect,
  onPinCurrent,
  onUnpin,
}: VisitHistoryBarProps) {
  const height = expanded ? HISTORY_BAR_EXPANDED_HEIGHT : HISTORY_BAR_COLLAPSED_HEIGHT;

  if (!expanded) {
    return (
      <div
        className="visit-history-bar"
        style={{ height, minHeight: height }}
      >
        <div className="visit-history-bar-collapsed">
          <VisitHistoryIconButton label="방문 기록 펼치기" onClick={onToggleExpand}>
            <ChevronUp size={14} style={{ color: "var(--text-muted)" }} />
          </VisitHistoryIconButton>
          <VisitHistoryIconButton label="현재 화면 고정" onClick={onPinCurrent} accent>
            <Pin size={12} style={{ color: "var(--required-color, #2843b8)" }} />
          </VisitHistoryIconButton>
          <button
            type="button"
            onClick={onToggleExpand}
            className="visit-history-collapsed-badge visit-history-collapsed-badge--pinned"
          >
            <Pin size={11} style={{ color: "var(--required-color, #2843b8)" }} />
            <span>{pinned.length}</span>
          </button>
          <button
            type="button"
            onClick={onToggleExpand}
            className="visit-history-collapsed-badge"
          >
            <Clock size={11} style={{ color: "var(--text-muted)" }} />
            <span>{recent.length}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="visit-history-bar is-expanded"
      style={{ height, minHeight: height }}
    >
      <div className="visit-history-bar-inner">
        <div className="visit-history-bar-lead">
          <div className="visit-history-bar-actions">
            <VisitHistoryIconButton label="접기" onClick={onToggleExpand}>
              <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
            </VisitHistoryIconButton>
            <VisitHistoryIconButton label="현재 화면 고정" onClick={onPinCurrent} accent>
              <Pin size={12} style={{ color: "var(--required-color, #2843b8)" }} />
            </VisitHistoryIconButton>
          </div>
          <div className="visit-history-bar-title">방문 기록</div>
        </div>

        <div className="visit-history-bar-divider visit-history-bar-divider--lead" aria-hidden />

        <div className="visit-history-bar-section visit-history-bar-section--pinned">
          <span className="visit-history-bar-section-label">
            <Pin size={11} style={{ color: "var(--required-color, #2843b8)" }} />
            고정
          </span>
          <div className="visit-history-bar-scroll">
            {pinned.length === 0 ? (
              <span className="visit-history-empty">고정된 화면 없음</span>
            ) : (
              pinned.map((item) => (
                <HistoryItemChip
                  key={item.id}
                  item={item}
                  isActive={item.id === activeId}
                  onSelect={onSelect}
                  onRemove={onUnpin}
                />
              ))
            )}
          </div>
        </div>

        <div className="visit-history-bar-divider" aria-hidden />

        <div className="visit-history-bar-section visit-history-bar-section--recent">
          <span className="visit-history-bar-section-label">
            <Clock size={11} style={{ color: "var(--text-muted)" }} />
            최근
          </span>
          <div className="visit-history-bar-scroll">
            {recent.length === 0 ? (
              <span className="visit-history-empty">방문한 화면이 여기에 표시됩니다</span>
            ) : (
              recent.map((item) => (
                <HistoryItemChip
                  key={item.id}
                  item={item}
                  isActive={item.id === activeId}
                  onSelect={onSelect}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TopNavProps {
  activeMainMenu: string;
  onMainMenuChange: (menu: string) => void;
  memberSubMenuOpen: boolean;
  onMemberSubMenuOpenChange: (open: boolean) => void;
  activeMemberSubMenu: string;
  onMemberSubMenuChange: (item: string) => void;
}

function KoreaFlagIcon() {
  return (
    <svg className="nav-korea-flag-icon" viewBox="0 0 36 24" width="22" height="15" aria-hidden>
      <rect width="36" height="24" fill="#ffffff" />
      <rect width="36" height="24" fill="none" stroke="rgba(0, 0, 0, 0.15)" strokeWidth="0.6" />
      <g transform="translate(18 12)">
        <circle r="6" fill="#c8102e" />
        <path d="M0,-6 A6,6 0 0,1 0,6 A3,3 0 0,0 0,-6 Z" fill="#003478" />
        <path d="M0,6 A6,6 0 0,1 0,-6 A3,3 0 0,0 0,6 Z" fill="#c8102e" />
        <circle cy="-3" r="3" fill="#c8102e" />
        <circle cy="3" r="3" fill="#003478" />
      </g>
      <g fill="#000000">
        <rect x="3" y="3" width="1.2" height="6" />
        <rect x="3" y="3" width="6" height="1.2" />
        <rect x="7.8" y="3" width="1.2" height="6" />
        <rect x="3" y="7.8" width="6" height="1.2" />
        <rect x="27" y="3" width="1.2" height="6" />
        <rect x="27" y="3" width="6" height="1.2" />
        <rect x="31.8" y="3" width="1.2" height="6" />
        <rect x="27" y="7.8" width="6" height="1.2" />
        <rect x="3" y="15" width="1.2" height="6" />
        <rect x="3" y="15" width="6" height="1.2" />
        <rect x="7.8" y="15" width="1.2" height="6" />
        <rect x="3" y="19.8" width="6" height="1.2" />
        <rect x="27" y="15" width="1.2" height="6" />
        <rect x="27" y="15" width="6" height="1.2" />
        <rect x="31.8" y="15" width="1.2" height="6" />
        <rect x="27" y="19.8" width="6" height="1.2" />
      </g>
    </svg>
  );
}

interface MemberPageChromeProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function MemberPageChrome({ activeTab, onTabChange }: MemberPageChromeProps) {
  const isMemberInfoTab = activeTab === "회원정보";

  return (
    <div className="member-page-chrome">
      <div className="detail-tab-bar">
        <div className="detail-tab-list">
          {subTabs.map((tab, i) => {
            const isActive = tab === activeTab;
            const prevTab = i > 0 ? subTabs[i - 1] : null;
            const showDivider = i > 0 && !isActive && prevTab !== activeTab;
            return (
              <React.Fragment key={tab}>
                {showDivider && <span className="detail-tab-divider" aria-hidden>|</span>}
                <button
                  type="button"
                  className={`detail-tab${isActive ? " is-active" : ""}`}
                  onClick={() => onTabChange(tab)}
                >
                  {tab}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      {isMemberInfoTab && (
        <div className="member-info-toolbar">
          {memberInfoToolbarItems.map((item, i) =>
            item === null ? (
              <div key={`sep-${i}`} className="member-info-toolbar-separator" aria-hidden />
            ) : (
              <button key={item.label} type="button" className="member-info-toolbar-item">
                <item.icon size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
                <span>{item.label}</span>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function TopNav({
  activeMainMenu,
  onMainMenuChange,
  memberSubMenuOpen,
  onMemberSubMenuOpenChange,
  activeMemberSubMenu,
  onMemberSubMenuChange,
}: TopNavProps) {
  const memberNavRef = useRef<HTMLDivElement>(null);
  const workNotificationCount = 2;

  useEffect(() => {
    if (!memberSubMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (memberNavRef.current && !memberNavRef.current.contains(e.target as Node)) {
        onMemberSubMenuOpenChange(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [memberSubMenuOpen, onMemberSubMenuOpenChange]);

  return (
    <div className="top-nav-shell" style={{ flexShrink: 0, minWidth: APP_MIN_WIDTH }}>
      {/* Main nav */}
      <div
        className="flex items-stretch flex-nowrap px-4"
        style={{ background: "var(--nav-bg, #0f1d32)", borderBottom: "1px solid var(--nav-border, #0a1526)", height: 40 }}
      >
        <div className="flex items-center gap-2 mr-6 shrink-0">
          <div
            className="flex items-center justify-center rounded"
            style={{ width: 28, height: 28, background: "var(--logo-bg, #2843b8)", fontSize: 12, fontWeight: 700, color: "var(--on-accent)" }}
          >
            VB
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--nav-text, #fff)" }}>(주)비아블</span>
          <span style={{ fontSize: 12, color: "var(--nav-text-muted, rgba(255,255,255,0.6))", marginLeft: 4 }}>ERP</span>
        </div>
        <div className="flex items-stretch flex-1 min-w-0 self-stretch">
          {mainMenus.map((menu) => {
            const isActive = menu === activeMainMenu;
            const isMemberMenu = menu === "회원관리";

            if (isMemberMenu) {
              return (
                <div key={menu} ref={memberNavRef} className="main-nav-item-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        onMemberSubMenuOpenChange(!memberSubMenuOpen);
                      } else {
                        onMainMenuChange(menu);
                        onMemberSubMenuOpenChange(true);
                      }
                    }}
                    className={`main-nav-item${isActive ? " is-active" : ""}${memberSubMenuOpen && isActive ? " is-dropdown-open" : ""}`}
                    aria-expanded={memberSubMenuOpen && isActive}
                    aria-haspopup="menu"
                  >
                    {menu}
                  </button>
                  {memberSubMenuOpen && isActive && (
                    <div className="main-nav-dropdown main-nav-dropdown--grouped" role="menu">
                      {memberSubMenuGroups.map((group) => (
                        <div key={group.title} className="main-nav-dropdown-group">
                          <div className="main-nav-dropdown-group-title">{group.title}</div>
                          {group.items.map((item) => (
                            <button
                              key={item}
                              type="button"
                              role="menuitem"
                              className="main-nav-dropdown-item"
                              onClick={() => {
                                onMemberSubMenuChange(item);
                                onMemberSubMenuOpenChange(false);
                              }}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={menu}
                type="button"
                onClick={() => {
                  onMainMenuChange(menu);
                  onMemberSubMenuOpenChange(false);
                }}
                className={`main-nav-item${isActive ? " is-active" : ""}`}
              >
                {menu}
              </button>
            );
          })}
        </div>
        {/* Right side: user info */}
        <div className="flex items-center gap-3 ml-4 shrink-0 whitespace-nowrap">
          <button
            type="button"
            className="nav-work-notification"
            aria-label="작업 알림"
            title="작업 알림"
          >
            <Bell size={17} fill="currentColor" stroke="currentColor" strokeWidth={0} />
            {workNotificationCount > 0 && (
              <span className="nav-work-notification-badge" aria-hidden>
                <span className="nav-work-notification-badge-num">
                  {workNotificationCount > 9 ? "9+" : workNotificationCount}
                </span>
              </span>
            )}
          </button>
          <span style={{ fontSize: 14, color: "var(--nav-text, #fff)" }}>디자인</span>
          <button type="button" className="nav-logout-btn">로그아웃</button>
          <button type="button" className="nav-locale-select" aria-label="국가 선택 KR">
            <KoreaFlagIcon />
            <span>KR</span>
          </button>
        </div>
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
  { key: "deep-purple", color: "#0284c7", label: "라이트" },
  { key: "dark",        color: "#0f1117", label: "다크" },
];

interface SidebarProps {
  showMemberNav: boolean;
  activePanel: string | null;
  onPanelToggle: () => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}

function Sidebar({ showMemberNav, activePanel, onPanelToggle, theme, onThemeChange }: SidebarProps) {
  const visibleNavItems = showMemberNav
    ? navItems
    : navItems.filter((item) => item.key !== "members");

  return (
    <div
      className="app-sidebar flex flex-col items-center py-4 gap-1"
      style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH, height: "100%", background: "var(--sidebar-bg, #eceef2)", borderRight: "1px solid var(--border)", flexShrink: 0 }}
    >
      <div className="flex flex-col items-center gap-1 flex-1">
        {visibleNavItems.map((item) => {
          const isActive = activePanel === item.key;
          return (
            <button
              key={item.key}
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
  const [activeMainMenu, setActiveMainMenu] = useState("회원관리");
  const [memberSubMenuOpen, setMemberSubMenuOpen] = useState(false);
  const [activeMemberSubMenu, setActiveMemberSubMenu] = useState("회원등록");
  const [theme, setTheme] = useState<Theme>("deep-purple");
  const [historyRailExpanded, setHistoryRailExpanded] = useState(true);
  const [pinnedPages, setPinnedPages] = useState<PageHistoryItem[]>([
    { id: "수당내역-1", screen: "수당내역", memberId: 1, memberNo: "N26431021", memberName: "한미채" },
  ]);
  const [recentPages, setRecentPages] = useState<PageHistoryItem[]>([
    { id: "회원정보-1", screen: "회원정보", memberId: 1, memberNo: "N26431021", memberName: "한미채" },
    { id: "주문서내역-1", screen: "주문서내역", memberId: 1, memberNo: "N26431021", memberName: "한미채" },
    { id: "수당내역-1", screen: "수당내역", memberId: 1, memberNo: "N26431021", memberName: "한미채" },
    { id: "로그히스토리-1", screen: "로그히스토리", memberId: 1, memberNo: "N26431021", memberName: "한미채" },
    { id: "상담내역-1", screen: "상담내역", memberId: 1, memberNo: "N26431021", memberName: "한미채" },
    { id: "주문서내역-2", screen: "주문서내역", memberId: 2, memberNo: "N26482827", memberName: "황기봉" },
  ]);
  const [appContentWidth, setAppContentWidth] = useState(0);
  const appContentRef = useRef<HTMLDivElement>(null);
  const resizing = useRef(false);

  const memberListNavEnabled =
    (activeMainMenu === "회원관리" && activeMemberSubMenu === "회원등록") ||
    activeMainMenu === "주문관리";
  const memberListOpen = memberListNavEnabled && listOpen;

  const formColumnWidth = useMemo(() => {
    if (!memberListOpen || appContentWidth <= 0) {
      return FORM_COLUMN_WIDTH_MIN;
    }
    const availableDetail = appContentWidth - listWidth;
    return calcFormColumnWidth(availableDetail);
  }, [memberListOpen, listWidth, appContentWidth]);

  const isOrderManagement = activeMainMenu === "주문관리";
  const isMm2MemberInfoTab = activeMainMenu === "회원관리2" && activeTab === "회원정보";
  const isMemberInfoTab = activeMainMenu === "회원관리" && activeTab === "회원정보";

  const detailPanelMinWidth = useMemo(() => {
    if (isOrderManagement) {
      return 0;
    }
    if (isMm2MemberInfoTab) {
      return getMm2DetailPanelWidth(MM2_INFO_GROUP_WIDTH);
    }
    if (isMemberInfoTab) {
      return getDetailPanelWidth(formColumnWidth);
    }
    return ORDER_PANEL_MIN_WIDTH;
  }, [isOrderManagement, isMm2MemberInfoTab, isMemberInfoTab, formColumnWidth]);

  const isFixedDetailWidth =
    memberListOpen &&
    (isOrderManagement ||
      (activeMainMenu === "회원관리" && !isMemberInfoTab) ||
      (activeMainMenu === "회원관리2" && !isMm2MemberInfoTab));

  const contentRowMinWidth = memberListOpen
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

  const handleMainMenuChange = useCallback((menu: string) => {
    setActiveMainMenu(menu);
    const keepsMemberListNav =
      menu === "주문관리" ||
      (menu === "회원관리" && activeMemberSubMenu === "회원등록");
    if (!keepsMemberListNav) {
      setListOpen(false);
    }
    if (menu !== "회원관리") {
      setMemberSubMenuOpen(false);
    }
  }, [activeMemberSubMenu]);

  const handleMemberSubMenuChange = useCallback((item: string) => {
    setActiveMemberSubMenu(item);
    setActiveMainMenu("회원관리");
    if (item === "회원등록") {
      setActiveTab("회원정보");
    } else {
      setListOpen(false);
    }
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
      style={{ height: "100vh", width: "100%", overflowX: "hidden", overflowY: "hidden", background: "var(--surface-page)" }}
    >
      <div
        className="flex flex-col"
        style={{ minWidth: APP_MIN_WIDTH, width: "100%", height: "100%", flex: "1 0 auto" }}
      >
      <TopNav
        activeMainMenu={activeMainMenu}
        onMainMenuChange={handleMainMenuChange}
        memberSubMenuOpen={memberSubMenuOpen}
        onMemberSubMenuOpenChange={setMemberSubMenuOpen}
        activeMemberSubMenu={activeMemberSubMenu}
        onMemberSubMenuChange={handleMemberSubMenuChange}
      />

      {/* 본문 + 하단 방문기록 */}
      <div
        className="app-body"
        style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0, overflow: "hidden" }}
      >
        <div
          className="app-main"
          style={{ flex: 1, display: "flex", minHeight: 0, minWidth: 0, overflow: "hidden" }}
        >
        <Sidebar
          showMemberNav={memberListNavEnabled}
          activePanel={memberListOpen ? "members" : null}
          onPanelToggle={() => setListOpen((v) => !v)}
          theme={theme}
          onThemeChange={setTheme}
        />

        <div
          ref={appContentRef}
          className="app-content"
          style={{ flex: 1, overflowX: memberListOpen ? "auto" : "hidden", overflowY: "hidden", minHeight: 0, minWidth: 0 }}
        >
          <div
            className="app-content-row"
            style={{
              display: "flex",
              height: "100%",
              width: "100%",
              minWidth: memberListOpen ? contentRowMinWidth : 0,
              flexShrink: 0,
            }}
          >

        {/* 왼쪽 회원목록 패널 — 회원등록 화면에서만 */}
        {memberListNavEnabled && (
        <div
          className="member-list-panel"
          style={{
            width: memberListOpen ? listWidth : 0,
            minWidth: memberListOpen ? listWidth : 0,
            flexShrink: 0,
            flexGrow: 0,
            overflow: "hidden",
            transition: isListResizing ? "none" : LAYOUT_TRANSITION,
            background: "var(--surface-panel)",
            position: "relative",
            height: "100%",
          }}
        >
          <div style={{ width: memberListOpen ? listWidth : MEMBER_LIST_MAX_WIDTH, height: "100%" }}>
            <MemberTable
              selectedId={selectedMember}
              onSelect={setSelectedMember}
              listOpen={memberListOpen}
              listWidth={listWidth}
            />
          </div>
          {memberListOpen && (
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
        )}

        {/* 오른쪽 상세 패널 — 절대 축소 불가 */}
        <div
          className="app-content-detail"
          style={{
            width: isFixedDetailWidth
              ? "100%"
              : memberListOpen
                ? detailPanelMinWidth
                : "100%",
            minWidth: memberListOpen
              ? isOrderManagement
                ? 0
                : isFixedDetailWidth
                  ? ORDER_PANEL_MIN_WIDTH
                  : detailPanelMinWidth
              : 0,
            flexShrink: memberListOpen ? 0 : 1,
            flexGrow: memberListOpen ? (isFixedDetailWidth ? 1 : 0) : 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            background: "var(--surface-page)",
            overflow: "hidden",
          }}
        >
          {isOrderManagement ? (
            <OrderManagementView member={getMemberById(selectedMember)} />
          ) : activeMainMenu === "회원관리2" ? (
            <MemberManagement2View
              memberId={selectedMember}
              listOpen={memberListOpen}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          ) : activeMainMenu === "회원관리" && activeMemberSubMenu !== "회원등록" ? (
            <div
              className="member-subpage-placeholder"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: 32,
                color: "var(--text-muted)",
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-body)" }}>{activeMemberSubMenu}</span>
              <span style={{ fontSize: 14 }}>화면 준비 중입니다.</span>
            </div>
          ) : (
            <MemberManagementView
              memberId={selectedMember}
              listOpen={memberListOpen}
              formColumnWidth={formColumnWidth}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
        </div>
          </div>
        </div>
        </div>

        <VisitHistoryBar
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
