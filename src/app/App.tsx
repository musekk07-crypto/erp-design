import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  User, Shield, GitFork, CreditCard, Users, Info,
  BarChart2, ShoppingCart, Settings, Bell, HelpCircle, Home,
  Pin, Clock, ChevronLeft, ChevronRight, RefreshCw,
  FilePlus, Save, Trash2, Award, Briefcase, MessageCircle, Key, Printer,
  Globe, Landmark, Contact, CheckCircle2, Phone, ExternalLink, Camera, X,
  LayoutDashboard, Plus, UserPlus,
} from "lucide-react";
import { RecommenderSelectPopup } from "./components/RecommenderSelectPopup";
import { RankAdjustPopup } from "./components/RankAdjustPopup";
import { BusinessInfoPopup } from "./components/BusinessInfoPopup";
import { MemberOrgChartView } from "./components/MemberOrgChartView";
import { MessageSendPopup } from "./components/MessageSendPopup";
import { NewPasswordPopup } from "./components/NewPasswordPopup";
import { PrintPopup } from "./components/PrintPopup";
import { MemberSavePopup } from "./components/MemberSavePopup";
import { OrderManagementView, ORDER_MGMT_DETAIL_MIN_WIDTH } from "./components/OrderManagementView";
import { OrderListManageView } from "./components/OrderListManageView";
import { HomeDesktopView, type HomeShortcutKey } from "./components/HomeDesktopView";
import { BasicManagementView } from "./components/BasicManagementView";
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
const MEMBERS_RAIL_WIDTH = 36;
const MEMBER_LIST_MIN_WIDTH = 320;
const MEMBER_LIST_PAGE_SIZE = 15;
const FORM_COLUMN_WIDTH_MIN = 1000;
const ORDER_PANEL_MIN_WIDTH = 1520;
const APP_MIN_WIDTH = 1280;
const LIST_PANEL_TRANSITION_MS = 250;
const LAYOUT_TRANSITION = `width ${LIST_PANEL_TRANSITION_MS}ms ease, min-width ${LIST_PANEL_TRANSITION_MS}ms ease`;
const ORG_CARD_W = 167;
const ORG_CARD_H = 138;
const ORG_CHILD_CHIP_H = 40;
const ORG_COL_GAP = 16;
const ORG_HPAD = 6;
const ORG_FOREIGN_PAD = 2;
const ORG_CHART_SIDE_PAD = 20;
const ORG_CHART_CONTENT_TOP = 12;

function getOrgChartTopShift(contentTop: number) {
  return Math.max(ORG_CHART_CONTENT_TOP, ORG_CHART_CONTENT_TOP - contentTop);
}

function calcOrgChartMaxSvgHeight(maxChildren = 11) {
  const extraH = 34;
  const cardH = ORG_CARD_H;
  const childChipH = ORG_CHILD_CHIP_H;
  const gap = 7;
  const col2Heights = [cardH, cardH, extraH];
  const totalCol2H = col2Heights.reduce((sum, h) => sum + h, 0) + gap * (col2Heights.length - 1);
  const col2Ys: number[] = [];
  let y = 0;
  col2Heights.forEach((h) => {
    col2Ys.push(y + h / 2);
    y += h + gap;
  });
  const selfCenterY = col2Ys[0];
  const col3Count = maxChildren + 1;
  const stackH = childChipH * maxChildren + extraH + gap * (col3Count - 1);
  const col3Top = selfCenterY - childChipH / 2;
  const col3Bottom = col3Top + stackH;
  const contentTop = Math.min(0, col3Top);
  const yShift = getOrgChartTopShift(contentTop);
  const contentH = Math.max(totalCol2H, col3Bottom);
  return contentH + yShift + 8;
}

const ORG_CHART_SVG_WIDTH = ORG_HPAD * 2 + ORG_CARD_W * 3 + ORG_COL_GAP * 2 + ORG_FOREIGN_PAD;
const ORG_CHART_WIDTH = ORG_CHART_SVG_WIDTH + ORG_CHART_SIDE_PAD * 2;
const ORG_CHART_MAX_SVG_HEIGHT = calcOrgChartMaxSvgHeight(5);

function calcOrgChartLinearSvgHeight() {
  const yShift = getOrgChartTopShift(0);
  return ORG_CARD_H + yShift + 8;
}

const ORG_CHART_LINEAR_SVG_HEIGHT = calcOrgChartLinearSvgHeight();
const ORG_CHART_TAB_BAR_H = 34;
const ORG_CHART_TABBED_CONTENT_HEIGHT = ORG_CHART_TAB_BAR_H + ORG_CHART_MAX_SVG_HEIGHT;
const ORG_CHART_SECTION_HEADER_H = 38;
const ORG_CHART_BODY_PAD_V = 28;
const ORG_CHART_PANEL_HEIGHT = ORG_CHART_SECTION_HEADER_H + ORG_CHART_BODY_PAD_V + ORG_CHART_MAX_SVG_HEIGHT;
const MM2_ORG_CHART_SCALE = 686 / ORG_CHART_WIDTH;
const MM2_ORG_CHART_CONTENT_W = Math.ceil(ORG_CHART_WIDTH * MM2_ORG_CHART_SCALE);
const MM2_ORG_CHART_CONTENT_H = Math.ceil(ORG_CHART_TABBED_CONTENT_HEIGHT * MM2_ORG_CHART_SCALE);
const MM2_ORG_CHART_WIDTH = MM2_ORG_CHART_CONTENT_W + 2;
const ORG_CARD_NAME_FONT_SIZE = 16 / MM2_ORG_CHART_SCALE;
const MM2_ORG_CHART_PANEL_HEIGHT =
  ORG_CHART_SECTION_HEADER_H + ORG_CHART_BODY_PAD_V + MM2_ORG_CHART_CONTENT_H + 2;
const DETAIL_CONTENT_GAP = 12;
const DETAIL_PANEL_PAD = 12;
const HISTORY_BAR_COLLAPSED_HEIGHT = 40;
const HISTORY_BAR_EXPANDED_HEIGHT = 48;
const RECENT_HISTORY_MAX = 10;

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

const ORG_SELF_ACCENT = "var(--org-self-accent, var(--org-link, #007aff))";
const LABEL_GRAY = "var(--org-label)";
const BORDER_GRAY = "var(--org-border)";
const CARD_W = ORG_CARD_W;
const CARD_H = ORG_CARD_H;
const CHILD_CHIP_H = ORG_CHILD_CHIP_H;
const EXTRA_H = 34;
const GAP = 7;
const COL_GAP = ORG_COL_GAP;

const ORG_CARD_LABEL_FONT_SIZE = 14;
const ORG_CARD_META_FONT_SIZE = 14;

function resolveOrgMemberNo(id: number, fallback?: string) {
  const ref = members.find((m) => m.id === id);
  return ref?.no ?? fallback ?? `N2643${String(id).padStart(4, "0")}`;
}

function createOrgNode(
  label: string,
  name: string,
  id: number,
  grade: string,
  options?: { memberNo?: string; displayId?: number; regDate?: string; points?: string },
): OrgNode {
  return {
    label,
    name,
    id,
    memberNo: options?.memberNo ?? resolveOrgMemberNo(id),
    grade,
    displayId: options?.displayId,
    regDate: options?.regDate,
    points: options?.points,
  };
}

function resolveOrgMemberRecord(id: number, name: string) {
  return members.find((m) => m.id === id) ?? members.find((m) => m.name === name);
}

function isOrgMemberWithdrawn(id: number, name: string) {
  return resolveOrgMemberRecord(id, name)?.status === "탈퇴";
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

function Card({
  label,
  name,
  memberNo,
  grade,
  id,
  displayId,
  regDate,
  points,
  isSelf = false,
}: OrgNode & { isSelf?: boolean }) {
  const hover = useOrgChartHover();
  const rootRef = useRef<HTMLDivElement>(null);
  const isWithdrawn = isOrgMemberWithdrawn(id, name);
  const useOrgLayout = regDate != null && points != null;
  const metaStyle: React.CSSProperties = {
    fontSize: ORG_CARD_META_FONT_SIZE,
    color: "var(--org-text-muted)",
    lineHeight: 1.4,
    fontWeight: 400,
    width: "100%",
    textAlign: "left",
  };

  return (
    <div
      ref={rootRef}
      className={`org-chart-card org-chart-card--interactive${isSelf ? " org-chart-card--self" : ""}${isWithdrawn ? " org-chart-card--withdrawn" : ""}`}
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
      borderRadius: 0,
      overflow: "visible",
      background: isSelf ? "var(--org-self-bg, rgba(0, 122, 255, 0.08))" : "var(--org-card-bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "center",
      textAlign: "left",
      padding: "10px 12px",
      position: "relative",
      boxSizing: "border-box",
      flexShrink: 0,
      gap: 3,
    }}
    >
      <div
        className="org-chart-card__label"
        style={{
          fontSize: ORG_CARD_LABEL_FONT_SIZE,
          color: isSelf ? ORG_SELF_ACCENT : LABEL_GRAY,
          width: "100%",
          textAlign: "left",
          fontWeight: isSelf ? 600 : 400,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span>{isSelf ? "나" : label}</span>
        {isSelf && (
          <span
            className="org-chart-card__self-badge"
            style={{
              background: ORG_SELF_ACCENT,
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1.2,
              padding: "1px 8px",
              borderRadius: 0,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            나·자신
          </span>
        )}
      </div>
      {useOrgLayout ? (
        <>
          <div
            className="org-chart-card__name"
            style={{
              fontSize: ORG_CARD_NAME_FONT_SIZE,
              fontWeight: 700,
              color: isSelf ? ORG_SELF_ACCENT : "var(--org-text)",
              width: "100%",
              textAlign: "left",
            }}
          >
            {name}({displayId ?? id})
          </div>
          <div className="org-chart-card__meta" style={metaStyle}>{regDate}</div>
          <div className="org-chart-card__meta" style={metaStyle}>{grade}</div>
          <div className="org-chart-card__meta" style={metaStyle}>{points}</div>
        </>
      ) : (
        <>
          <div
            className="org-chart-card__name"
            style={{
              fontSize: ORG_CARD_NAME_FONT_SIZE,
              fontWeight: 700,
              color: isSelf ? ORG_SELF_ACCENT : "var(--org-text)",
              width: "100%",
              textAlign: "left",
            }}
          >
            {name}
          </div>
          <div className="org-chart-card__meta" style={metaStyle}>{memberNo}</div>
          <div className="org-chart-card__meta" style={metaStyle}>{grade}</div>
        </>
      )}
    </div>
  );
}

function ExtraBox({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <div
      className={`org-chart-card org-chart-card--extra${onClick ? " org-chart-card--clickable" : ""}`}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
      width: CARD_W, height: EXTRA_H,
      border: `1px dashed ${BORDER_GRAY}`,
      borderRadius: 0,
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

function ChildChip({ name, id, displayId }: { name: string; id: number; displayId?: number }) {
  const hover = useOrgChartHover();
  const rootRef = useRef<HTMLDivElement>(null);
  const memberNo = resolveOrgMemberNo(id);
  const member = resolveOrgMemberRecord(id, name);
  const grade = member?.grade ?? "멤버";
  const isWithdrawn = member?.status === "탈퇴";

  return (
    <div
      ref={rootRef}
      className={`org-chart-card org-chart-card--chip org-chart-card--interactive${isWithdrawn ? " org-chart-card--withdrawn" : ""}`}
      onMouseEnter={() => {
        if (!hover || !rootRef.current) return;
        hover.cancelHide();
        hover.showFromElement(buildOrgMemberDetail(id, name, memberNo, grade), rootRef.current);
      }}
      onMouseLeave={() => hover?.scheduleHide()}
      style={{
      border: `1px solid ${BORDER_GRAY}`,
      borderRadius: 0,
      overflow: "hidden",
      background: "var(--org-card-bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      height: CHILD_CHIP_H,
      width: CARD_W,
      padding: "0 12px",
      fontSize: ORG_CARD_NAME_FONT_SIZE,
      fontWeight: 700,
      color: isWithdrawn ? "var(--org-text-withdrawn, #9ca3af)" : "var(--org-text)",
      boxSizing: "border-box",
      textAlign: "left",
    }}
    >
      {name} ({displayId ?? id})
    </div>
  );
}

type OrgNode = {
  label: string;
  name: string;
  id: number;
  memberNo: string;
  grade: string;
  displayId?: number;
  regDate?: string;
  points?: string;
};

type OrgLayoutType = "tree" | "linear" | "fork" | "tall-tree" | "sponsor";

type OrgChartSvgProps = {
  layoutType: OrgLayoutType;
  parent: OrgNode;
  sibling: OrgNode;
  self: OrgNode;
  extraAbove: string;
  children: { name: string; id: number; displayId?: number }[];
  showExtra: boolean;
  stackNodes?: OrgNode[];
  selfAtBottom?: boolean;
  downline?: OrgNode;
  extraBelow?: string;
  /** 본인 아래 형제 카드 (이미지: 형제 → 나 → 형제) */
  siblingBelow?: OrgNode;
  /** 본인 아래 형제 쪽 '외 N명' 라벨 */
  extraSiblingBelow?: string;
  moreChildren?: { name: string; id: number; displayId?: number }[];
  moreSiblings?: OrgNode[];
};

function OrgChartSvg({
  layoutType,
  parent,
  sibling,
  self,
  extraAbove,
  children,
  showExtra,
  stackNodes = [],
  selfAtBottom = false,
  downline,
  extraBelow,
  siblingBelow,
  extraSiblingBelow,
  moreChildren = [],
  moreSiblings = [],
}: OrgChartSvgProps) {
  const [revealedBelow, setRevealedBelow] = useState(0);
  const [revealedAbove, setRevealedAbove] = useState(false);
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
        <line x1={col1X + CARD_W} y1={centerY} x2={col2X} y2={centerY} stroke={ORG_SELF_ACCENT} strokeWidth={2} />
        <foreignObject x={col2X} y={centerY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
          <Card {...self} isSelf />
        </foreignObject>
        {children[0] && (
          <>
            <line x1={col2X + CARD_W} y1={centerY} x2={col3X} y2={centerY} stroke={ORG_SELF_ACCENT} strokeWidth={2} />
            <foreignObject x={col3X} y={centerY - CHILD_CHIP_H / 2} width={CARD_W + 2} height={CHILD_CHIP_H + 2}>
              <ChildChip {...children[0]} />
            </foreignObject>
          </>
        )}
        </g>
      </svg>
    );
  }

  if (layoutType === "sponsor") {
    const centerY = CARD_H / 2;
    const siblingY = centerY + CARD_H / 2 + GAP + CARD_H / 2;
    const childCount = children.length;
    const childYs =
      childCount > 1
        ? (() => {
            const stackH = CHILD_CHIP_H * childCount + GAP * (childCount - 1);
            const top = centerY - stackH / 2 + CHILD_CHIP_H / 2;
            return children.map((_, i) => top + i * (CHILD_CHIP_H + GAP));
          })()
        : childCount === 1
          ? [centerY]
          : [];
    const col3Bottom = childCount > 0 ? childYs[childYs.length - 1] + CHILD_CHIP_H / 2 : 0;
    const contentH = Math.max(CARD_H, siblingY + CARD_H / 2, col3Bottom);
    const yShift = getOrgChartTopShift(0);
    const svgW = col3X + CARD_W + ORG_FOREIGN_PAD + HPAD;
    const svgH = contentH + yShift + VPAD;

    return (
      <svg width={svgW} height={svgH} style={{ overflow: "visible", display: "block" }}>
        <g transform={`translate(0, ${yShift})`}>
          <foreignObject x={col1X} y={centerY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
            <Card {...parent} />
          </foreignObject>
          {/* 본인 경로: 상위 → 본인 → 첫 하위 */}
          <line x1={col1X + CARD_W} y1={centerY} x2={railMid} y2={centerY} stroke={ORG_SELF_ACCENT} strokeWidth={2} />
          <line x1={railMid} y1={centerY} x2={col2X} y2={centerY} stroke={ORG_SELF_ACCENT} strokeWidth={2} />
          <line x1={railMid} y1={centerY} x2={railMid} y2={siblingY} stroke={BORDER_GRAY} strokeWidth={1} />
          <line x1={railMid} y1={siblingY} x2={col2X} y2={siblingY} stroke={BORDER_GRAY} strokeWidth={1} />
          <foreignObject x={col2X} y={centerY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
            <Card {...self} isSelf />
          </foreignObject>
          <foreignObject x={col2X} y={siblingY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
            <Card {...sibling} />
          </foreignObject>
          {childCount > 0 && (
            <>
              <line x1={col2X + CARD_W} y1={centerY} x2={railRight} y2={centerY} stroke={ORG_SELF_ACCENT} strokeWidth={2} />
              {childCount > 1 && (
                <line
                  x1={railRight}
                  y1={childYs[0]}
                  x2={railRight}
                  y2={childYs[childYs.length - 1]}
                  stroke={BORDER_GRAY}
                  strokeWidth={1}
                />
              )}
              {childYs[0] !== centerY && (
                <line
                  x1={railRight}
                  y1={centerY}
                  x2={railRight}
                  y2={childYs[0]}
                  stroke={ORG_SELF_ACCENT}
                  strokeWidth={2}
                />
              )}
              {children.map((child, i) => (
                <g key={`${child.id}-${i}`}>
                  <line
                    x1={railRight}
                    y1={childYs[i]}
                    x2={col3X}
                    y2={childYs[i]}
                    stroke={i === 0 ? ORG_SELF_ACCENT : BORDER_GRAY}
                    strokeWidth={i === 0 ? 2 : 1}
                  />
                  <foreignObject x={col3X} y={childYs[i] - CHILD_CHIP_H / 2} width={CARD_W + 2} height={CHILD_CHIP_H + 2}>
                    <ChildChip {...child} />
                  </foreignObject>
                </g>
              ))}
            </>
          )}
          {childCount === 0 && downline && (
            <>
              <line x1={col2X + CARD_W} y1={centerY} x2={col3X} y2={centerY} stroke={ORG_SELF_ACCENT} strokeWidth={2} />
              <foreignObject x={col3X} y={centerY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
                <Card {...downline} />
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
        <line x1={col1X + CARD_W} y1={centerY} x2={col2X} y2={centerY} stroke={ORG_SELF_ACCENT} strokeWidth={2} />
        <foreignObject x={col2X} y={centerY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
          <Card {...self} isSelf />
        </foreignObject>
        <line x1={col2X + CARD_W} y1={centerY} x2={railRight} y2={centerY} stroke={ORG_SELF_ACCENT} strokeWidth={2} />
        <line x1={railRight} y1={c1y} x2={railRight} y2={c2y} stroke={BORDER_GRAY} strokeWidth={1} />
        <line x1={railRight} y1={centerY} x2={railRight} y2={c1y} stroke={ORG_SELF_ACCENT} strokeWidth={2} />
        {children[0] && (
          <>
            <line x1={railRight} y1={c1y} x2={col3X} y2={c1y} stroke={ORG_SELF_ACCENT} strokeWidth={2} />
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

  // tree — 첨부 이미지: 상위 → (외N / 형제 / 나·자신 / 형제 / 외N) → (하위칩… / 외N)
  type Col2StackItem =
    | { kind: "self"; node: OrgNode; h: number }
    | { kind: "sibling"; node: OrgNode; h: number }
    | { kind: "extra"; label: string; h: number; onClick?: () => void };

  const revealedSiblingItems: Col2StackItem[] = revealedAbove
    ? moreSiblings.map((node) => ({ kind: "sibling" as const, node, h: CARD_H }))
    : [];

  const extraAboveItem = (): Col2StackItem | null => {
    if (moreSiblings.length > 0) {
      if (revealedAbove) return null;
      return {
        kind: "extra",
        label: `외 ${moreSiblings.length}명`,
        h: EXTRA_H,
        onClick: () => setRevealedAbove(true),
      };
    }
    if (showExtra && extraAbove) {
      return { kind: "extra", label: extraAbove, h: EXTRA_H };
    }
    return null;
  };

  const extraSiblingBelowItem = (): Col2StackItem | null => {
    if (!extraSiblingBelow) return null;
    return { kind: "extra", label: extraSiblingBelow, h: EXTRA_H };
  };

  const col2Stack: Col2StackItem[] = selfAtBottom
    ? (() => {
        // 본인이 맨 아래: (펼친 형제…) / 외N / 형제 / 나
        const items: Col2StackItem[] = [...revealedSiblingItems];
        const extra = extraAboveItem();
        if (extra) items.push(extra);
        items.push({ kind: "sibling", node: sibling, h: CARD_H });
        items.push({ kind: "self", node: self, h: CARD_H });
        return items;
      })()
    : (() => {
        // 첨부 이미지 기본형: 외N → 형제 → 나 → 형제 → 외N
        const items: Col2StackItem[] = [];
        const extraTop = extraAboveItem();
        if (extraTop) items.push(extraTop);
        items.push(...revealedSiblingItems);
        items.push({ kind: "sibling", node: sibling, h: CARD_H });
        items.push({ kind: "self", node: self, h: CARD_H });
        if (siblingBelow) items.push({ kind: "sibling", node: siblingBelow, h: CARD_H });
        const extraBottom = extraSiblingBelowItem();
        if (extraBottom) items.push(extraBottom);
        return items;
      })();

  const selfIdx = col2Stack.findIndex((item) => item.kind === "self");
  const totalCol2H = col2Stack.reduce((sum, item) => sum + item.h, 0) + GAP * (col2Stack.length - 1);

  const col2Ys: number[] = [];
  let y = 0;
  col2Stack.forEach((item) => {
    col2Ys.push(y + item.h / 2);
    y += item.h + GAP;
  });

  const selfCenterY = col2Ys[selfIdx];
  const visibleMoreChildren = moreChildren.slice(0, revealedBelow);
  const remainingBelow = moreChildren.length - revealedBelow;
  const visibleCol3Children = [...children, ...visibleMoreChildren];
  const col3Layout = (() => {
    type Col3Entry =
      | { kind: "child"; child: (typeof children)[number]; h: number }
      | { kind: "extra"; label: string; h: number; onClick?: () => void };
    const extraEntries: Col3Entry[] =
      moreChildren.length > 0
        ? remainingBelow > 0
          ? [{
              kind: "extra" as const,
              label: `외 ${remainingBelow}명`,
              h: EXTRA_H,
              onClick: () => setRevealedBelow(moreChildren.length),
            }]
          : []
        : extraBelow
          ? [{ kind: "extra" as const, label: extraBelow, h: EXTRA_H }]
          : [];
    const entries: Col3Entry[] = [
      ...visibleCol3Children.map((child) => ({ kind: "child" as const, child, h: CHILD_CHIP_H })),
      ...extraEntries,
    ];
    if (entries.length === 0) return { entries: [], positioned: [] as { entry: Col3Entry; cy: number }[] };

    // 하위 목록은 본인 카드 상단과 맞춤 (이미지)
    let cursorY = selfCenterY - CARD_H / 2;
    const positioned = entries.map((entry) => {
      const cy = cursorY + entry.h / 2;
      cursorY += entry.h + GAP;
      return { entry, cy };
    });
    return { entries, positioned };
  })();

  const col3Bottom =
    col3Layout.positioned.length > 0
      ? col3Layout.positioned[col3Layout.positioned.length - 1].cy +
        col3Layout.positioned[col3Layout.positioned.length - 1].entry.h / 2
      : 0;
  const col3Top =
    col3Layout.positioned.length > 0
      ? col3Layout.positioned[0].cy - col3Layout.positioned[0].entry.h / 2
      : 0;
  const contentTop = Math.min(0, col3Top);
  const yShift = getOrgChartTopShift(contentTop);
  const contentH = Math.max(totalCol2H, col3Bottom);
  const svgW = col3X + CARD_W + ORG_FOREIGN_PAD + HPAD;
  const svgH = contentH + yShift + VPAD;

  // 세로 레일: 형제 구간은 실선, 외N명 구간만 점선
  const firstNonExtraIdx = col2Stack.findIndex((item) => item.kind !== "extra");
  const lastNonExtraIdx = (() => {
    for (let i = col2Stack.length - 1; i >= 0; i -= 1) {
      if (col2Stack[i].kind !== "extra") return i;
    }
    return -1;
  })();

  return (
    <svg width={svgW} height={svgH} style={{ overflow: "visible", display: "block" }}>
      <g transform={`translate(0, ${yShift})`}>
      <foreignObject x={col1X} y={selfCenterY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
        <Card {...parent} />
      </foreignObject>
      {/* 상위 → 본인: 회색 */}
      <line x1={col1X + CARD_W} y1={selfCenterY} x2={railMid} y2={selfCenterY} stroke={BORDER_GRAY} strokeWidth={1} />
      <line x1={railMid} y1={selfCenterY} x2={col2X} y2={selfCenterY} stroke={BORDER_GRAY} strokeWidth={1} />
      {/* 형제 세로 레일(실선) */}
      {firstNonExtraIdx >= 0 && lastNonExtraIdx > firstNonExtraIdx && (
        <line
          x1={railMid}
          y1={col2Ys[firstNonExtraIdx]}
          x2={railMid}
          y2={col2Ys[lastNonExtraIdx]}
          stroke={BORDER_GRAY}
          strokeWidth={1}
        />
      )}
      {/* 외N명 ↔ 인접 노드: 점선 세로 */}
      {col2Stack.map((item, i) => {
        if (item.kind !== "extra") return null;
        const neighborIdx = i === 0 ? 1 : i - 1;
        if (neighborIdx < 0 || neighborIdx >= col2Ys.length) return null;
        return (
          <line
            key={`rail-extra-${i}`}
            x1={railMid}
            y1={col2Ys[i]}
            x2={railMid}
            y2={col2Ys[neighborIdx]}
            stroke={BORDER_GRAY}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        );
      })}
      {col2Ys.map((cy, i) => {
        const isExtra = col2Stack[i]?.kind === "extra";
        return (
          <line
            key={i}
            x1={railMid}
            y1={cy}
            x2={col2X}
            y2={cy}
            stroke={BORDER_GRAY}
            strokeWidth={1}
            strokeDasharray={isExtra ? "4 3" : undefined}
          />
        );
      })}
      {col2Stack.map((item, i) => {
        if (item.kind === "extra") {
          return (
            <foreignObject key={`extra-${i}`} x={col2X} y={col2Ys[i] - EXTRA_H / 2} width={CARD_W + 2} height={EXTRA_H + 2}>
              <ExtraBox label={item.label} onClick={item.onClick} />
            </foreignObject>
          );
        }
        if (item.kind === "self") {
          return (
            <foreignObject
              key={`self-${item.node.id}`}
              x={col2X}
              y={col2Ys[i] - CARD_H / 2 - 12}
              width={CARD_W + 2}
              height={CARD_H + 14}
            >
              <div style={{ paddingTop: 12 }}>
                <Card {...item.node} isSelf />
              </div>
            </foreignObject>
          );
        }
        return (
          <foreignObject key={`sibling-${item.node.id}-${i}`} x={col2X} y={col2Ys[i] - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
            <Card {...item.node} />
          </foreignObject>
        );
      })}
      {col3Layout.positioned.length > 0 && (
        <>
          {/* 본인 → 하위 레일만 파란색(이미지 강조) */}
          <line x1={col2X + CARD_W} y1={selfCenterY} x2={railRight} y2={selfCenterY} stroke={ORG_SELF_ACCENT} strokeWidth={2} />
          {(() => {
            const firstCy = col3Layout.positioned[0].cy;
            const lastCy = col3Layout.positioned[col3Layout.positioned.length - 1].cy;
            const lastIsExtra = col3Layout.positioned[col3Layout.positioned.length - 1].entry.kind === "extra";
            const lastChildCy = [...col3Layout.positioned].reverse().find((p) => p.entry.kind === "child")?.cy ?? lastCy;
            return (
              <>
                {col3Layout.positioned.length > 1 && (
                  <line
                    x1={railRight}
                    y1={firstCy}
                    x2={railRight}
                    y2={lastChildCy}
                    stroke={BORDER_GRAY}
                    strokeWidth={1}
                  />
                )}
                {lastIsExtra && lastCy !== lastChildCy && (
                  <line
                    x1={railRight}
                    y1={lastChildCy}
                    x2={railRight}
                    y2={lastCy}
                    stroke={BORDER_GRAY}
                    strokeWidth={1}
                    strokeDasharray="4 3"
                  />
                )}
              </>
            );
          })()}
          {col3Layout.positioned.map(({ entry, cy }, i) => {
            const isExtra = entry.kind === "extra";
            return (
              <g key={entry.kind === "child" ? `${entry.child.id}-${i}` : `extra-${i}`}>
                <line
                  x1={railRight}
                  y1={cy}
                  x2={col3X}
                  y2={cy}
                  stroke={BORDER_GRAY}
                  strokeWidth={1}
                  strokeDasharray={isExtra ? "4 3" : undefined}
                />
                {entry.kind === "child" ? (
                  <foreignObject x={col3X} y={cy - CHILD_CHIP_H / 2} width={CARD_W + 2} height={CHILD_CHIP_H + 2}>
                    <ChildChip {...entry.child} />
                  </foreignObject>
                ) : (
                  <foreignObject x={col3X} y={cy - EXTRA_H / 2} width={CARD_W + 2} height={EXTRA_H + 2}>
                    <ExtraBox label={entry.label} onClick={entry.onClick} />
                  </foreignObject>
                )}
              </g>
            );
          })}
        </>
      )}
      </g>
    </svg>
  );
}

type OrgChartTabId = "recommender" | "sponsor";

function OrgChart({ memberId, memberName }: OrgChartProps) {
  const member = getMemberById(memberId);
  const sections = buildOrgChartSections(memberId, memberName, member);
  const [activeTab, setActiveTab] = useState<OrgChartTabId>("sponsor");
  const activeSection = sections.find((section) => section.id === activeTab) ?? sections[0];
  const inactiveTitle = activeTab === "sponsor" ? "추천인" : "후원인";

  useEffect(() => {
    setActiveTab("sponsor");
  }, [memberId, member.name]);

  return (
    <OrgChartHoverProvider>
      <div
        key={memberId}
        className="org-chart-tabs"
        style={{ overflow: "visible", padding: "0 0 8px 0", width: "100%" }}
      >
        <div className="org-chart-tabs__bar" role="tablist" aria-label="조직도 관계">
          <button
            type="button"
            role="tab"
            aria-selected
            aria-label={`${activeSection.title}, 클릭하면 ${inactiveTitle}(으)로 전환`}
            className="org-chart-tabs__tab is-active"
            onClick={() => setActiveTab(activeTab === "sponsor" ? "recommender" : "sponsor")}
          >
            {activeSection.title}
          </button>
        </div>
        <div className="org-chart-tabs__panel" role="tabpanel" aria-label={activeSection.title}>
          <OrgChartSvg key={`${memberId}-${activeTab}`} {...activeSection.variant} />
        </div>
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
  { id: 18, no: "N26016491", loginId: "hsh0913",       name: "홍순희", type: "일반",  regDate: "2026-04-17", status: "정상", rank: "정회원", grade: "회원",  phone: "010-5451-5030", ssn: "610923-2000000", region: "경기 양주" },
  { id: 19, no: "N26705870", loginId: "jj9501",        name: "안점홍", type: "일반",  regDate: "2026-05-01", status: "정상", rank: "정회원", grade: "회원",  phone: "010-7769-9501", ssn: "500115-2000000", region: "뉴시아258" },
  { id: 20, no: "10000015", loginId: "charm0123",     name: "김상경", type: "일반",  regDate: "2025-08-26", status: "정상", rank: "블루",   grade: "블루",  phone: "010-9352-1177", ssn: "900313-1124610", region: "뉴시아09" },
];

type Member = (typeof members)[number];

function getMemberById(id: number): Member {
  return members.find((m) => m.id === id) ?? members[0];
}

function createEmptyMemberDraft(): Member {
  return {
    id: 0,
    no: "",
    loginId: "",
    name: "",
    type: "일반",
    regDate: "",
    status: "정상",
    rank: "",
    grade: "",
    phone: "",
    ssn: "",
    region: "",
  };
}

function shiftOrgDate(dateStr: string, dayOffset: number) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

const KIM_SANGKYUNG_MORE_CHILDREN = [
  "이수민", "박준호", "최유리", "한지민", "오세훈",
  "장민재", "윤서연", "강도현", "신예린", "조민수",
  "배소영", "류현우", "문지혜", "서동욱", "권나래",
  "황재민", "노수빈", "안채원", "전혁준", "피유진",
  "하승우", "길민아",
].map((name, index) => ({
  name,
  id: 930 + index,
  displayId: 10 + index,
}));

/** 첨부 이미지와 동일한 하위 칩 샘플 */
const ORG_CHART_DEMO_CHILDREN = [
  { name: "변해숙", id: 951, displayId: 1 },
  { name: "김송미", id: 952, displayId: 2 },
  { name: "이정아", id: 953, displayId: 3 },
  { name: "박소연", id: 954, displayId: 4 },
  { name: "최민수", id: 955, displayId: 5 },
  { name: "한지우", id: 956, displayId: 6 },
  { name: "오세린", id: 957, displayId: 7 },
  { name: "장도윤", id: 958, displayId: 8 },
  { name: "윤채원", id: 959, displayId: 9 },
  { name: "이혜신", id: 960, displayId: 10 },
];

function buildOrgChartSections(memberId: number, memberName: string, member: Member) {
  if (member.name === "김상경") {
    const selfNode = createOrgNode("나", member.name, member.id, "다이아몬드", {
      memberNo: member.no,
      displayId: 6,
      regDate: member.regDate,
      points: "10.08",
    });

    return [
      {
        id: "recommender" as const,
        title: "추천인",
        variant: {
          layoutType: "tree" as const,
          parent: createOrgNode("상위", "박재우", 915, "퍼플", {
            displayId: 0,
            regDate: "2025-08-26",
            points: "43",
          }),
          sibling: createOrgNode("형제", "성영지", 916, "블루", {
            displayId: 1,
            regDate: "2025-08-26",
            points: "19.21",
          }),
          siblingBelow: createOrgNode("형제", "김희수", 917, "레드", {
            displayId: 2,
            regDate: "2025-09-02",
            points: "8.40",
          }),
          self: selfNode,
          extraAbove: "외 3명",
          extraSiblingBelow: "외 3명",
          extraBelow: "외 22명",
          moreChildren: KIM_SANGKYUNG_MORE_CHILDREN,
          children: [
            { name: "홍선영", id: 920, displayId: 0 },
            { name: "정세영", id: 921, displayId: 1 },
            { name: "송정웅", id: 922, displayId: 2 },
            { name: "김지원", id: 923, displayId: 3 },
            { name: "임상윤", id: 924, displayId: 4 },
            { name: "허봄이", id: 925, displayId: 5 },
            { name: "남경문", id: 926, displayId: 6 },
            { name: "정승배", id: 927, displayId: 7 },
            { name: "함용희", id: 928, displayId: 8 },
            { name: "김희수", id: 929, displayId: 9 },
          ],
          showExtra: true,
        },
      },
      {
        id: "sponsor" as const,
        title: "후원인",
        variant: {
          // 첨부 이미지와 동일한 좌→우 트리 구성
          layoutType: "tree" as const,
          parent: createOrgNode("상위", "박민수", 910, "크라운", {
            displayId: 0,
            regDate: "2026-04-09",
            points: "70.34",
          }),
          sibling: createOrgNode("형제", "김백성", 912, "다이아몬드", {
            displayId: 5,
            regDate: "2026-04-09",
            points: "12.50",
          }),
          siblingBelow: createOrgNode("형제", "최연경", 913, "일반회원", {
            displayId: 7,
            regDate: "2026-04-09",
            points: "8.30",
          }),
          self: selfNode,
          extraAbove: "외 5명",
          extraSiblingBelow: "외 5명",
          moreChildren: KIM_SANGKYUNG_MORE_CHILDREN.slice(0, 11),
          children: ORG_CHART_DEMO_CHILDREN,
          showExtra: true,
        },
      },
    ];
  }

  if (member.name === "안점홍") {
    return [
      {
        id: "recommender" as const,
        title: "추천인",
        variant: {
          layoutType: "tree" as const,
          parent: createOrgNode("상위", "강성수", 904, "정회원", {
            displayId: 0,
            regDate: "2026-04-28",
            points: "0",
          }),
          sibling: createOrgNode("형제", "윤미래", 908, "정회원", {
            displayId: 1,
            regDate: "2026-04-30",
            points: "0",
          }),
          self: createOrgNode("나", member.name, member.id, "정회원", {
            memberNo: member.no,
            displayId: 0,
            regDate: member.regDate,
            points: "0",
          }),
          extraAbove: "외 2명",
          children: [],
          showExtra: true,
          selfAtBottom: true,
        },
      },
      {
        id: "sponsor" as const,
        title: "후원인",
        variant: {
          layoutType: "sponsor" as const,
          parent: createOrgNode("상위", "허경옥", 905, "정회원", {
            displayId: 0,
            regDate: "2026-04-29",
            points: "0",
          }),
          sibling: createOrgNode("형제", "최은주", 906, "정회원", {
            displayId: 1,
            regDate: "2026-05-01",
            points: "0",
          }),
          self: createOrgNode("나", member.name, member.id, "정회원", {
            memberNo: member.no,
            displayId: 0,
            regDate: member.regDate,
            points: "0",
          }),
          downline: createOrgNode("하위", "김상경", 907, "정회원", {
            displayId: 0,
            regDate: "2026-05-01",
            points: "0",
          }),
          extraAbove: "",
          children: [],
          showExtra: false,
        },
      },
    ];
  }

  if (member.name === "홍순희") {
    return [
      {
        id: "recommender" as const,
        title: "추천인",
        variant: {
          layoutType: "tree" as const,
          parent: createOrgNode("상위", "이선하", 901, "퍼플", {
            displayId: 3,
            regDate: "2026-03-31",
            points: "87.09",
          }),
          sibling: createOrgNode("형제", "차승우", 902, "정회원", {
            displayId: 3,
            regDate: "2026-04-17",
            points: "0",
          }),
          self: createOrgNode("나", member.name, member.id, "정회원", {
            memberNo: member.no,
            displayId: 4,
            regDate: member.regDate,
            points: "0",
          }),
          extraAbove: "외 3명",
          children: [],
          showExtra: true,
          selfAtBottom: true,
        },
      },
      {
        id: "sponsor" as const,
        title: "후원인",
        variant: {
          layoutType: "linear" as const,
          parent: createOrgNode("상위", "오미경", 903, "정회원", {
            displayId: 0,
            regDate: "2026-04-15",
            points: "0",
          }),
          sibling: createOrgNode("형제", "-", member.id, member.grade),
          self: createOrgNode("나", member.name, member.id, "정회원", {
            memberNo: member.no,
            displayId: 0,
            regDate: member.regDate,
            points: "0",
          }),
          extraAbove: "",
          children: [],
          showExtra: false,
        },
      },
    ];
  }

  const self = createOrgNode("나", memberName, memberId, member.grade, { memberNo: member.no });

  if (memberId === 10) {
    return [
      {
        id: "recommender" as const,
        title: "추천인",
        variant: {
          layoutType: "tree" as const,
          parent: createOrgNode("상위", "백창성", 6, "블루"),
          sibling: createOrgNode("형제", "김성남", 5, "그린"),
          self,
          extraAbove: "외 19명",
          children: [],
          showExtra: true,
          selfAtBottom: true,
        },
      },
      {
        id: "sponsor" as const,
        title: "후원인",
        variant: {
          layoutType: "linear" as const,
          parent: createOrgNode("상위", "황기봉", 2, "그린"),
          sibling: createOrgNode("형제", "-", memberId, member.grade),
          self,
          extraAbove: "",
          children: [],
          showExtra: false,
        },
      },
    ];
  }

  const n = members.length;
  const recommenderParent = members[(Math.max(memberId, 1) + 2) % n];
  const sponsorParent = members[(Math.max(memberId, 1) + 4) % n];
  const siblingRef = members[(Math.max(memberId, 1) + 5) % n];
  const parentRanks = ["매니저", "이사", "디렉터", "실버", "골드", "퍼플"];
  const orgRanks = ["정회원", "그린", "골드", "준회원", "핀플", "멤버", "일반회원"];

  return [
    {
      id: "recommender" as const,
      title: "추천인",
      variant: {
        layoutType: "tree" as const,
        parent: createOrgNode(
          "상위",
          recommenderParent.name,
          recommenderParent.id,
          parentRanks[memberId % parentRanks.length],
        ),
        sibling: createOrgNode("형제", siblingRef.name, siblingRef.id, orgRanks[(memberId + 1) % orgRanks.length]),
        self,
        extraAbove: `외 ${6 + (memberId % 19)}명`,
        children: memberId % 2 === 0 ? [{ name: members[(memberId + 7) % n].name, id: members[(memberId + 7) % n].id }] : [],
        showExtra: true,
        selfAtBottom: true,
      },
    },
    {
      id: "sponsor" as const,
      title: "후원인",
      variant: {
        layoutType: "linear" as const,
        parent: createOrgNode(
          "상위",
          sponsorParent.name,
          sponsorParent.id,
          orgRanks[(memberId + 2) % orgRanks.length],
        ),
        sibling: createOrgNode("형제", siblingRef.name, siblingRef.id, orgRanks[(memberId + 3) % orgRanks.length]),
        self,
        extraAbove: "",
        children: [],
        showExtra: false,
      },
    },
  ];
}

function buildOrgChartVariant(memberId: number, memberName: string, member: Member) {
  return buildOrgChartSections(memberId, memberName, member)[0].variant;
}

const columns = [
  { key: "id",      label: "No",       width: 40 },
  { key: "no",      label: "회원번호",  width: 108 },
  { key: "loginId", label: "아이디",   width: 110 },
  { key: "name",    label: "이름",     width: 72 },
  { key: "type",    label: "회원구분",  width: 68 },
  { key: "regDate", label: "등록일자",  width: 96 },
  { key: "status",  label: "상태명",   width: 60 },
  { key: "rank",    label: "직급명",   width: 58 },
  { key: "grade",   label: "등급명",   width: 58 },
  { key: "phone",   label: "핸드폰",   width: 112 },
  { key: "ssn",     label: "주민등록번호", width: 112 },
  { key: "region",  label: "센티명",   width: 88 },
];

const MEMBER_LIST_CHECKBOX_WIDTH = 36;
const MEMBER_LIST_MAX_WIDTH = MEMBER_LIST_CHECKBOX_WIDTH + columns.reduce((sum, column) => sum + column.width, 0);
const MEMBER_LIST_DEFAULT_WIDTH =
  MEMBER_LIST_CHECKBOX_WIDTH + columns.slice(0, 6).reduce((sum, column) => sum + column.width, 0);

type MemberSearchField = "nameOrNo" | "name" | "no" | "loginId";

const memberSearchFieldOptions: { value: MemberSearchField; label: string }[] = [
  { value: "nameOrNo", label: "이름 또는 회원번호" },
  { value: "name", label: "이름" },
  { value: "no", label: "회원번호" },
  { value: "loginId", label: "아이디" },
];

function memberMatchesSearch(member: Member, query: string, field: MemberSearchField) {
  if (!query) return true;
  switch (field) {
    case "nameOrNo":
      return member.name.includes(query) || member.no.includes(query);
    case "name":
      return member.name.includes(query);
    case "no":
      return member.no.includes(query);
    case "loginId":
      return member.loginId.includes(query);
    default:
      return true;
  }
}

interface MemberTableProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  listOpen?: boolean;
  listWidth?: number;
}

function MemberTable({ selectedId, onSelect, listOpen = false, listWidth = MEMBER_LIST_DEFAULT_WIDTH }: MemberTableProps) {
  const [searchField, setSearchField] = useState<MemberSearchField>("nameOrNo");
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  function applySearch() {
    setSearchQuery(searchDraft.trim());
  }

  const filtered = members.filter((member) => memberMatchesSearch(member, searchQuery, searchField));

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
  }, [searchQuery, searchField, sortKey, sortDir]);

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
      {/* Search */}
      <div className="member-list-search shrink-0">
        <div className="member-list-search__row">
          <div className="member-list-search__controls">
            <label className="member-list-search__field-select-wrap">
              <select
                className="member-list-search__field-select"
                value={searchField}
                onChange={(event) => setSearchField(event.target.value as MemberSearchField)}
                aria-label="검색 항목"
              >
                {memberSearchFieldOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="member-list-search__field-select-icon" aria-hidden />
            </label>

            <div className="member-list-search__input-wrap">
              <span className="member-list-search__wildcard" aria-hidden>%</span>
              <input
                className="member-list-search__input"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applySearch();
                }}
                placeholder=""
                aria-label="검색어"
              />
              <span className="member-list-search__wildcard" aria-hidden>%</span>
            </div>

            <button type="button" className="member-list-search__submit" onClick={applySearch}>
              <Search size={14} strokeWidth={2.2} aria-hidden />
              <span>검색</span>
            </button>
          </div>

          <span className="member-list-search__total">
            총 <strong>{sorted.length}</strong>명
          </span>
        </div>
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
            <col style={{ width: MEMBER_LIST_CHECKBOX_WIDTH }} />
            {columns.map((c) => <col key={c.key} style={{ width: c.width }} />)}
          </colgroup>
          <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <tr style={{ background: "var(--surface-table-header)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ width: MEMBER_LIST_CHECKBOX_WIDTH, padding: "6px 5px", textAlign: "center" }}>
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
const SPLIT_TABLE_CHECKBOX_PAD_LEFT = 12;
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
    fontSize: 12,
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
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--split-table-header-fg, #f8fafc)",
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
                      fontVariantNumeric: getSplitColumnAlign(col) === "right" ? "tabular-nums" : undefined,
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
      className="flex flex-col h-full min-h-0 w-full overflow-hidden member-split-panel-view"
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
  { key: "no", label: "No", width: 36, align: "center" },
  { key: "deductNo", label: "공제번호", width: 88, align: "left" },
  { key: "deductStatus", label: "공제신고상태명", width: 100, align: "center" },
  { key: "orderNo", label: "주문서번호", width: 96, align: "left" },
  { key: "orderDate", label: "주문일자", width: 84, align: "center" },
  { key: "allowanceDate", label: "수당적용일자", width: 92, align: "center" },
  { key: "plan", label: "플랜명", width: 72, align: "center" },
  { key: "purchaseType", label: "구매구분명", width: 80, align: "center" },
  { key: "orderStatus", label: "주문서상태명", width: 88, align: "center" },
  { key: "cash", label: "현금", width: 64, align: "right" },
  { key: "online", label: "온라인", width: 64, align: "right" },
  { key: "card", label: "카드", width: 64, align: "right" },
  { key: "pointTotal", label: "포인트합", width: 72, align: "right" },
  { key: "supplyTotal", label: "공급가합", width: 72, align: "right" },
  { key: "salesTotal", label: "매출금액합", width: 80, align: "right" },
  { key: "recipient", label: "인수자명", width: 72, align: "left" },
  { key: "note", label: "비고", width: 96, align: "left" },
];

const orderLineColumns: SplitTableColumn[] = [
  { key: "no", label: "No", width: 36, align: "center" },
  { key: "bundleNo", label: "묶음번호", width: 88, align: "left" },
  { key: "orderStatus", label: "주문서상태", width: 80, align: "left" },
  { key: "shipType", label: "발송구분", width: 72, align: "left" },
  { key: "deliveryType", label: "배송구분", width: 72, align: "left" },
  { key: "warehouse", label: "출고지역", width: 80, align: "left" },
  { key: "shipDate", label: "출고예정일자", width: 92, align: "center" },
  { key: "productCode", label: "상품코드", width: 88, align: "left" },
  { key: "productName", label: "상품명", width: 120, align: "left" },
  { key: "uniqueNo", label: "고유번호", width: 88, align: "left" },
  { key: "price", label: "가격", width: 72, align: "right" },
  { key: "qty", label: "수량", width: 56, align: "right" },
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

function MemberProfileHeader({ member }: { member: Member }) {
  const memberType = member.type === "소비자" ? "소비자" : "일반";
  return (
    <div className="member-profile-header">
      <div className="member-profile-header__identity">
        <span className="member-profile-header__line">
          <span className="content-member-header-text member-profile-header__name">{member.name || "—"}</span>
          <span className="content-member-header-divider member-profile-header-divider" aria-hidden />
          <span className="content-member-header-text">{member.loginId || "—"}</span>
          <span className="content-member-header-divider member-profile-header-divider" aria-hidden />
          <span className="content-member-header-no">{member.no || "—"}</span>
        </span>
      </div>
      <MemberTypeToggle type={memberType} />
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

function FormSection({ title, icon: _icon, subtitle, headerExtra, children, bodyPadding, clipBody = true, className = "" }: {
  title: string; icon?: React.ReactNode; subtitle?: string; headerExtra?: React.ReactNode; children: React.ReactNode; bodyPadding?: string; clipBody?: boolean; className?: string;
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
          borderBottom: open ? "1px solid var(--content-form-section-header-bg, var(--border))" : "none",
        }}
      >
        <span className="text-sm font-semibold shrink-0" style={{ color: "var(--content-form-section-header-fg, var(--foreground))" }}>{title}</span>
        {subtitle ? (
          <span className="text-xs shrink-0" style={{ color: "var(--content-form-section-header-fg-muted, var(--text-muted))" }}>{subtitle}</span>
        ) : null}
        {headerExtra ? (
          <div
            className="member-form-section-header-extra member-form-section-header-extra--grow min-w-0"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {headerExtra}
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <ChevronDown
          size={15}
          style={{
            color: "var(--content-form-section-header-fg-muted, var(--muted-foreground))",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        />
      </button>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.25s ease" }}>
        <div style={{ overflow: clipBody ? "hidden" : "visible" }}>
          <div className="content-form-body" style={bodyPadding ? { padding: bodyPadding } : undefined}>
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
                        height: ORG_CHART_TABBED_CONTENT_HEIGHT,
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
  onNavigateToOrderManagement,
  onNavigateToOrgChart,
}: {
  memberId: number;
  listOpen: boolean;
  formColumnWidth: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNavigateToOrderManagement?: () => void;
  onNavigateToOrgChart?: () => void;
}) {
  const member = getMemberById(memberId);
  const isMemberInfoTab = activeTab === "회원정보";
  const detailContentWidth = getDetailContentWidth(formColumnWidth);
  const contentAlignWidth = isMemberInfoTab && listOpen ? detailContentWidth : "100%";
  const [rankAdjustOpen, setRankAdjustOpen] = useState(false);
  const [businessInfoOpen, setBusinessInfoOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [newPasswordOpen, setNewPasswordOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [messageInitialContent, setMessageInitialContent] = useState("");
  const [isNewMemberDraft, setIsNewMemberDraft] = useState(false);
  const [formDraftKey, setFormDraftKey] = useState(0);

  const generatedPasswordMessage = "회원님의 새로운 비밀번호는 [HQBP9LDP]입니다. - 주)회사명";

  useEffect(() => {
    setIsNewMemberDraft(false);
  }, [memberId]);

  function handleToolbarAction(label: string) {
    if (label === "조직도") {
      onNavigateToOrgChart?.();
    }
    if (label === "직급조정") {
      setRankAdjustOpen(true);
    }
    if (label === "사업자정보") {
      setBusinessInfoOpen(true);
    }
    if (label === "메세지") {
      setMessageInitialContent("");
      setMessageOpen(true);
    }
    if (label === "새비밀번호") {
      setNewPasswordOpen(true);
    }
    if (label === "저장") {
      setSaveOpen(true);
    }
    if (label === "인쇄") {
      setPrintOpen(true);
    }
    if (label === "주문서") {
      onNavigateToOrderManagement?.();
    }
    if (label === "새로 만들기") {
      setIsNewMemberDraft(true);
      setFormDraftKey((key) => key + 1);
    }
  }

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
          <MemberPageChrome activeTab={activeTab} onTabChange={onTabChange} onToolbarAction={handleToolbarAction} />

          {isMemberInfoTab ? (
            <MemberInfoBody
              memberId={memberId}
              listOpen={listOpen}
              formColumnWidth={formColumnWidth}
              member={member}
              isNewDraft={isNewMemberDraft}
              formDraftKey={formDraftKey}
            />
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

      <RankAdjustPopup
        open={rankAdjustOpen}
        memberName={member.name}
        memberLoginId={member.loginId}
        currentRank={member.rank}
        onClose={() => setRankAdjustOpen(false)}
      />

      <BusinessInfoPopup open={businessInfoOpen} onClose={() => setBusinessInfoOpen(false)} />

      <MessageSendPopup
        open={messageOpen}
        memberName={member.name}
        defaultPhone={member.phone || "010-4355-7783"}
        phoneOptions={[member.phone, "010-4355-7783"].filter(Boolean)}
        initialMessage={messageInitialContent}
        onClose={() => setMessageOpen(false)}
      />

      <NewPasswordPopup
        open={newPasswordOpen}
        onClose={() => setNewPasswordOpen(false)}
        onConfirm={() => {
          setMessageInitialContent(generatedPasswordMessage);
          setMessageOpen(true);
        }}
      />

      <PrintPopup open={printOpen} onClose={() => setPrintOpen(false)} />

      <MemberSavePopup
        open={saveOpen}
        member={{
          name: member.name,
          loginId: member.loginId,
          no: member.no,
          phone: member.phone,
          ssn: member.ssn,
          regDate: member.regDate,
          region: member.region,
        }}
        onClose={() => setSaveOpen(false)}
      />
    </div>
  );
}

function getEmptyMemberGeneralInfo() {
  return {
    regDate: "",
    customerName: "",
    customerNameExtra1: "",
    customerNameExtra2: "",
    koreanName: "",
    nickName: "",
    businessName: "",
    legalName: "",
    birthDate: "",
    ssn: "",
    gender: "남" as const,
    ssnVerified: false,
    ein: "",
    visaType: "() 내국인",
    stayExpiry: "",
    address: "",
    addressDetail: "",
    city: "",
    state: "",
    country: "South Korea",
    zip: "",
    contact: "",
    phone: "",
    taxId: "",
    memo: "",
  };
}

function getMemberGeneralInfo(member: Member) {
  if (member.id === 0) {
    return getEmptyMemberGeneralInfo();
  }
  if (member.name === "김상경") {
    return {
      regDate: "2025-08-26",
      customerName: "김상경",
      customerNameExtra1: "Kim",
      customerNameExtra2: "Sang-kyung",
      koreanName: "",
      nickName: "미스터천지",
      businessName: "",
      legalName: "",
      birthDate: "1990-03-13",
      ssn: "900313-1124610",
      gender: "남" as const,
      ssnVerified: true,
      ein: "",
      visaType: "() 내국인",
      stayExpiry: "1900-01-01",
      address: "부산 금정구 대룡2길 21 (브라카하우스)",
      addressDetail: "브라카하우스",
      city: "",
      state: "",
      country: "South Korea",
      zip: "46203",
      contact: "",
      phone: "010-9352-1177",
      taxId: "",
      memo: "",
    };
  }

  return {
    regDate: member.regDate,
    customerName: member.name,
    customerNameExtra1: "",
    customerNameExtra2: "",
    koreanName: "",
    nickName: "",
    businessName: "",
    legalName: "",
    birthDate: "",
    ssn: member.ssn,
    gender: "여" as const,
    ssnVerified: false,
    ein: "",
    visaType: "() 내국인",
    stayExpiry: "",
    address: member.region,
    addressDetail: "",
    city: "",
    state: "",
    country: "South Korea",
    zip: "",
    contact: "",
    phone: member.phone,
    taxId: "",
    memo: "",
  };
}

function MemberGeneralInfoForm({ member }: { member: Member }) {
  const info = getMemberGeneralInfo(member);
  const inputStyle: React.CSSProperties = {
    background: "var(--input-background)",
    border: "none",
    color: "var(--foreground)",
  };
  const focusProps = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.target.style.background = "var(--input-focus-bg)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.target.style.background = "var(--input-background)";
    },
  };
  const labelCellClass = "member-form-cell member-form-cell--label";
  const fieldCellClass = "member-form-cell member-form-cell--field";
  const fieldWideCellClass = "member-form-cell member-form-cell--field member-form-cell--field-wide";
  const fieldColSpan = 3;

  return (
    <FormSection title="일반 회원정보" icon={<User size={12} />} className="content-form-section--member-form">
      <table className="content-form-grid content-form-grid--member member-form-grid--split member-form-grid--general" style={{ width: "100%", borderCollapse: "collapse" }}>
        <colgroup>
          <col className="col-label-1" />
          <col className="col-field-1" />
          <col className="col-label-2" />
          <col className="col-field-2" />
        </colgroup>
        <tbody>
          {/* 1: 회원 등록일자 | 한국명 */}
          <tr className="form-row-dual">
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--required-color, #001673)", fontWeight: 500 }}>* 회원 등록일자</span></td>
            <td className={fieldCellClass}><input type="date" key={`reg-${member.id}`} defaultValue={info.regDate} className="w-full rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} /></td>
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>한국명</span></td>
            <td className={fieldCellClass}><input defaultValue={info.koreanName || info.customerName} className="w-full rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} /></td>
          </tr>

          {/* 2: 고객 이름/성 (전체 폭, 입력 3칸) */}
          <tr>
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--required-color, #001673)", fontWeight: 500 }}>* 고객 이름/성</span></td>
            <td className={fieldWideCellClass} colSpan={fieldColSpan}>
              <div className="member-form-name-pair member-form-name-pair--triple">
                <input defaultValue={info.customerName} className="member-form-name-pair__input member-form-customer-name-primary rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} />
                <input defaultValue={info.customerNameExtra1} placeholder="Kim" className="member-form-name-pair__input rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} />
                <input defaultValue={info.customerNameExtra2} placeholder="Sang-kyung" className="member-form-name-pair__input rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} />
              </div>
            </td>
          </tr>

          {/* 3: Nick Name | Business Name */}
          <tr className="form-row-dual">
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>Nick Name</span></td>
            <td className={fieldCellClass}><input defaultValue={info.nickName} placeholder="닉네임" className="w-full rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} /></td>
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>Business Name</span></td>
            <td className={fieldCellClass}><input defaultValue={info.businessName} placeholder="사업자명" className="w-full rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} /></td>
          </tr>

          {/* 4: Legal Name | 생년월일 */}
          <tr className="form-row-dual">
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>Legal Name</span></td>
            <td className={fieldCellClass}><input defaultValue={info.legalName} placeholder="법적 이름" className="w-full rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} /></td>
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>생년월일</span></td>
            <td className={fieldCellClass}><input type="date" defaultValue={info.birthDate} className="w-full rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} /></td>
          </tr>

          {/* 5: 주민등록번호 | EIN Number */}
          <tr className="form-row-dual">
            <td className={labelCellClass}>
              <span style={{ fontSize: "12px", color: "var(--required-color, #001673)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>
                * 주민등록번호
              </span>
            </td>
            <td className={fieldCellClass}>
              <div className="member-form-ssn-row">
                <input key={`ssn-${member.id}`} defaultValue={info.ssn} className="member-form-ssn-row__input rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} />
                <div className="member-form-ssn-row__gender relative shrink-0">
                  <select defaultValue={info.gender} className="rounded outline-none appearance-none" style={{ ...inputStyle, width: 54, minWidth: 54, padding: "4px 22px 4px 8px" }} {...focusProps}>
                    <option value="남">남</option>
                    <option value="여">여</option>
                  </select>
                  <ChevronDown size={12} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
                </div>
                {info.ssnVerified ? (
                  <span className="member-form-action-chip member-form-action-chip--verified member-form-ssn-row__chip">✓ 인증완료</span>
                ) : (
                  <button type="button" className="member-form-action-chip member-form-action-chip--auth member-form-ssn-row__chip">✓ 실명인증</button>
                )}
              </div>
            </td>
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>EIN Number</span></td>
            <td className={fieldCellClass}><input defaultValue={info.ein} placeholder="미국 사업자 번호" className="w-full rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} /></td>
          </tr>

          {/* 6: 비자종류 | 체류기간 만료일자 */}
          <tr className="form-row-dual">
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>비자종류</span></td>
            <td className={fieldCellClass}>
              <div className="relative" style={{ display: "inline-block", width: "100%" }}>
                <select defaultValue={info.visaType} className="w-full rounded outline-none appearance-none" style={{ ...inputStyle, padding: "4px 28px 4px 8px" }} {...focusProps}>
                  <option>() 내국인</option>
                  <option>F-2 거주</option>
                  <option>F-4 재외동포</option>
                  <option>F-6 결혼이민</option>
                </select>
                <ChevronDown size={12} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
              </div>
            </td>
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>체류기간 만료일자</span></td>
            <td className={fieldCellClass}><input type="date" defaultValue={info.stayExpiry} className="w-full rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} /></td>
          </tr>

          {/* 7: 주소지 (전체 폭) */}
          <tr>
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>주소지</span></td>
            <td className={fieldWideCellClass} colSpan={fieldColSpan}>
              <div className="flex gap-1 items-center">
                <input
                  key={`addr-${member.id}`}
                  defaultValue={[info.address, info.addressDetail].filter(Boolean).join(" ")}
                  className="flex-1 min-w-0 rounded outline-none transition-all duration-200"
                  style={inputStyle}
                  {...focusProps}
                />
                <button type="button" className="shrink-0" style={{ fontSize: 12, padding: "3px 10px", background: "var(--surface-button-muted)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: 4 }}>검색</button>
              </div>
            </td>
          </tr>

          {/* 8: 우편번호 | 연락처 */}
          <tr className="form-row-dual">
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>우편번호</span></td>
            <td className={fieldCellClass}><input defaultValue={info.zip} className="w-full rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} /></td>
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>연락처</span></td>
            <td className={fieldCellClass}><input defaultValue={info.contact} className="w-full rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} /></td>
          </tr>

          {/* 9: 휴대폰번호 | 세금신고번호 */}
          <tr className="form-row-dual">
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>휴대폰번호</span></td>
            <td className={fieldCellClass}><input key={`phone-${member.id}`} defaultValue={info.phone} className="w-full rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} /></td>
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>세금신고번호</span></td>
            <td className={fieldCellClass}><input defaultValue={info.taxId} className="w-full rounded outline-none transition-all duration-200" style={inputStyle} {...focusProps} /></td>
          </tr>

          {/* 10: 메모 (전체 폭, 1줄) */}
          <tr>
            <td className={labelCellClass}><span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>메모</span></td>
            <td className={fieldWideCellClass} colSpan={fieldColSpan}>
              <input
                key={`memo-${member.id}`}
                type="text"
                defaultValue={info.memo || "VIP 회원. 2024년 4분기 우수판매자 선정. 분기 정산 우선 처리 요망. 사업자 등록 갱신 예정(2026-03)."}
                className="member-form-memo w-full rounded outline-none transition-all duration-200"
                style={inputStyle}
                {...focusProps}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </FormSection>
  );
}

function MemberLoginInfoForm({ member }: { member: Member }) {
  const inputStyle: React.CSSProperties = {
    background: "var(--input-background)",
    border: "none",
    color: "var(--foreground)",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  };
  const focusProps = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.background = "var(--input-focus-bg)";
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.background = "var(--input-background)";
    },
  };

  // 4행: 회원정보 / 회원번호·아이디 / 비밀번호·보안비밀번호 / 전자메일주소
  // 왼쪽(회원번호·비밀번호) 입력폭은 CSS에서 우편번호와 동일, 오른쪽은 나머지
  const pairFlex = "1 1 0";

  const fields = [
    {
      key: "no",
      row: 0,
      label: "* 회원번호",
      required: true,
      flex: pairFlex,
      input: (
        <input
          type="text"
          defaultValue={member.no}
          className="member-login-inline-field__input rounded outline-none transition-all duration-200"
          style={{ ...inputStyle, fontFamily: "monospace" }}
          {...focusProps}
        />
      ),
    },
    {
      key: "id",
      row: 0,
      label: "* 아이디",
      required: true,
      flex: pairFlex,
      input: (
        <input
          type="text"
          defaultValue={member.loginId}
          className="member-login-inline-field__input rounded outline-none transition-all duration-200"
          style={{ ...inputStyle, fontFamily: "monospace" }}
          {...focusProps}
        />
      ),
    },
    {
      key: "password",
      row: 1,
      label: "비밀번호",
      flex: pairFlex,
      input: (
        <input
          type="password"
          placeholder="변경 시에만 입력"
          className="member-login-inline-field__input rounded outline-none transition-all duration-200"
          style={inputStyle}
          {...focusProps}
        />
      ),
    },
    {
      key: "securePassword",
      row: 1,
      label: "보안비밀번호",
      flex: pairFlex,
      input: (
        <input
          type="password"
          placeholder="····"
          className="member-login-inline-field__input rounded outline-none transition-all duration-200"
          style={inputStyle}
          {...focusProps}
        />
      ),
    },
    {
      key: "email",
      row: 2,
      label: "전자메일주소",
      flex: pairFlex,
      input: (
        <input
          type="email"
          defaultValue={member.loginId ? `${member.loginId}@email.com` : ""}
          className="member-login-inline-field__input rounded outline-none transition-all duration-200"
          style={inputStyle}
          {...focusProps}
        />
      ),
    },
  ] as const;

  return (
    <FormSection
      title="로그인 사용정보"
      icon={<Shield size={12} />}
      className="content-form-section--member-form"
    >
      {/* 1행: 회원정보 */}
      <div className="member-login-profile-row">
        <MemberProfileHeader member={member} />
      </div>
      {/* 2~4행: 회원번호·아이디 / 비밀번호·보안비밀번호 / 전자메일주소 */}
      {[0, 1, 2].map((rowIndex) => (
        <div className="member-login-inline-row" key={rowIndex}>
          {fields
            .filter((field) => field.row === rowIndex)
            .map((field) => (
              <div
                key={field.key}
                className="member-login-inline-field"
                style={{ flex: field.flex }}
              >
                <span
                  className="member-login-inline-field__label"
                  style={{
                    color: field.required ? "var(--required-color, #001673)" : "var(--form-label-color)",
                  }}
                >
                  {field.label}
                </span>
                {field.input}
              </div>
            ))}
        </div>
      ))}
    </FormSection>
  );
}

function MemberInfoBody({
  memberId,
  listOpen,
  formColumnWidth,
  member,
  isNewDraft,
  formDraftKey,
}: {
  memberId: number;
  listOpen: boolean;
  formColumnWidth: number;
  member: Member;
  isNewDraft: boolean;
  formDraftKey: number;
}) {
  const detailContentWidth = getDetailContentWidth(formColumnWidth);
  const displayMember = isNewDraft ? createEmptyMemberDraft() : member;
  const [recommenderOpen, setRecommenderOpen] = useState(false);
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const [recommender, setRecommender] = useState({ no: "100012", name: "박민수" });
  const [sponsor, setSponsor] = useState({ no: "100008", name: "이정환" });

  useEffect(() => {
    if (isNewDraft) {
      setRecommender({ no: "", name: "" });
      setSponsor({ no: "", name: "" });
    } else {
      setRecommender({ no: "100012", name: "박민수" });
      setSponsor({ no: "100008", name: "이정환" });
    }
  }, [isNewDraft, formDraftKey, member.id]);

  const bankDefaults = isNewDraft
    ? { bank: "", swift: "", account: "", branch: "", holder: "", txn: "" }
    : { bank: "신한은행", swift: "SHBKKRSE", account: "110-234-567890", branch: "0234", holder: member.name, txn: "88012345" };

  const miscCheckboxes = isNewDraft
    ? [
        { label: "SMS 수신동의", checked: false },
        { label: "EMail 수신동의", checked: false },
        { label: "신분증 사본등록", checked: false },
        { label: "신분증 등록 신청서 접수", checked: false },
      ]
    : [
        { label: "SMS 수신동의", checked: true },
        { label: "EMail 수신동의", checked: true },
        { label: "신분증 사본등록", checked: false },
        { label: "신분증 등록 신청서 접수", checked: false },
      ];

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
          key={`member-form-${formDraftKey}-${memberId}`}
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
        <MemberLoginInfoForm member={displayMember} />

        <MemberGeneralInfoForm member={displayMember} />

        {/* 거래은행 정보 — 일반 회원정보와 동일 열폭, 3행 2열 */}
        <FormSection title="거래은행 정보" icon={<CreditCard size={12} />} className="content-form-section--member-form">
          <table className="content-form-grid content-form-grid--member member-form-grid--split member-form-grid--bank" style={{ width: "100%", borderCollapse: "collapse" }}>
            <colgroup>
              <col className="col-label-1" />
              <col className="col-field-1" />
              <col className="col-label-2" />
              <col className="col-field-2" />
            </colgroup>
            <tbody>
              {/* 1: 은행명 | 계좌번호 */}
              <tr className="form-row-dual">
                <td className="member-form-cell member-form-cell--label">
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>은행명</span>
                </td>
                <td className="member-form-cell member-form-cell--field">
                  <input
                    defaultValue={bankDefaults.bank}
                    className="w-full rounded outline-none transition-all duration-200"
                    style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)", width: "100%", minWidth: 0, boxSizing: "border-box" }}
                    onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }}
                    onBlur={(e) => { e.target.style.background = "var(--input-background)"; }}
                  />
                </td>
                <td className="member-form-cell member-form-cell--label">
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>계좌번호</span>
                </td>
                <td className="member-form-cell member-form-cell--field">
                  <input
                    defaultValue={bankDefaults.account}
                    className="w-full rounded outline-none transition-all duration-200"
                    style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)", width: "100%", minWidth: 0, boxSizing: "border-box" }}
                    onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }}
                    onBlur={(e) => { e.target.style.background = "var(--input-background)"; }}
                  />
                </td>
              </tr>
              {/* 2: 예금주 | SwiftCode */}
              <tr className="form-row-dual">
                <td className="member-form-cell member-form-cell--label">
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>예금주</span>
                </td>
                <td className="member-form-cell member-form-cell--field">
                  <input
                    defaultValue={bankDefaults.holder}
                    className="w-full rounded outline-none transition-all duration-200"
                    style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)", width: "100%", minWidth: 0, boxSizing: "border-box" }}
                    onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }}
                    onBlur={(e) => { e.target.style.background = "var(--input-background)"; }}
                  />
                </td>
                <td className="member-form-cell member-form-cell--label">
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>SwiftCode</span>
                </td>
                <td className="member-form-cell member-form-cell--field">
                  <input
                    defaultValue={bankDefaults.swift}
                    className="w-full rounded outline-none transition-all duration-200"
                    style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)", width: "100%", minWidth: 0, boxSizing: "border-box" }}
                    onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }}
                    onBlur={(e) => { e.target.style.background = "var(--input-background)"; }}
                  />
                </td>
              </tr>
              {/* 3: Branch Number | 은행통합 거래번호 */}
              <tr className="form-row-dual">
                <td className="member-form-cell member-form-cell--label">
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>Branch Number</span>
                </td>
                <td className="member-form-cell member-form-cell--field">
                  <input
                    defaultValue={bankDefaults.branch}
                    className="w-full rounded outline-none transition-all duration-200"
                    style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)", width: "100%", minWidth: 0, boxSizing: "border-box" }}
                    onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }}
                    onBlur={(e) => { e.target.style.background = "var(--input-background)"; }}
                  />
                </td>
                <td className="member-form-cell member-form-cell--label">
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>은행통합 거래번호</span>
                </td>
                <td className="member-form-cell member-form-cell--field">
                  <div className="flex gap-1 items-center" style={{ width: "100%", minWidth: 0 }}>
                    <input
                      defaultValue={bankDefaults.txn}
                      className="flex-1 min-w-0 rounded outline-none transition-all duration-200"
                      style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)", minWidth: 0, boxSizing: "border-box" }}
                      onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }}
                      onBlur={(e) => { e.target.style.background = "var(--input-background)"; }}
                    />
                    {!isNewDraft ? (
                      <span className="member-form-action-chip member-form-action-chip--verified">✓ 인증완료</span>
                    ) : null}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </FormSection>

        {/* 상위 회원과의 관계 — 거래은행과 동일 열폭, 3행 */}
        <FormSection title="상위 회원과의 관계" icon={<Users size={12} />} className="content-form-section--member-form">
          <table className="content-form-grid content-form-grid--member member-form-grid--split member-form-grid--relation" style={{ width: "100%", borderCollapse: "collapse" }}>
            <colgroup>
              <col className="col-label-1" />
              <col className="col-field-1" />
              <col className="col-label-2" />
              <col className="col-field-2" />
            </colgroup>
            <tbody>
              {/* 1: * 추천인 (전체 폭) */}
              <tr>
                <td className="member-form-cell member-form-cell--label">
                  <span style={{ fontSize: "12px", color: "var(--required-color, #001673)", fontWeight: 500 }}>* 추천인</span>
                </td>
                <td className="member-form-cell member-form-cell--field member-form-cell--field-wide" colSpan={3}>
                  <div className="member-relation-controls">
                    <input readOnly value={recommender.no} className="member-relation-input-id rounded outline-none" />
                    <input readOnly value={recommender.name} className="member-relation-input-name rounded outline-none" />
                    <span className="member-relation-count">{isNewDraft ? "0명" : "38명"}</span>
                    <button
                      type="button"
                      className="member-relation-search-btn rounded p-1 flex items-center justify-center"
                      style={{ background: "var(--surface-button-muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
                      aria-label="추천인 선택"
                      onClick={() => setRecommenderOpen(true)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              {/* 2: * 후원인 (전체 폭) */}
              <tr>
                <td className="member-form-cell member-form-cell--label">
                  <span style={{ fontSize: "12px", color: "var(--required-color, #001673)", fontWeight: 500 }}>* 후원인</span>
                </td>
                <td className="member-form-cell member-form-cell--field member-form-cell--field-wide" colSpan={3}>
                  <div className="member-relation-controls">
                    <input readOnly value={sponsor.no} className="member-relation-input-id rounded outline-none" />
                    <input readOnly value={sponsor.name} className="member-relation-input-name rounded outline-none" />
                    <span className="member-relation-count">{isNewDraft ? "0명" : "12명"}</span>
                    <button
                      type="button"
                      className="member-relation-search-btn rounded p-1 flex items-center justify-center"
                      style={{ background: "var(--surface-button-muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
                      aria-label="후원인 선택"
                      onClick={() => setSponsorOpen(true)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              {/* 3: 센터 | 직급 */}
              <tr className="form-row-dual">
                <td className="member-form-cell member-form-cell--label">
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>센터</span>
                </td>
                <td className="member-form-cell member-form-cell--field">
                  <div className="relative member-relation-select">
                    <select
                      key={`center-${formDraftKey}-${memberId}`}
                      defaultValue={isNewDraft ? "" : "본사"}
                      className="w-full rounded text-sm outline-none appearance-none member-relation-select__input"
                      style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)" }}
                    >
                      {isNewDraft ? <option value="">선택</option> : null}
                      <option value="본사">본사</option>
                      <option>광주 수완</option>
                      <option>서울 강남</option>
                      <option>부산 해운대</option>
                    </select>
                    <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ width: 24 }}>
                      <ChevronDown size={13} style={{ color: "var(--muted-foreground)" }} />
                    </div>
                  </div>
                </td>
                <td className="member-form-cell member-form-cell--label">
                  <span style={{ fontSize: "12px", color: "var(--form-label-color)", fontWeight: 500 }}>직급</span>
                </td>
                <td className="member-form-cell member-form-cell--field">
                  <div className="relative member-relation-select">
                    <select
                      key={`rank-${formDraftKey}-${memberId}`}
                      defaultValue={isNewDraft ? "" : "다이아몬드"}
                      className="w-full rounded text-sm outline-none appearance-none member-relation-select__input"
                      style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)" }}
                    >
                      {isNewDraft ? <option value="">선택</option> : null}
                      <option value="다이아몬드">다이아몬드</option>
                      <option>플래티넘</option>
                      <option>골드</option>
                      <option>실버</option>
                    </select>
                    <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none" style={{ width: 24 }}>
                      <ChevronDown size={13} style={{ color: "var(--muted-foreground)" }} />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </FormSection>

        {/* 기타 회원정보 */}
        <FormSection title="기타 회원정보" icon={<Info size={12} />} className="content-form-section--member-form">
          <div className="flex items-center gap-4 flex-wrap">
            {miscCheckboxes.map((item) => (
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
        <div className="flex justify-end pb-6" style={{ paddingTop: 3 }}>
          <button
            className="rounded font-medium transition-all duration-200"
            style={{ fontSize: 12, padding: "7px 13px", background: "var(--save-btn-bg, #007aff)", color: "var(--on-accent)", border: "none" }}
          >
            등록/저장
          </button>
        </div>
        </div>{/* 왼쪽 폼 끝 */}

        {/* 오른쪽: 조직도 카드 — 네임카드·폼과 동일한 행 너비 안에 고정 */}
        <div style={{ flex: `0 0 ${ORG_CHART_WIDTH}px`, width: ORG_CHART_WIDTH, overflow: "hidden" }}>
          <FormSection title="조직도" icon={<GitFork size={12} />} className="content-form-section--org" bodyPadding={`16px ${ORG_CHART_SIDE_PAD}px 12px`} clipBody={true}>
            {isNewDraft ? (
              <div className="flex items-center justify-center" style={{ minHeight: 120, color: "var(--text-muted)", fontSize: 12 }}>
                새 회원 등록 후 조직도가 표시됩니다.
              </div>
            ) : (
              <OrgChart memberId={member.id} memberName={member.name} />
            )}
          </FormSection>
        </div>

        <RecommenderSelectPopup
          open={recommenderOpen}
          title="추천인 선택"
          onClose={() => setRecommenderOpen(false)}
          candidates={members}
          excludeId={member.id}
          onSelect={(selected) => {
            setRecommender({ no: selected.no, name: selected.name });
            setRecommenderOpen(false);
          }}
        />

        <RecommenderSelectPopup
          open={sponsorOpen}
          title="후원인 선택"
          onClose={() => setSponsorOpen(false)}
          candidates={members}
          excludeId={member.id}
          onSelect={(selected) => {
            setSponsor({ no: selected.no, name: selected.name });
            setSponsorOpen(false);
          }}
        />

    </div>
  );
}

// ─────────────────────────────────────────────
// TopNav
// ─────────────────────────────────────────────

const mainMenus = ["기초관리", "회원관리", "주문관리", "수당관리", "출고관리", "옵션", "회원관리2"];
const disabledMainMenus = new Set(["기초관리", "회원관리2"]);

type NavSubMenuGroup = {
  title: string;
  items: string[];
};

type NavSubMenuColumn = {
  groups: NavSubMenuGroup[];
};

const memberSubMenuGroups: NavSubMenuGroup[] = [
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

const orderSubMenuColumns: NavSubMenuColumn[] = [
  {
    groups: [
      { title: "", items: ["주문서등록", "주문서승인"] },
    ],
  },
  {
    groups: [
      {
        title: "주문서 리포트",
        items: ["주문서관리", "매출보고서", "접수현황", "접수 집계표", "구매 리포트"],
      },
      {
        title: "그룹별 매출집계표",
        items: ["국가별 매출 집계표", "센터별 매출 집계표", "영업소별 매출 집계표", "조직 매출 관리자", "기간별 매출 집계표"],
      },
      {
        title: "공제조합 신고 리포트",
        items: ["매출신고 요약", "조합 신고 결과 리포트"],
      },
    ],
  },
  {
    groups: [
      { title: "마일리지 관리", items: [] },
      { title: "수금내역서", items: [] },
      {
        title: "오토십 관리",
        items: ["계약관리", "일정관리자", "일정히스토리"],
      },
    ],
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
  isPinned?: boolean;
  onSelect: (item: PageHistoryItem) => void;
  onRemove?: (id: string) => void;
}

function HistoryItemChip({ item, isActive, isPinned, onSelect, onRemove }: HistoryItemButtonProps) {
  const fullLabel = `${item.screen} · ${item.memberNo} · ${item.memberName}`;

  return (
    <span className={`visit-history-tab-group${isActive ? " is-active" : ""}`}>
      <button
        type="button"
        onClick={() => onSelect(item)}
        title={fullLabel}
        className={`visit-history-tab${isActive ? " is-active" : ""}`}
      >
        {isPinned && <Pin size={11} className="visit-history-tab-pin" />}
        <span className="visit-history-tab-label">{item.screen}</span>
      </button>
      {onRemove && isActive && (
        <span
          role="button"
          tabIndex={0}
          title="닫기"
          aria-label="탭 닫기"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onRemove(item.id);
            }
          }}
          className="visit-history-tab-close"
        >
          <X size={12} />
        </span>
      )}
    </span>
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
  onRemoveRecent: (id: string) => void;
  onGoHome: () => void;
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
  onRemoveRecent,
  onGoHome,
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
            <Pin size={12} style={{ color: "var(--required-color, #001673)" }} />
          </VisitHistoryIconButton>
          <button
            type="button"
            onClick={onToggleExpand}
            className="visit-history-collapsed-badge visit-history-collapsed-badge--pinned"
          >
            <Pin size={11} style={{ color: "var(--required-color, #001673)" }} />
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
        <button type="button" className="visit-history-tab visit-history-tab--home" onClick={onGoHome}>
          <Home size={13} />
          <span className="visit-history-tab-label">바탕화면</span>
        </button>

        {pinned.length === 0 && recent.length === 0 && (
          <span className="visit-history-empty">열린 화면 없음</span>
        )}

        <div className="visit-history-tab-strip">
          {pinned.map((item) => (
            <HistoryItemChip
              key={item.id}
              item={item}
              isActive={item.id === activeId}
              isPinned
              onSelect={onSelect}
              onRemove={onUnpin}
            />
          ))}
          {recent.map((item) => (
            <HistoryItemChip
              key={item.id}
              item={item}
              isActive={item.id === activeId}
              onSelect={onSelect}
              onRemove={onRemoveRecent}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TopNavProps {
  activeMainMenu: string;
  onMainMenuChange: (menu: string) => void;
  activeMemberSubMenu: string;
  onMemberSubMenuChange: (item: string) => void;
  onOrderSubMenuChange: (item: string) => void;
}

function MainNavDropdownGroup({
  group,
  onItemClick,
}: {
  group: NavSubMenuGroup;
  onItemClick: (item: string) => void;
}) {
  const isHeadingOnly = group.title && group.items.length === 0;

  return (
    <div className="main-nav-dropdown-group">
      {group.title ? (
        isHeadingOnly ? (
          <button
            type="button"
            role="menuitem"
            className="main-nav-dropdown-item main-nav-dropdown-item--heading"
            onClick={() => onItemClick(group.title)}
          >
            {group.title}
          </button>
        ) : (
          <div className="main-nav-dropdown-group-title">{group.title}</div>
        )
      ) : null}
      {group.items.map((item) => (
        <button
          key={item}
          type="button"
          role="menuitem"
          className="main-nav-dropdown-item"
          onClick={() => onItemClick(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

type LocaleCode = "KR" | "US" | "JP" | "CN";

const localeOptions: { code: LocaleCode; label: string; name: string }[] = [
  { code: "KR", label: "KR", name: "한국" },
  { code: "US", label: "US", name: "미국" },
  { code: "JP", label: "JP", name: "일본" },
  { code: "CN", label: "CN", name: "중국" },
];

function FlagFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg className="nav-flag-icon" viewBox="0 0 40 28" width="24" height="17" aria-hidden>
      <rect width="40" height="28" rx="2" fill="#ffffff" />
      <rect width="40" height="28" rx="2" fill="none" stroke="#cbd5e1" strokeWidth="0.8" />
      {children}
    </svg>
  );
}

function KoreaFlagIcon() {
  const bar = 1.15;
  const gap = 1.55;

  const renderThreeSolid = (x: number, y: number, w: number) => (
    <>
      <rect x={x} y={y} width={w} height={bar} fill="#1a1a1a" />
      <rect x={x} y={y + gap} width={w} height={bar} fill="#1a1a1a" />
      <rect x={x} y={y + gap * 2} width={w} height={bar} fill="#1a1a1a" />
    </>
  );

  const renderThreeBroken = (x: number, y: number, w: number) => {
    const half = (w - 0.9) / 2;
    return (
      <>
        <rect x={x} y={y} width={half} height={bar} fill="#1a1a1a" />
        <rect x={x + half + 0.9} y={y} width={half} height={bar} fill="#1a1a1a" />
        <rect x={x} y={y + gap} width={half} height={bar} fill="#1a1a1a" />
        <rect x={x + half + 0.9} y={y + gap} width={half} height={bar} fill="#1a1a1a" />
        <rect x={x} y={y + gap * 2} width={half} height={bar} fill="#1a1a1a" />
        <rect x={x + half + 0.9} y={y + gap * 2} width={half} height={bar} fill="#1a1a1a" />
      </>
    );
  };

  const renderGam = (x: number, y: number, w: number) => {
    const half = (w - 0.9) / 2;
    return (
      <>
        <rect x={x} y={y} width={w} height={bar} fill="#1a1a1a" />
        <rect x={x} y={y + gap} width={half} height={bar} fill="#1a1a1a" />
        <rect x={x + half + 0.9} y={y + gap} width={half} height={bar} fill="#1a1a1a" />
        <rect x={x} y={y + gap * 2} width={w} height={bar} fill="#1a1a1a" />
      </>
    );
  };

  const renderRi = (x: number, y: number, w: number) => {
    const half = (w - 0.9) / 2;
    return (
      <>
        <rect x={x} y={y} width={half} height={bar} fill="#1a1a1a" />
        <rect x={x + half + 0.9} y={y} width={half} height={bar} fill="#1a1a1a" />
        <rect x={x} y={y + gap} width={w} height={bar} fill="#1a1a1a" />
        <rect x={x} y={y + gap * 2} width={half} height={bar} fill="#1a1a1a" />
        <rect x={x + half + 0.9} y={y + gap * 2} width={half} height={bar} fill="#1a1a1a" />
      </>
    );
  };

  return (
    <FlagFrame>
      <g transform="translate(20 14)">
        <circle r="7" fill="#cd2e3a" />
        <path d="M0,-7A7,7 0 0,1 0,7A3.5,3.5 0 0,1 0,0A3.5,3.5 0 0,0 0,-7Z" fill="#0047a0" />
        <circle cy="-3.5" r="3.5" fill="#cd2e3a" />
        <circle cy="3.5" r="3.5" fill="#0047a0" />
      </g>
      <g>{renderThreeSolid(4.5, 4.5, 7.5)}</g>
      <g>{renderGam(28, 4.5, 7.5)}</g>
      <g>{renderRi(4.5, 18.5, 7.5)}</g>
      <g>{renderThreeBroken(28, 18.5, 7.5)}</g>
    </FlagFrame>
  );
}

function UsaFlagIcon() {
  return (
    <FlagFrame>
      <rect width="40" height="28" rx="2" fill="#b22234" />
      {[2, 6, 10, 18, 22, 26].map((y) => (
        <rect key={y} x="0" y={y} width="40" height="2" fill="#ffffff" />
      ))}
      <rect width="16" height="15" fill="#3c3b6e" />
      {[
        [3, 3], [7, 3], [11, 3], [5, 6], [9, 6], [7, 9],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.9" fill="#ffffff" />
      ))}
    </FlagFrame>
  );
}

function JapanFlagIcon() {
  return (
    <FlagFrame>
      <rect width="40" height="28" rx="2" fill="#ffffff" />
      <circle cx="20" cy="14" r="6.5" fill="#bc002d" />
    </FlagFrame>
  );
}

function ChinaFlagIcon() {
  return (
    <FlagFrame>
      <rect width="40" height="28" rx="2" fill="#de2910" />
      <polygon
        points="8,6 9.3,9.6 13.1,9.6 10,11.8 11.2,15.4 8,13.2 4.8,15.4 6,11.8 2.8,9.6 6.6,9.6"
        fill="#ffde00"
      />
      {[
        [14, 4], [16, 7], [16, 10], [14, 13],
      ].map(([cx, cy]) => (
        <polygon
          key={`${cx}-${cy}`}
          points={`${cx},${cy - 1.2} ${cx + 0.7},${cy + 0.2} ${cx + 0.2},${cy + 1.1} ${cx - 0.5},${cy + 0.5} ${cx - 1.1},${cy + 1.1} ${cx - 0.7},${cy + 0.2}`}
          fill="#ffde00"
        />
      ))}
    </FlagFrame>
  );
}

const localeFlagIcons: Record<LocaleCode, () => React.ReactElement> = {
  KR: KoreaFlagIcon,
  US: UsaFlagIcon,
  JP: JapanFlagIcon,
  CN: ChinaFlagIcon,
};

function NavLocaleMenu() {
  const [locale, setLocale] = useState<LocaleCode>("KR");
  const current = localeOptions.find((item) => item.code === locale) ?? localeOptions[0];
  const CurrentFlag = localeFlagIcons[current.code];

  return (
    <div className="nav-locale-wrap">
      <button type="button" className="nav-locale-select" aria-label={`국가 선택 ${current.label}`} aria-haspopup="menu">
        <CurrentFlag />
        <span>{current.label}</span>
      </button>
      <div className="nav-locale-dropdown" role="menu">
        {localeOptions.map((item) => {
          const ItemFlag = localeFlagIcons[item.code];
          return (
            <button
              key={item.code}
              type="button"
              role="menuitem"
              className={`nav-locale-dropdown-item${item.code === locale ? " is-active" : ""}`}
              onClick={() => setLocale(item.code)}
            >
              <ItemFlag />
              <span className="nav-locale-dropdown-name">{item.name}</span>
              <span className="nav-locale-dropdown-code">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface MemberPageChromeProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToolbarAction?: (label: string) => void;
}

function MainMenuPlaceholder({ title }: { title: string }) {
  return (
    <div className="home-page-placeholder home-page-placeholder--embedded" style={{ flex: 1, minHeight: 0, width: "100%" }}>
      <span className="home-page-placeholder__title">{title}</span>
      <span className="home-page-placeholder__desc">화면 준비 중입니다.</span>
    </div>
  );
}

function MemberPageChrome({ activeTab, onTabChange, onToolbarAction }: MemberPageChromeProps) {
  const isMemberInfoTab = activeTab === "회원정보";

  const tabBar = (
    <div className="detail-tab-bar">
      <div className="detail-tab-list">
        {subTabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              className={`detail-tab${isActive ? " is-active" : ""}`}
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="member-page-chrome">
      {isMemberInfoTab ? (
        <div className="member-page-chrome-shell">
          {tabBar}
          <div className="member-info-toolbar">
            {memberInfoToolbarItems.map((item, i) =>
              item === null ? (
                <div key={`sep-${i}`} className="member-info-toolbar-separator" aria-hidden />
              ) : (
                <button key={item.label} type="button" className="member-info-toolbar-item" onClick={() => onToolbarAction?.(item.label)}>
                  <item.icon size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
                  <span>{item.label}</span>
                </button>
              ),
            )}
          </div>
        </div>
      ) : (
        tabBar
      )}
    </div>
  );
}

function TopNav({
  activeMainMenu,
  onMainMenuChange,
  activeMemberSubMenu,
  onMemberSubMenuChange,
  onOrderSubMenuChange,
}: TopNavProps) {
  const workNotificationCount = 3;
  const [openDropdownMenu, setOpenDropdownMenu] = useState<string | null>(null);
  const navMenusRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => {
    setOpenDropdownMenu(null);
  }, []);

  const toggleDropdown = useCallback((menu: string) => {
    setOpenDropdownMenu((current) => (current === menu ? null : menu));
  }, []);

  useEffect(() => {
    if (!openDropdownMenu) return;

    const onPointerDown = (event: MouseEvent) => {
      const root = navMenusRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        closeDropdown();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openDropdownMenu, closeDropdown]);

  const handleMemberSubMenuSelect = useCallback(
    (item: string) => {
      onMemberSubMenuChange(item);
      closeDropdown();
    },
    [onMemberSubMenuChange, closeDropdown],
  );

  const handleOrderSubMenuSelect = useCallback(
    (item: string) => {
      onOrderSubMenuChange(item);
      closeDropdown();
    },
    [onOrderSubMenuChange, closeDropdown],
  );

  return (
    <div className="top-nav-shell" style={{ flexShrink: 0, minWidth: APP_MIN_WIDTH }}>
      {/* Main nav */}
      <div
        className="flex items-stretch flex-nowrap px-4"
        style={{ background: "var(--nav-bg, #333333)", borderBottom: "1px solid var(--nav-border, #0a1526)", height: 40 }}
      >
        <div className="flex items-center gap-2 mr-6 shrink-0">
          <div
            className="flex items-center justify-center rounded"
            style={{ width: 28, height: 28, background: "var(--logo-bg, #001673)", fontSize: 12, fontWeight: 700, color: "var(--on-accent)" }}
          >
            VB
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--nav-text, #fff)" }}>(주)비아블</span>
          <span style={{ fontSize: 12, color: "var(--nav-text-muted, rgba(255,255,255,0.6))", marginLeft: 4 }}>ERP</span>
        </div>
        <div ref={navMenusRef} className="flex items-stretch flex-1 min-w-0 self-stretch">
          {mainMenus.map((menu) => {
            const isActive = menu === activeMainMenu;
            const isMemberMenu = menu === "회원관리";
            const isOrderMenu = menu === "주문관리";
            const isDropdownOpen = openDropdownMenu === menu;

            if (isMemberMenu || isOrderMenu) {
              return (
                <div
                  key={menu}
                  className={`main-nav-item-wrap${isDropdownOpen ? " is-dropdown-open" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onMainMenuChange(menu);
                      toggleDropdown(menu);
                    }}
                    className={`main-nav-item${isActive ? " is-active" : ""}`}
                    aria-haspopup="menu"
                    aria-expanded={isDropdownOpen}
                  >
                    {menu}
                  </button>
                  <div
                    className={`main-nav-dropdown${isOrderMenu ? " main-nav-dropdown--order" : " main-nav-dropdown--grouped"}`}
                    role="menu"
                  >
                    <button
                      type="button"
                      className="main-nav-dropdown-close"
                      aria-label="메뉴 닫기"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        closeDropdown();
                      }}
                    >
                      <X size={14} strokeWidth={2} aria-hidden />
                    </button>
                    {isMemberMenu ? (
                      memberSubMenuGroups.map((group) => (
                        <MainNavDropdownGroup
                          key={group.title}
                          group={group}
                          onItemClick={handleMemberSubMenuSelect}
                        />
                      ))
                    ) : (
                      orderSubMenuColumns.map((column, columnIndex) => (
                        <div key={columnIndex} className="main-nav-dropdown-column">
                          {column.groups.map((group) => (
                            <MainNavDropdownGroup
                              key={group.title || group.items[0]}
                              group={group}
                              onItemClick={handleOrderSubMenuSelect}
                            />
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={menu}
                type="button"
                disabled={disabledMainMenus.has(menu)}
                title={disabledMainMenus.has(menu) ? "준비 중" : undefined}
                onClick={() => {
                  if (disabledMainMenus.has(menu)) return;
                  closeDropdown();
                  onMainMenuChange(menu);
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
          <NavLocaleMenu />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────

type SidebarNavKey =
  | "home"
  | "dashboard"
  | "member-register"
  | "members"
  | "order-register"
  | "org-chart"
  | "add-shortcut";

const navItems: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; label: string; key: SidebarNavKey }[] = [
  { icon: Home, label: "홈", key: "home" },
  { icon: LayoutDashboard, label: "대시보드", key: "dashboard" },
  { icon: UserPlus, label: "회원등록", key: "member-register" },
  { icon: ShoppingCart, label: "주문서등록", key: "order-register" },
  { icon: GitFork, label: "조직도", key: "org-chart" },
  { icon: Plus, label: "바로가기 추가", key: "add-shortcut" },
];

const sidebarRailSlotKeys = navItems.map((item) => item.key);

const bottomItems = [
  { icon: HelpCircle, label: "도움말" },
  { icon: Settings, label: "설정" },
];

const themes: { key: Theme; color: string; label: string }[] = [
  { key: "deep-purple", color: "#007aff", label: "라이트" },
  { key: "dark",        color: "#0f1117", label: "다크" },
];

interface SidebarProps {
  activeNavKey: SidebarNavKey | null;
  onNavChange: (key: SidebarNavKey) => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}

function SidebarNavButton({
  label,
  isActive,
  onClick,
  children,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`sidebar-nav-item group relative${isActive ? " is-active" : ""}`}
    >
      {children}
      <span className="sidebar-nav-tooltip">{label}</span>
    </button>
  );
}

function SidebarMembersToggle({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="회원검색"
      aria-pressed={isOpen}
      onClick={onClick}
      className={`sidebar-members-toggle${isOpen ? " is-open" : ""}`}
    >
      <Search size={14} className="sidebar-members-toggle__icon" strokeWidth={2.4} aria-hidden />
      <span className="sidebar-members-toggle__label">회원검색</span>
    </button>
  );
}

function MembersRailSidebar({
  anchorKey,
  memberListOpen,
  onToggle,
}: {
  anchorKey: SidebarNavKey;
  memberListOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className="app-members-rail"
      aria-label="회원목록 패널"
      style={{ width: MEMBERS_RAIL_WIDTH, minWidth: MEMBERS_RAIL_WIDTH }}
    >
      <div className="app-members-rail__slots">
        {sidebarRailSlotKeys.map((slotKey) => (
          <div
            key={slotKey}
            className={`sidebar-rail-slot${slotKey === anchorKey ? " is-anchor" : ""}`}
          >
            {slotKey === anchorKey ? (
              <SidebarMembersToggle isOpen={memberListOpen} onClick={onToggle} />
            ) : (
              <div className="sidebar-nav-slot-spacer" aria-hidden />
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

function Sidebar({ activeNavKey, onNavChange, theme, onThemeChange }: SidebarProps) {
  return (
    <div
      className="app-sidebar flex flex-col items-center py-4 gap-1"
      style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH, height: "100%", background: "var(--sidebar-bg, #393939)", borderRight: "1px solid var(--nav-border, var(--border))", flexShrink: 0 }}
    >
      <div className="flex flex-col items-center gap-1 flex-1">
        {navItems.map((item) => (
          <SidebarNavButton
            key={item.key}
            label={item.label}
            isActive={activeNavKey === item.key}
            onClick={() => onNavChange(item.key)}
          >
            <item.icon size={18} className="sidebar-nav-item-icon" />
          </SidebarNavButton>
        ))}
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
              className={`sidebar-theme-swatch group relative${theme === t.key ? " is-active" : ""}`}
              aria-label={t.label}
              style={{ background: t.color }}
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
  const [selectedMember, setSelectedMember] = useState(20);
  const [orderSelectedMemberId, setOrderSelectedMemberId] = useState<number | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [isListResizing, setIsListResizing] = useState(false);
  const [listWidth, setListWidth] = useState(() => clampMemberListWidth(MEMBER_LIST_DEFAULT_WIDTH));
  const [activeTab, setActiveTab] = useState("회원정보");
  const [activeSidebarKey, setActiveSidebarKey] = useState<SidebarNavKey>("home");
  const [homeActiveTask, setHomeActiveTask] = useState<"desktop" | HomeShortcutKey>("desktop");
  const [activeMainMenu, setActiveMainMenu] = useState("회원관리");
  const [activeMemberSubMenu, setActiveMemberSubMenu] = useState("회원등록");
  const [activeOrderSubMenu, setActiveOrderSubMenu] = useState("주문서등록");
  const [theme, setTheme] = useState<Theme>("deep-purple");
  const [historyRailExpanded, setHistoryRailExpanded] = useState(true);
  const [pinnedPages, setPinnedPages] = useState<PageHistoryItem[]>([]);
  const [recentPages, setRecentPages] = useState<PageHistoryItem[]>([]);
  const [appContentWidth, setAppContentWidth] = useState(0);
  const appContentRef = useRef<HTMLDivElement>(null);
  const resizing = useRef(false);

  const isHomeView = activeSidebarKey === "home" && activeMainMenu === "회원관리";
  const isBasicManagement = activeMainMenu === "기초관리";
  const isMenuPlaceholder =
    activeMainMenu === "수당관리" || activeMainMenu === "출고관리" || activeMainMenu === "옵션";

  const memberListNavEnabled =
    !isHomeView &&
    ((activeMainMenu === "회원관리" && (activeMemberSubMenu === "회원등록" || activeMemberSubMenu === "조직도인쇄")) ||
      (activeMainMenu === "주문관리" && activeOrderSubMenu === "주문서등록"));
  const memberListOpen = memberListNavEnabled && listOpen;

  const showMembersNav =
    !isHomeView &&
    ((activeMainMenu === "회원관리" &&
      activeMemberSubMenu === "회원등록" &&
      activeTab === "회원정보") ||
      (activeMainMenu === "회원관리" && activeMemberSubMenu === "조직도인쇄") ||
      (activeMainMenu === "주문관리" && activeOrderSubMenu === "주문서등록"));

  const membersRailAnchorKey: SidebarNavKey =
    activeMainMenu === "회원관리" && activeMemberSubMenu === "조직도인쇄"
      ? "org-chart"
      : activeMainMenu === "주문관리" && activeOrderSubMenu === "주문서등록"
        ? "order-register"
        : "member-register";

  // 사이드바 아이콘은 클릭 이력이 아니라 현재 열려 있는 화면을 따라간다
  const sidebarActiveKey: SidebarNavKey | null = isHomeView
    ? homeActiveTask === "dashboard"
      ? "dashboard"
      : "home"
    : activeMainMenu === "주문관리" && activeOrderSubMenu === "주문서등록"
      ? "order-register"
      : activeMainMenu === "회원관리" && activeMemberSubMenu === "조직도인쇄"
        ? "org-chart"
        : activeMainMenu === "회원관리" && activeMemberSubMenu === "회원등록"
          ? "member-register"
          : null;

  const formColumnWidth = useMemo(() => {
    if (!memberListOpen || appContentWidth <= 0) {
      return FORM_COLUMN_WIDTH_MIN;
    }
    const availableDetail = appContentWidth - listWidth;
    return calcFormColumnWidth(availableDetail);
  }, [memberListOpen, listWidth, appContentWidth]);

  const isOrderManagement = activeMainMenu === "주문관리";
  const isOrgChartScreen = activeMainMenu === "회원관리" && activeMemberSubMenu === "조직도인쇄";
  const isMm2MemberInfoTab = activeMainMenu === "회원관리2" && activeTab === "회원정보";
  const isMemberInfoTab = activeMainMenu === "회원관리" && activeTab === "회원정보";

  const detailPanelMinWidth = useMemo(() => {
    if (isOrderManagement && activeOrderSubMenu === "주문서등록") {
      // 회원목록이 열려도 오른쪽 폼 1000px + 왼쪽 최소폭 유지
      return ORDER_MGMT_DETAIL_MIN_WIDTH;
    }
    if (isOrgChartScreen) {
      return 0;
    }
    if (isMm2MemberInfoTab) {
      return getMm2DetailPanelWidth(MM2_INFO_GROUP_WIDTH);
    }
    if (isMemberInfoTab) {
      return getDetailPanelWidth(formColumnWidth);
    }
    return ORDER_PANEL_MIN_WIDTH;
  }, [isOrderManagement, activeOrderSubMenu, isOrgChartScreen, isMm2MemberInfoTab, isMemberInfoTab, formColumnWidth]);

  const isFixedDetailWidth =
    memberListOpen &&
    ((isOrderManagement && activeOrderSubMenu === "주문서등록") ||
      isOrgChartScreen ||
      (activeMainMenu === "회원관리" && !isMemberInfoTab) ||
      (activeMainMenu === "회원관리2" && !isMm2MemberInfoTab));

  const contentRowMinWidth = memberListOpen
    ? listWidth + detailPanelMinWidth
    : 0;

  // 바탕화면에서는 열린 화면이 없으므로 탭을 쌓지 않는다
  const activePageId = isHomeView ? "" : makePageId(activeTab, selectedMember);

  useEffect(() => {
    if (isHomeView) return;
    const item = toHistoryItem(activeTab, selectedMember);
    if (!item) return;
    setRecentPages((prev) => {
      const filtered = prev.filter((p) => p.id !== item.id);
      return [item, ...filtered].slice(0, RECENT_HISTORY_MAX);
    });
  }, [activeTab, selectedMember, isHomeView]);

  // 탭이 가리키는 화면은 회원관리 > 회원등록 상세이므로 바탕화면에서도 그 화면으로 빠져나온다
  const handleHistorySelect = useCallback((item: PageHistoryItem) => {
    setActiveSidebarKey("member-register");
    setActiveMainMenu("회원관리");
    setActiveMemberSubMenu("회원등록");
    setActiveTab(item.screen);
    setSelectedMember(item.memberId);
  }, []);

  const handlePinCurrent = useCallback(() => {
    if (isHomeView) return;
    const item = toHistoryItem(activeTab, selectedMember);
    if (!item) return;
    setPinnedPages((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;
      return [item, ...prev];
    });
  }, [activeTab, selectedMember, isHomeView]);

  const handleUnpin = useCallback((id: string) => {
    setPinnedPages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleRemoveRecent = useCallback((id: string) => {
    setRecentPages((prev) => prev.filter((p) => p.id !== id));
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
    setListOpen(false);

    if (menu === "회원관리") {
      setActiveMemberSubMenu("회원등록");
      setActiveTab("회원정보");
      setActiveSidebarKey("member-register");
    }
  }, []);

  const handleOrderSubMenuChange = useCallback((item: string) => {
    setActiveOrderSubMenu(item);
    setActiveMainMenu("주문관리");
    if (item === "주문서등록") {
      setActiveSidebarKey("order-register");
      setOrderSelectedMemberId(null);
    }
    setListOpen(false);
  }, []);

  const handleMemberSubMenuChange = useCallback((item: string) => {
    setActiveMemberSubMenu(item);
    setActiveMainMenu("회원관리");
    if (item === "회원등록") {
      setActiveTab("회원정보");
      setActiveSidebarKey("member-register");
    } else if (item === "조직도인쇄") {
      setActiveSidebarKey("org-chart");
    }
    setListOpen(false);
  }, []);

  const handleNavigateToOrderManagement = useCallback(() => {
    setActiveOrderSubMenu("주문서등록");
    setActiveMainMenu("주문관리");
    setActiveSidebarKey("order-register");
    setOrderSelectedMemberId(selectedMember);
    setListOpen(false);
  }, [selectedMember]);

  const handleMemberTableSelect = useCallback(
    (id: number) => {
      setSelectedMember(id);
      if (activeMainMenu === "주문관리" && activeOrderSubMenu === "주문서등록") {
        setOrderSelectedMemberId(id);
      }
    },
    [activeMainMenu, activeOrderSubMenu],
  );

  const handleNavigateToOrgChart = useCallback(() => {
    handleMemberSubMenuChange("조직도인쇄");
  }, [handleMemberSubMenuChange]);

  const navigateFromSidebar = useCallback((key: SidebarNavKey) => {
    if (key === "add-shortcut") return;

    if (key === "members") {
      const onMemberInfoScreen =
        activeSidebarKey !== "home" &&
        activeMainMenu === "회원관리" &&
        activeMemberSubMenu === "회원등록" &&
        activeTab === "회원정보";

      const onOrderRegisterScreen =
        activeSidebarKey !== "home" &&
        activeMainMenu === "주문관리" &&
        activeOrderSubMenu === "주문서등록";

      const onOrgChartScreen =
        activeSidebarKey !== "home" &&
        activeMainMenu === "회원관리" &&
        activeMemberSubMenu === "조직도인쇄";

      if (onMemberInfoScreen || onOrderRegisterScreen || onOrgChartScreen) {
        setListOpen((open) => !open);
        return;
      }

      setActiveSidebarKey("member-register");
      setActiveMainMenu("회원관리");
      setActiveMemberSubMenu("회원등록");
      setActiveTab("회원정보");
      setListOpen(false);
      return;
    }

    setActiveSidebarKey(key);

    switch (key) {
      case "home":
        setHomeActiveTask("desktop");
        setListOpen(false);
        return;
      case "dashboard":
        setActiveSidebarKey("home");
        setHomeActiveTask("dashboard");
        setListOpen(false);
        return;
      case "member-register":
        setActiveMainMenu("회원관리");
        setActiveMemberSubMenu("회원등록");
        setActiveTab("회원정보");
        setListOpen(false);
        return;
      case "order-register":
        setActiveMainMenu("주문관리");
        setActiveOrderSubMenu("주문서등록");
        setOrderSelectedMemberId(null);
        setListOpen(false);
        return;
      case "org-chart":
        setActiveMainMenu("회원관리");
        setActiveMemberSubMenu("조직도인쇄");
        setListOpen(false);
        return;
    }
  }, [activeMainMenu, activeMemberSubMenu, activeOrderSubMenu, activeSidebarKey, activeTab]);

  const handleHomeShortcut = useCallback((key: HomeShortcutKey) => {
    if (key === "add-shortcut") return;

    if (key === "dashboard") {
      setActiveSidebarKey("home");
      setHomeActiveTask("dashboard");
      setListOpen(false);
      return;
    }

    if (key === "member-register") {
      setActiveSidebarKey("member-register");
      setActiveMainMenu("회원관리");
      setActiveMemberSubMenu("회원등록");
      setActiveTab("회원정보");
      setListOpen(false);
      return;
    }
    if (key === "order-register") {
      navigateFromSidebar("order-register");
      return;
    }
    if (key === "org-chart") {
      navigateFromSidebar("org-chart");
    }
  }, [navigateFromSidebar]);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    setIsListResizing(true);
    function onMove(ev: MouseEvent) {
      if (!resizing.current) return;
      const sidebarOffset = SIDEBAR_WIDTH + (showMembersNav ? MEMBERS_RAIL_WIDTH : 0);
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
  }, [showMembersNav]);

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
        activeMemberSubMenu={activeMemberSubMenu}
        onMemberSubMenuChange={handleMemberSubMenuChange}
        onOrderSubMenuChange={handleOrderSubMenuChange}
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
          activeNavKey={sidebarActiveKey}
          onNavChange={navigateFromSidebar}
          theme={theme}
          onThemeChange={setTheme}
        />

        {showMembersNav && (
          <MembersRailSidebar
            anchorKey={membersRailAnchorKey}
            memberListOpen={memberListOpen}
            onToggle={() => navigateFromSidebar("members")}
          />
        )}

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
          className={`member-list-panel${isListResizing ? " is-resizing" : ""}`}
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
              selectedId={
                activeMainMenu === "주문관리" && activeOrderSubMenu === "주문서등록"
                  ? orderSelectedMemberId ?? -1
                  : selectedMember
              }
              onSelect={handleMemberTableSelect}
              listOpen={memberListOpen}
              listWidth={listWidth}
            />
          </div>
          {memberListOpen && (
            <div
              className={`panel-splitter${isListResizing ? " is-active" : ""}`}
              role="separator"
              aria-orientation="vertical"
              aria-label="회원목록 패널 크기 조절"
              onMouseDown={onResizeStart}
            >
              <span className="panel-splitter__line" aria-hidden />
              <span className="panel-splitter__grip" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </div>
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
                ? ORDER_MGMT_DETAIL_MIN_WIDTH
                : isOrgChartScreen
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
          {isHomeView ? (
            <HomeDesktopView
              activeTask={homeActiveTask}
              onShortcutClick={handleHomeShortcut}
            />
          ) : isBasicManagement ? (
            <BasicManagementView />
          ) : isMenuPlaceholder ? (
            <MainMenuPlaceholder title={activeMainMenu} />
          ) : isOrderManagement ? (
            activeOrderSubMenu === "주문서등록" ? (
              <OrderManagementView
                key={orderSelectedMemberId ?? "order-empty"}
                member={
                  orderSelectedMemberId == null
                    ? null
                    : getMemberById(orderSelectedMemberId)
                }
              />
            ) : activeOrderSubMenu === "주문서관리" ? (
              <OrderListManageView />
            ) : (
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
                <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-body)" }}>{activeOrderSubMenu}</span>
                <span style={{ fontSize: 14 }}>화면 준비 중입니다.</span>
              </div>
            )
          ) : activeMainMenu === "회원관리2" ? (
            <MemberManagement2View
              memberId={selectedMember}
              listOpen={memberListOpen}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          ) : activeMainMenu === "회원관리" && activeMemberSubMenu === "조직도인쇄" ? (
            <MemberOrgChartView member={getMemberById(selectedMember)} />
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
              onNavigateToOrderManagement={handleNavigateToOrderManagement}
              onNavigateToOrgChart={handleNavigateToOrgChart}
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
          onRemoveRecent={handleRemoveRecent}
          onGoHome={() => navigateFromSidebar("home")}
        />
      </div>
      </div>
    </div>
  );
}
