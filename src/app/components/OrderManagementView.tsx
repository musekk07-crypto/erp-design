import React, { useCallback, useRef, useState } from "react";
import {
  RefreshCw,
  Search,
  FilePlus,
  FileText,
  RotateCcw,
  Repeat2,
  CheckCircle2,
  Ban,
  ShoppingCart,
  Pencil,
  Trash2,
  Save,
  Copy,
  FolderOpen,
  Ellipsis,
} from "lucide-react";
import type { ProfileMember } from "./Mm2ProfileCard";

const OM_CHECKBOX_WIDTH = 36;
const OM_CHECKBOX_PAD_LEFT = 14;
const OM_ROW_PAD_Y = 6;
const OM_DEFAULT_ALIGN: NonNullable<OmColumn["align"]> = "center";
const ORDER_MGMT_SPLITTER_WIDTH = 21;
const ORDER_MGMT_H_SPLITTER_HEIGHT = 12;
/** 오른쪽 폼 기본 너비 — 회원목록 오픈 시에도 레이아웃 최소폭 기준으로 사용 */
const ORDER_MGMT_RIGHT_DEFAULT = 1000;
/** 스플리터로 오른쪽을 줄일 수 있는 최소폭 */
const ORDER_MGMT_RIGHT_MIN = 560;
/** 왼쪽은 표 가로스크롤로 대응하므로 최소만 보장 */
const ORDER_MGMT_LEFT_MIN = 360;
const ORDER_MGMT_ORDERS_SHARE_DEFAULT = 0.55;
const ORDER_MGMT_ORDERS_SHARE_MIN = 0.28;
const ORDER_MGMT_ORDERS_SHARE_MAX = 0.72;

function clampOrdersListShare(share: number) {
  return Math.max(ORDER_MGMT_ORDERS_SHARE_MIN, Math.min(ORDER_MGMT_ORDERS_SHARE_MAX, share));
}

export const ORDER_MGMT_DETAIL_MIN_WIDTH =
  ORDER_MGMT_LEFT_MIN + ORDER_MGMT_SPLITTER_WIDTH + ORDER_MGMT_RIGHT_DEFAULT;

function clampOrderMgmtRightWidth(width: number, bodyWidth?: number) {
  let next = Math.max(ORDER_MGMT_RIGHT_MIN, width);
  if (bodyWidth && bodyWidth > 0) {
    const max = Math.max(
      ORDER_MGMT_RIGHT_MIN,
      bodyWidth - ORDER_MGMT_LEFT_MIN - ORDER_MGMT_SPLITTER_WIDTH,
    );
    next = Math.min(next, max);
  }
  return next;
}

type OmColumn = {
  key: string;
  label: string;
  width: number;
  align?: "left" | "right" | "center";
  cellType?: "checkbox" | "product-code";
};

type OmProductRow = Record<string, string | number | boolean | undefined> & {
  depth?: 0 | 1;
  groupId?: string;
  lineNo?: string;
  expandable?: boolean;
};

function getOmColumnAlign(col: OmColumn) {
  return col.align ?? OM_DEFAULT_ALIGN;
}

function getOmTableMinWidth(columns: OmColumn[]) {
  return OM_CHECKBOX_WIDTH + columns.reduce((sum, col) => sum + col.width, 0);
}

const OM_MONO_KEYS = new Set(["deductNo", "orderNo", "code", "paymentNo", "accountNo", "approveNo"]);
const OM_LINK_KEYS = new Set(["orderNo", "recipient"]);
const OM_BOLD_KEYS = new Set(["recipient"]);

const orderListColumns: OmColumn[] = [
  { key: "no", label: "No", width: 36, align: "center" },
  { key: "deductNo", label: "공제번호", width: 156, align: "left" },
  { key: "deductStatus", label: "공제신고상태명", width: 100, align: "center" },
  { key: "orderNo", label: "주문서번호", width: 96, align: "left" },
  { key: "orderDate", label: "주문일자", width: 84, align: "center" },
  { key: "allowanceDate", label: "수당적용일자", width: 92, align: "center" },
  { key: "plan", label: "플랜명", width: 72, align: "center" },
  { key: "purchaseType", label: "구매구분명", width: 80, align: "center" },
  { key: "orderStatus", label: "주문서상태명", width: 88, align: "center" },
  { key: "cash", label: "현금", width: 72, align: "right" },
  { key: "online", label: "온라인", width: 80, align: "right" },
  { key: "card", label: "카드", width: 80, align: "right" },
  { key: "pointTotal", label: "포인트합", width: 80, align: "right" },
  { key: "supplyTotal", label: "공급가합", width: 80, align: "right" },
  { key: "salesTotal", label: "매출금액합", width: 88, align: "right" },
  { key: "recipient", label: "인수자명", width: 72, align: "left" },
  { key: "note", label: "비고", width: 96, align: "left" },
];

function buildOrderListRows(member: ProfileMember | null) {
  if (!member) return [];
  const name = member.name;
  return [
    {
      no: 1,
      deductNo: "45972605060200251",
      deductStatus: "신고완료",
      orderNo: "2604300126",
      orderDate: "2026-04-30",
      allowanceDate: "2026-04-30",
      plan: "일반",
      purchaseType: "구매",
      orderStatus: "배송완료",
      cash: "0",
      online: "0",
      card: "39,000",
      pointTotal: "3,900",
      supplyTotal: "35,455",
      salesTotal: "39,000",
      recipient: name,
      note: "",
    },
    {
      no: 2,
      deductNo: "45972604050200020",
      deductStatus: "신고완료",
      orderNo: "2604100098",
      orderDate: "2026-04-10",
      allowanceDate: "2026-04-10",
      plan: "일반",
      purchaseType: "구매",
      orderStatus: "주문취소",
      cash: "0",
      online: "0",
      card: "447,000",
      pointTotal: "44,700",
      supplyTotal: "406,364",
      salesTotal: "447,000",
      recipient: name,
      note: "",
      rowTone: "danger",
    },
    {
      no: 3,
      deductNo: "45972604040200018",
      deductStatus: "신고완료",
      orderNo: "2604100087",
      orderDate: "2026-04-10",
      allowanceDate: "2026-04-10",
      plan: "일반",
      purchaseType: "구매",
      orderStatus: "구매확정",
      cash: "0",
      online: "0",
      card: "159,000",
      pointTotal: "15,900",
      supplyTotal: "144,545",
      salesTotal: "159,000",
      recipient: name,
      note: "",
    },
    {
      no: 4,
      deductNo: "45972603300200041",
      deductStatus: "신고완료",
      orderNo: "2603300154",
      orderDate: "2026-03-30",
      allowanceDate: "2026-03-30",
      plan: "일반",
      purchaseType: "구매",
      orderStatus: "배송완료",
      cash: "0",
      online: "0",
      card: "89,000",
      pointTotal: "8,900",
      supplyTotal: "80,909",
      salesTotal: "89,000",
      recipient: name,
      note: "",
    },
    {
      no: 5,
      deductNo: "45972603200200033",
      deductStatus: "신고대기",
      orderNo: "2603200112",
      orderDate: "2026-03-20",
      allowanceDate: "2026-03-20",
      plan: "일반",
      purchaseType: "구매",
      orderStatus: "구매확정",
      cash: "0",
      online: "0",
      card: "128,000",
      pointTotal: "12,800",
      supplyTotal: "116,364",
      salesTotal: "128,000",
      recipient: name,
      note: "",
    },
    {
      no: 6,
      deductNo: "45972603150200027",
      deductStatus: "신고완료",
      orderNo: "2603150099",
      orderDate: "2026-03-15",
      allowanceDate: "2026-03-15",
      plan: "일반",
      purchaseType: "구매",
      orderStatus: "배송완료",
      cash: "0",
      online: "0",
      card: "210,400",
      pointTotal: "21,040",
      supplyTotal: "191,273",
      salesTotal: "210,400",
      recipient: name,
      note: "",
    },
    {
      no: 7,
      deductNo: "45972602280200019",
      deductStatus: "신고완료",
      orderNo: "2602280076",
      orderDate: "2026-02-28",
      allowanceDate: "2026-02-28",
      plan: "일반",
      purchaseType: "구매",
      orderStatus: "배송완료",
      cash: "0",
      online: "0",
      card: "76,000",
      pointTotal: "7,600",
      supplyTotal: "69,091",
      salesTotal: "76,000",
      recipient: name,
      note: "",
    },
    {
      no: 8,
      deductNo: "45972602100200011",
      deductStatus: "신고완료",
      orderNo: "2602100055",
      orderDate: "2026-02-10",
      allowanceDate: "2026-02-10",
      plan: "일반",
      purchaseType: "구매",
      orderStatus: "구매확정",
      cash: "0",
      online: "0",
      card: "95,000",
      pointTotal: "9,500",
      supplyTotal: "86,364",
      salesTotal: "95,000",
      recipient: name,
      note: "",
    },
    {
      no: 9,
      deductNo: "45972601300200008",
      deductStatus: "신고완료",
      orderNo: "2601300042",
      orderDate: "2026-01-30",
      allowanceDate: "2026-01-30",
      plan: "일반",
      purchaseType: "구매",
      orderStatus: "배송완료",
      cash: "0",
      online: "0",
      card: "142,000",
      pointTotal: "14,200",
      supplyTotal: "129,091",
      salesTotal: "142,000",
      recipient: name,
      note: "",
    },
    {
      no: 10,
      deductNo: "45972601150200003",
      deductStatus: "신고완료",
      orderNo: "2601150021",
      orderDate: "2026-01-15",
      allowanceDate: "2026-01-15",
      plan: "일반",
      purchaseType: "구매",
      orderStatus: "구매확정",
      cash: "0",
      online: "0",
      card: "135,000",
      pointTotal: "13,500",
      supplyTotal: "122,727",
      salesTotal: "135,000",
      recipient: name,
      note: "",
    },
  ];
}

const orderListSummaryRow = {
  no: "",
  deductNo: "",
  deductStatus: "",
  orderNo: "",
  orderDate: "",
  allowanceDate: "",
  plan: "",
  purchaseType: "",
  orderStatus: "합계",
  cash: "0",
  online: "0",
  card: "1,520,400",
  pointTotal: "152,040",
  supplyTotal: "1,382,183",
  salesTotal: "1,520,400",
  recipient: "",
  note: "",
};

const productListColumns: OmColumn[] = [
  { key: "no", label: "No", width: 40, align: "center" },
  { key: "code", label: "번호", width: 120, align: "left", cellType: "product-code" },
  { key: "product", label: "상품정보", width: 280, align: "left" },
  { key: "point", label: "포인트", width: 88, align: "right" },
  { key: "salePrice", label: "판매가격", width: 96, align: "right" },
  { key: "consumerPrice", label: "소비자가", width: 96, align: "right" },
  { key: "price4", label: "가격4", width: 88, align: "right" },
  { key: "price5", label: "가격5", width: 88, align: "right" },
  { key: "price6", label: "가격6", width: 88, align: "right" },
  { key: "price7", label: "가격7", width: 88, align: "right" },
];

const paymentListColumns: OmColumn[] = [
  { key: "no", label: "No", width: 40, align: "center" },
  { key: "code", label: "번호", width: 48, align: "center" },
  { key: "pg", label: "PG", width: 72, align: "center" },
  { key: "paymentNo", label: "결제번호", width: 140, align: "left" },
  { key: "collectionType", label: "수금구분명", width: 88, align: "center" },
  { key: "includeAmount", label: "금액포함", width: 72, cellType: "checkbox", align: "center" },
  { key: "accountName", label: "계정명", width: 120, align: "left" },
  { key: "accountNo", label: "계정번호", width: 140, align: "left" },
  { key: "amount", label: "금액", width: 88, align: "right" },
  { key: "installment", label: "할부개월수", width: 80, align: "right" },
  { key: "approveNo", label: "승인번호", width: 72, align: "left" },
  { key: "approveDate", label: "승인일자", width: 96, align: "center" },
  { key: "expireDate", label: "만료일자", width: 96, align: "center" },
  { key: "ownerName", label: "소유자명", width: 72, align: "left" },
  { key: "manualSlip", label: "수기전표", width: 72, cellType: "checkbox", align: "center" },
  { key: "memo", label: "메모", width: 180, align: "left" },
];

const paymentListRows = [
  {
    no: 1,
    code: 2,
    pg: "카드수기",
    paymentNo: "26041006190544",
    collectionType: "일반",
    includeAmount: true,
    accountName: "신한(엘지)카드",
    accountNo: "5155-****-****-4997",
    amount: "159,000",
    installment: 0,
    approveNo: "3",
    approveDate: "2026-04-10",
    expireDate: "",
    ownerName: "이광오",
    manualSlip: true,
    memo: "TID - 2026041017C2783760",
  },
  {
    no: 2,
    code: 3,
    pg: "현금",
    paymentNo: "26061743198512",
    collectionType: "일반",
    includeAmount: true,
    accountName: "",
    accountNo: "",
    amount: "50,000",
    installment: 0,
    approveNo: "",
    approveDate: "2026-06-17",
    expireDate: "",
    ownerName: "",
    manualSlip: false,
    memo: "",
  },
];

/** 상위(세트) 안에 하위 구성품이 포함된 데모 — 번호(lineNo)는 하위에만 표시 */
const productListRows: OmProductRow[] = [
  {
    no: 1,
    code: "",
    product: "[1000000051_2] 뉴시아 혈당케어+ 생유산균 2박스 (총 60포입)",
    point: "31,500",
    salePrice: "189,000",
    consumerPrice: "210,000",
    price4: "180,000",
    price5: "175,000",
    price6: "170,000",
    price7: "165,000",
    depth: 0,
    groupId: "set-1",
    expandable: true,
  },
  {
    no: "",
    code: "260401235",
    lineNo: "260401235",
    product: "[0000000041] 뉴시아 혈당케어 플러스 생유산균 1박스 (30포)",
    point: "15,750",
    salePrice: "94,500",
    consumerPrice: "105,000",
    price4: "90,000",
    price5: "87,500",
    price6: "85,000",
    price7: "82,500",
    depth: 1,
    groupId: "set-1",
  },
  {
    no: 3,
    code: "",
    product: "[1000000051_3] 뉴시아 혈당케어+ 생유산균 선물세트 (30포입 x 4박스)",
    point: "111,600",
    salePrice: "669,600",
    consumerPrice: "744,000",
    price4: "640,000",
    price5: "620,000",
    price6: "600,000",
    price7: "580,000",
    depth: 0,
    groupId: "set-3",
    expandable: true,
  },
  {
    no: "",
    code: "260401236",
    lineNo: "260401236",
    product: "[0000000042] 뉴시아 혈당케어 플러스 생유산균 4박스 (120포)",
    point: "55,800",
    salePrice: "334,800",
    consumerPrice: "372,000",
    price4: "320,000",
    price5: "310,000",
    price6: "300,000",
    price7: "290,000",
    depth: 1,
    groupId: "set-3",
  },
];

function filterProductRowsByExpand(
  rows: OmProductRow[],
  expandedGroups: Record<string, boolean>,
) {
  const visible: OmProductRow[] = [];
  let currentGroup: string | null = null;

  for (const row of rows) {
    if (row.depth === 0) {
      currentGroup = row.groupId ?? null;
      visible.push(row);
      continue;
    }
    if (currentGroup && expandedGroups[currentGroup] !== false) {
      visible.push(row);
    }
  }

  return visible;
}

function OmProductCodeCell({
  row,
  expanded = true,
  onToggle,
}: {
  row: OmProductRow;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  if (row.depth === 0 && row.expandable) {
    return (
      <span className="order-mgmt-product-code order-mgmt-product-code--parent">
        <button
          type="button"
          className="order-mgmt-product-tree-toggle"
          aria-expanded={expanded}
          aria-label={expanded ? "구성품 접기" : "구성품 펼치기"}
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
        >
          {expanded ? "−" : "+"}
        </button>
      </span>
    );
  }

  if (row.depth === 1) {
    const lineNo = String(row.lineNo ?? row.code ?? "");
    return (
      <span className="order-mgmt-product-code order-mgmt-product-code--child">
        <span className="order-mgmt-product-tree-branch" aria-hidden />
        <span className="order-mgmt-product-line-no">{lineNo}</span>
      </span>
    );
  }

  return <>{row.code ?? ""}</>;
}

function OmToolbarButton({
  icon: Icon,
  label,
  inline = false,
}: {
  icon: React.ElementType;
  label: string;
  inline?: boolean;
}) {
  return (
    <button type="button" className={`order-mgmt-toolbar-item${inline ? " order-mgmt-toolbar-item--inline" : ""}`}>
      <Icon size={inline ? 16 : 18} strokeWidth={1.5} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
      <span>{label}</span>
    </button>
  );
}

function OmOrderToolbarButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button type="button" className="member-info-toolbar-item order-mgmt-order-toolbar__item">
      <Icon size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
      <span>{label}</span>
    </button>
  );
}

function OmIconToolbarButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button type="button" className="order-mgmt-icon-btn" aria-label={label}>
      <Icon size={16} />
    </button>
  );
}

function OmSectionTitle({ title }: { title: string }) {
  return (
    <div className="order-mgmt-block-title">
      <span className="order-mgmt-section-bullet" aria-hidden />
      <span>{title}</span>
    </div>
  );
}

function OmMemberInfoTitle({ name, memberNo }: { name?: string; memberNo?: string }) {
  const hasMember = Boolean(name && memberNo);
  return (
    <div className="order-mgmt-block-title">
      <span className="order-mgmt-section-bullet" aria-hidden />
      <span className="order-mgmt-member-info-title-text">
        {hasMember ? (
          <>
            <span className="order-mgmt-member-info-title-name">{name}</span>
            <span className="order-mgmt-member-info-title-no">({memberNo})</span>
            <span className="order-mgmt-member-info-title-desc"> 회원의 일반회원정보</span>
          </>
        ) : (
          <span className="order-mgmt-member-info-title-desc">회원의 일반회원정보</span>
        )}
      </span>
    </div>
  );
}

function getCompactColWidth(
  col: OmColumn,
  colIndex: number,
  columns: OmColumn[],
  spreadTailFrom?: number,
): React.CSSProperties {
  if (spreadTailFrom === undefined || colIndex < spreadTailFrom) {
    return { width: col.width };
  }

  const leadingFixedWidth =
    OM_CHECKBOX_WIDTH + columns.slice(0, spreadTailFrom).reduce((sum, c) => sum + c.width, 0);
  const tailWeight = columns.slice(spreadTailFrom).reduce((sum, c) => sum + c.width, 0);
  const ratio = col.width / tailWeight;

  return { width: `calc((100% - ${leadingFixedWidth}px) * ${ratio})` };
}

function OmDataTable({
  columns,
  rows,
  selectedRow,
  onSelectRow,
  summaryRow,
  layout = "fill",
  spreadTailFrom,
  disableFiller = false,
  showFullText = false,
  expandedGroups,
  onToggleGroup,
}: {
  columns: OmColumn[];
  rows: OmProductRow[];
  selectedRow?: number;
  onSelectRow?: (index: number) => void;
  summaryRow?: Record<string, string | number>;
  layout?: "fill" | "compact";
  spreadTailFrom?: number;
  disableFiller?: boolean;
  showFullText?: boolean;
  expandedGroups?: Record<string, boolean>;
  onToggleGroup?: (groupId: string) => void;
}) {
  const isCompact = layout === "compact";
  const useEdgeSpread = isCompact && spreadTailFrom !== undefined && !showFullText;
  const useFiller = isCompact && !useEdgeSpread && !disableFiller;
  const useFixedMinScroll = !useEdgeSpread;
  const enableHorizontalScroll = useFixedMinScroll;
  const tableMinWidth = getOmTableMinWidth(columns);
  const cellPadX = 8;
  const checkboxPadLeft = isCompact ? 10 : OM_CHECKBOX_PAD_LEFT;

  const cellStyle: React.CSSProperties = {
    padding: `${OM_ROW_PAD_Y}px ${cellPadX}px`,
    fontSize: "var(--font-size-xs)",
    color: "var(--text-body)",
    whiteSpace: "nowrap",
    ...(showFullText
      ? { overflow: "visible", textOverflow: "clip" }
      : { overflow: "hidden", textOverflow: "ellipsis" }),
  };

  const checkboxCellStyle: React.CSSProperties = {
    padding: `${OM_ROW_PAD_Y}px ${cellPadX}px ${OM_ROW_PAD_Y}px ${checkboxPadLeft}px`,
    textAlign: "left",
    fontSize: "var(--font-size-xs)",
    color: "var(--text-body)",
    whiteSpace: "nowrap",
    ...(showFullText
      ? { overflow: "visible", textOverflow: "clip" }
      : { overflow: "hidden", textOverflow: "ellipsis" }),
  };

  const checkboxHeaderStyle: React.CSSProperties = {
    ...checkboxCellStyle,
    background: "var(--split-table-header-bg, var(--surface-table-header))",
  };

  const getDataCellStyle = (col: OmColumn): React.CSSProperties => ({
    ...cellStyle,
    textAlign: getOmColumnAlign(col),
    fontVariantNumeric: getOmColumnAlign(col) === "right" ? "tabular-nums" : undefined,
    fontFamily: OM_MONO_KEYS.has(col.key) ? "var(--font-mono)" : undefined,
    color: OM_LINK_KEYS.has(col.key) ? "var(--accent-primary)" : cellStyle.color,
    fontWeight: OM_BOLD_KEYS.has(col.key) ? 600 : 400,
  });

  const fillerHeaderStyle: React.CSSProperties = {
    padding: 0,
    background: "var(--split-table-header-bg, var(--surface-table-header))",
  };

  const fillerCellStyle: React.CSSProperties = {
    padding: 0,
  };

  return (
    <div
      className={`split-table-block order-mgmt-table-wrap flex flex-col flex-1 min-h-0${isCompact ? " order-mgmt-table-wrap--compact" : " order-mgmt-table-wrap--fill"}${enableHorizontalScroll ? " order-mgmt-table-wrap--scroll-x" : ""}`}
      style={{ background: "var(--surface-panel)" }}
    >
      <div
        className="flex-1 min-h-0"
        style={{ width: "100%", overflowY: "auto", overflowX: enableHorizontalScroll ? "auto" : "hidden" }}
      >
        <div
          style={
            enableHorizontalScroll
              ? { width: "100%", minWidth: tableMinWidth }
              : { width: "100%", height: "100%" }
          }
        >
        <table
          style={{
            borderCollapse: "collapse",
            width: useEdgeSpread ? "100%" : showFullText ? "max-content" : useFixedMinScroll ? tableMinWidth : "100%",
            minWidth: enableHorizontalScroll ? tableMinWidth : undefined,
            tableLayout: showFullText ? "auto" : "fixed",
          }}
        >
          <colgroup>
            <col style={{ width: OM_CHECKBOX_WIDTH }} />
            {columns.map((col, index) => (
              <col
                key={col.key}
                style={
                  useEdgeSpread
                    ? getCompactColWidth(col, index, columns, spreadTailFrom)
                    : { width: col.width }
                }
              />
            ))}
            {useFiller && <col />}
          </colgroup>
          <thead className="split-table-head" style={{ position: "sticky", top: 0, zIndex: 2 }}>
            <tr
              style={{
                background: "var(--split-table-header-bg, var(--surface-table-header))",
                borderBottom: "1px solid var(--split-table-header-border, var(--border))",
              }}
            >
              <th style={checkboxHeaderStyle}>
                <input type="checkbox" readOnly style={{ accentColor: "var(--checkbox-accent)", cursor: "pointer" }} />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...cellStyle,
                    textAlign: getOmColumnAlign(col),
                    fontWeight: 500,
                    color: "var(--split-table-header-fg, #f8fafc)",
                    background: "var(--split-table-header-bg, var(--surface-table-header))",
                  }}
                >
                  {col.label}
                </th>
              ))}
              {useFiller && <th className="order-mgmt-table-filler" style={fillerHeaderStyle} aria-hidden="true" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isSelected = selectedRow === index;
              const isDanger = row.rowTone === "danger";
              return (
                <tr
                  key={index}
                  className={`member-table-row${isSelected ? " is-selected" : ""}${isDanger ? " is-danger" : ""}`}
                  onClick={() => onSelectRow?.(index)}
                  style={{ cursor: onSelectRow ? "pointer" : undefined }}
                >
                  <td style={checkboxCellStyle} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" readOnly style={{ accentColor: "var(--checkbox-accent)", cursor: "pointer" }} />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} style={getDataCellStyle(col)}>
                      {col.cellType === "checkbox" ? (
                        <input
                          type="checkbox"
                          readOnly
                          defaultChecked={Boolean(row[col.key])}
                          style={{ accentColor: "var(--checkbox-accent)", cursor: "pointer" }}
                        />
                      ) : col.cellType === "product-code" ? (
                        <OmProductCodeCell
                          row={row}
                          expanded={
                            row.groupId
                              ? expandedGroups?.[row.groupId] !== false
                              : true
                          }
                          onToggle={
                            row.groupId
                              ? () => onToggleGroup?.(row.groupId!)
                              : undefined
                          }
                        />
                      ) : (
                        row[col.key] ?? ""
                      )}
                    </td>
                  ))}
                  {useFiller && <td className="order-mgmt-table-filler" style={fillerCellStyle} aria-hidden="true" />}
                </tr>
              );
            })}
            {summaryRow && (
              <tr className="order-mgmt-summary-row">
                <td style={checkboxCellStyle} />
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      ...getDataCellStyle(col),
                      fontWeight: 600,
                    }}
                  >
                    {summaryRow[col.key] ?? ""}
                  </td>
                ))}
                {useFiller && <td className="order-mgmt-table-filler" style={fillerCellStyle} aria-hidden="true" />}
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function OmFormField({
  label,
  value,
  type = "text",
  full = false,
  suffix,
}: {
  label: string;
  value?: string;
  type?: string;
  full?: boolean;
  suffix?: React.ReactNode;
}) {
  return (
    <label className={`order-mgmt-field${full ? " order-mgmt-field--full" : ""}`}>
      <span className="order-mgmt-field-label">{label}</span>
      <span className="order-mgmt-field-control">
        <input type={type} className="order-mgmt-input" defaultValue={value} style={{ flex: 1, minWidth: 0 }} />
        {suffix}
      </span>
    </label>
  );
}

function OmFormSelect({ label, value, options }: { label: string; value: string; options: string[] }) {
  return (
    <label className="order-mgmt-field">
      <span className="order-mgmt-field-label">{label}</span>
      <select className="order-mgmt-input order-mgmt-select" defaultValue={value}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function OmFormFieldInline({
  label,
  value = "",
  readOnly = false,
  type = "text",
  suffix,
}: {
  label: string;
  value?: string;
  readOnly?: boolean;
  type?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <label className="order-mgmt-field order-mgmt-field--inline">
      <span className="order-mgmt-field-label">{label}</span>
      <span className="order-mgmt-field-control">
        <input
          type={type}
          className={`order-mgmt-input${readOnly ? " order-mgmt-input--readonly" : ""}`}
          defaultValue={value}
          readOnly={readOnly}
        />
        {suffix}
      </span>
    </label>
  );
}

function OmFormSelectInline({ label, value, options }: { label: string; value: string; options: string[] }) {
  return (
    <label className="order-mgmt-field order-mgmt-field--inline">
      <span className="order-mgmt-field-label">{label}</span>
      <span className="order-mgmt-field-control">
        <select className="order-mgmt-input order-mgmt-select" defaultValue={value}>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

function OmShippingInfo({ member }: { member: ProfileMember | null }) {
  const address = member
    ? member.region === "서울 강남"
      ? "서울특별시 강남구 테헤란로 123"
      : member.region.includes("김해") || member.region.includes("경남")
        ? "경남 김해시 우암로 106 (건영아파트) 301동 504호"
        : `${member.region} (상세주소)`
    : "";
  const zipCode = member
    ? member.region.includes("김해") || member.region.includes("경남")
      ? "50949"
      : member.region.includes("서울")
        ? "06236"
        : ""
    : "";

  return (
    <div className="order-mgmt-block-wrap">
      <OmSectionTitle title="배송지 및 인수자 정보" />
      <section className="order-mgmt-form-box order-mgmt-shipping-box">
        <div className="order-mgmt-form-body order-mgmt-shipping-form">
          <div className="order-mgmt-shipping-detail">
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--full order-mgmt-shipping-detail-row--divider">
              <OmFormFieldInline label="인수자명" value={member?.name ?? ""} />
            </div>
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--divider">
              <OmFormFieldInline label="인수자연락처" value="" />
              <OmFormFieldInline label="인수자핸드폰번호" value={member?.phone ?? ""} />
            </div>
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--divider">
              <OmFormSelectInline label="배송방법" value="택배" options={["직접수령", "택배", "퀵서비스"]} />
            </div>

            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--full order-mgmt-shipping-detail-row--divider">
              <OmFormFieldInline
                label="배송지주소"
                value={address}
                suffix={
                  <button type="button" className="order-mgmt-ellipsis-btn" aria-label="주소 검색">
                    ...
                  </button>
                }
              />
            </div>

            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--divider">
              <OmFormFieldInline label="city" value="" />
              <OmFormFieldInline label="state" value="" />
            </div>
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--divider">
              <OmFormSelectInline label="배송국가" value="South Korea" options={["South Korea", "United States", "Japan"]} />
              <OmFormFieldInline label="우편번호" value={zipCode} readOnly />
            </div>
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--divider">
              <OmFormFieldInline label="세금" value="0" />
              <OmFormFieldInline label="배송비용" value="0" />
            </div>
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--full">
              <OmFormFieldInline label="요구사항" value="" />
            </div>
          </div>
        </div>
      </section>

      <div className="order-mgmt-shipping-footer">
        <div className="order-mgmt-meta order-mgmt-meta--shipping">
          <span>생성일시: 2026-06-17 09:12:33 .myoffice</span>
          <span>수정일시: 2026-06-17 14:28:01 .myoffice</span>
        </div>
        <button type="button" className="order-mgmt-save-btn">
          <Save size={14} />
          등록/저장
        </button>
      </div>
    </div>
  );
}

function OmOrderBasicInfo({ member }: { member: ProfileMember | null }) {
  const centerOptions = ["NUXIA2359", "김해", "서울"];
  const centerValue = member
    ? member.region.includes("서울")
      ? "NUXIA2359"
      : member.region.includes("김해")
        ? "김해"
        : member.region || "NUXIA2359"
    : "NUXIA2359";
  const centerSelectOptions = centerOptions.includes(centerValue)
    ? centerOptions
    : [centerValue, ...centerOptions];
  const txnTypes = ["구매", "교환", "교환구매", "교환반품", "포인트", "반품"];

  return (
    <div className="order-mgmt-block-wrap">
      <OmSectionTitle title="주문서 기본정보" />
      <section className="order-mgmt-form-box">
        <div className="order-mgmt-form-body order-mgmt-basic-form">
          <div className="order-mgmt-radio-group" role="radiogroup" aria-label="거래구분">
            {txnTypes.map((type, index) => (
              <label key={type} className="order-mgmt-radio-item">
                <input type="radio" name="order-txn-type" defaultChecked={index === 0} />
                <span>{type}</span>
              </label>
            ))}
          </div>

          <div className="order-mgmt-shipping-detail">
            <div className="order-mgmt-shipping-detail-row">
              <OmFormFieldInline label="제품주문일자" value="2026-06-17" type="date" />
              <OmFormFieldInline label="수당적용일자" value="2026-06-17" type="date" />
            </div>
            <p className="order-mgmt-form-note order-mgmt-form-note--divider">
              ※주문일자는 매출집계에 사용되며 수당적용일이 수당계산에 사용됩니다.
            </p>
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--divider">
              <OmFormSelectInline
                label="국가"
                value="South Korea"
                options={["South Korea", "United States", "Japan"]}
              />
              <OmFormSelectInline
                label="센터"
                value={centerValue}
                options={centerSelectOptions}
              />
            </div>
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--divider">
              <OmFormSelectInline
                label="영업소"
                value="영업소"
                options={["영업소", "본사", "지점"]}
              />
              <OmFormSelectInline label="고객유형" value="판매원" options={["판매원", "소비자", "일반"]} />
            </div>
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--divider">
              <OmFormSelectInline
                label="접수구분"
                value="방문"
                options={["방문", "전화", "온라인", "오토십"]}
              />
              <OmFormSelectInline
                label="주문서상태"
                value="주문승인"
                options={["주문승인", "구매확정", "주문접수"]}
              />
            </div>
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--full">
              <OmFormFieldInline label="메모" value="" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function OmPaymentInfo() {
  return (
    <div className="order-mgmt-block-wrap order-mgmt-block-wrap--payment">
      <div className="order-mgmt-block-title order-mgmt-block-title--payment">
        <span className="order-mgmt-section-bullet order-mgmt-section-bullet--square" aria-hidden />
        <span>현금 및 온라인 카드 결제정보</span>
      </div>
      <section className="order-mgmt-form-box order-mgmt-payment-box">
        <div className="order-mgmt-payment-toolbar">
          <OmIconToolbarButton icon={FilePlus} label="추가" />
          <OmIconToolbarButton icon={Copy} label="복사" />
          <OmIconToolbarButton icon={FolderOpen} label="열기" />
          <OmIconToolbarButton icon={Pencil} label="수정" />
          <OmIconToolbarButton icon={Trash2} label="삭제" />
          <OmIconToolbarButton icon={RefreshCw} label="새로고침" />
        </div>

        <div className="order-mgmt-payment-table">
          <OmDataTable
            columns={paymentListColumns}
            rows={paymentListRows}
            layout="compact"
            showFullText
          />
        </div>
      </section>

      <section className="order-mgmt-form-box order-mgmt-cash-receipt-box" aria-label="현금영수증">
        <div className="order-mgmt-form-body order-mgmt-payment-form">
          <div className="order-mgmt-shipping-detail">
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--full">
              <label className="order-mgmt-field order-mgmt-field--inline">
                <span className="order-mgmt-field-label">현금영수증</span>
                <span className="order-mgmt-field-control">
                  <select className="order-mgmt-input order-mgmt-select order-mgmt-payment-receipt-select" defaultValue="없음">
                    <option value="없음">없음</option>
                    <option value="소득공제">소득공제</option>
                    <option value="지출증빙">지출증빙</option>
                  </select>
                  <input type="text" className="order-mgmt-input order-mgmt-payment-receipt-input" />
                  <label className="order-mgmt-checkbox-field order-mgmt-payment-receipt-check">
                    <input type="checkbox" readOnly />
                    <span>발급완료</span>
                  </label>
                </span>
              </label>
            </div>
            <p className="order-mgmt-form-note order-mgmt-form-note--alert order-mgmt-form-note--divider">
              ※현금 및 온라인 주문 등록시 현금영수증을 신청합니다.
            </p>
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--divider">
              <OmFormFieldInline label="신청일자" value="2026-06-17" type="date" />
              <OmFormFieldInline label="승인번호" value="" />
            </div>
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--full order-mgmt-shipping-detail-row--divider">
              <OmFormFieldInline label="승인금액" value="0" />
            </div>
            <div className="order-mgmt-shipping-detail-row order-mgmt-shipping-detail-row--full">
              <OmFormFieldInline label="비고" value="" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function OmMemberInfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="order-mgmt-member-info-field">
      <span className="order-mgmt-member-info-field__label">{label}</span>
      <span className="order-mgmt-member-info-field__value">{value}</span>
    </div>
  );
}

function OmMemberInfoPanel({ member }: { member: ProfileMember | null }) {
  const centerCode = member
    ? member.region.includes("서울")
      ? "NUXIA2359"
      : member.region
    : "";
  const address = member
    ? member.region === "서울 강남"
      ? "경남 김해시 우암로 106 (건영아파트) 301동504호"
      : `${member.region} (상세주소)`
    : "";

  return (
    <div className="order-mgmt-block-wrap">
      <OmMemberInfoTitle name={member?.name} memberNo={member?.no} />
      <section className="order-mgmt-member-info">
        <div className="order-mgmt-member-info-grid">
          <OmMemberInfoField label="회원번호" value={member?.no ?? ""} />
          <OmMemberInfoField label="회원명" value={member?.name ?? ""} />
          <OmMemberInfoField label="주민등록번호" value={member?.ssn ?? ""} />
          <OmMemberInfoField label="전화번호" value={member?.phone ?? ""} />
          <OmMemberInfoField label="센터" value={centerCode} />
          <OmMemberInfoField label="주소지" value={address} />
        </div>
      </section>
    </div>
  );
}

export function OrderManagementView({ member }: { member: ProfileMember | null }) {
  const [selectedOrder, setSelectedOrder] = useState(1);
  const [isRightDragging, setIsRightDragging] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(ORDER_MGMT_RIGHT_DEFAULT);
  const [isPanelResizing, setIsPanelResizing] = useState(false);
  const [isListSplitResizing, setIsListSplitResizing] = useState(false);
  const [ordersListShare, setOrdersListShare] = useState(ORDER_MGMT_ORDERS_SHARE_DEFAULT);
  const [expandedProductGroups, setExpandedProductGroups] = useState<Record<string, boolean>>({
    "set-1": true,
    "set-3": true,
  });
  const orderListRows = buildOrderListRows(member);
  const activeProductRows = member
    ? filterProductRowsByExpand(productListRows, expandedProductGroups)
    : [];
  const productSummaryRow = member
    ? {
        no: "",
        code: "",
        product: "합계",
        point: "143,100",
        salePrice: "858,600",
        consumerPrice: "954,000",
        price4: "820,000",
        price5: "795,000",
        price6: "770,000",
        price7: "745,000",
      }
    : undefined;

  const toggleProductGroup = useCallback((groupId: string) => {
    setExpandedProductGroups((prev) => ({
      ...prev,
      [groupId]: prev[groupId] === false,
    }));
  }, []);
  const bodyRef = useRef<HTMLDivElement>(null);
  const listsStackRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLElement>(null);
  const rightDragState = useRef({ dragging: false, startY: 0, scrollTop: 0 });

  const onSplitResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPanelResizing(true);
    const startX = e.clientX;
    const startWidth = rightPanelWidth;

    function onMove(ev: MouseEvent) {
      const bodyW = bodyRef.current?.clientWidth ?? 0;
      const delta = startX - ev.clientX;
      // 스플리터를 오른쪽으로 끌면 오른쪽 폭이 줄어들고, 왼쪽이 넓어진다
      setRightPanelWidth(clampOrderMgmtRightWidth(startWidth + delta, bodyW));
    }

    function onUp() {
      setIsPanelResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [rightPanelWidth]);

  const onListSplitResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const stack = listsStackRef.current;
    if (!stack) return;

    setIsListSplitResizing(true);
    const startY = e.clientY;
    const startShare = ordersListShare;
    const usable = Math.max(1, stack.clientHeight - ORDER_MGMT_H_SPLITTER_HEIGHT);

    function onMove(ev: MouseEvent) {
      const deltaShare = (ev.clientY - startY) / usable;
      setOrdersListShare(clampOrdersListShare(startShare + deltaShare));
    }

    function onUp() {
      setIsListSplitResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [ordersListShare]);

  const isRightDragTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return !target.closest("input, select, textarea, button, a, label, option");
  };

  const onRightMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (isPanelResizing || isListSplitResizing || e.button !== 0 || !isRightDragTarget(e.target)) return;
    rightDragState.current = {
      dragging: true,
      startY: e.clientY,
      scrollTop: rightScrollRef.current?.scrollTop ?? 0,
    };
    setIsRightDragging(true);
  };

  const onRightMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!rightDragState.current.dragging || !rightScrollRef.current) return;
    e.preventDefault();
    const dy = e.clientY - rightDragState.current.startY;
    rightScrollRef.current.scrollTop = rightDragState.current.scrollTop - dy;
  };

  const endRightDrag = () => {
    rightDragState.current.dragging = false;
    setIsRightDragging(false);
  };

  const viewResizingClass = isPanelResizing
    ? " is-resizing"
    : isListSplitResizing
      ? " is-h-resizing"
      : "";

  return (
    <div className={`order-mgmt-view${viewResizingClass}`}>
      <div className="order-mgmt-body" ref={bodyRef}>
        <div className="order-mgmt-left">
          <OmMemberInfoPanel member={member} />

          <div className="order-mgmt-left-lists" ref={listsStackRef}>
            <div
              className="order-mgmt-block-wrap order-mgmt-block-wrap--orders"
              style={{ flex: `${ordersListShare} 1 0` }}
            >
              <OmSectionTitle title="주문서 목록" />
              <div className="order-mgmt-order-toolbar-shell">
                <div className="member-info-toolbar order-mgmt-order-toolbar">
                  <OmOrderToolbarButton icon={FilePlus} label="새로 주문하기" />
                  <OmOrderToolbarButton icon={FileText} label="거래명세서" />
                  <OmOrderToolbarButton icon={RotateCcw} label="반품등록" />
                  <OmOrderToolbarButton icon={Repeat2} label="교환등록" />
                  <OmOrderToolbarButton icon={CheckCircle2} label="주문서승인" />
                  <OmOrderToolbarButton icon={Ban} label="주문서취소" />
                </div>
              </div>
              <section className="order-mgmt-section order-mgmt-section--orders">
              <div className="order-mgmt-toolbar order-mgmt-toolbar--compact order-mgmt-toolbar--orders">
                <div className="order-mgmt-orders-filter-row">
                  <span className="order-mgmt-filter-label">검색기간</span>
                  <select
                    className="order-mgmt-filter-input order-mgmt-filter-select order-mgmt-filter-select--period"
                    defaultValue="올해*"
                  >
                    <option value="오늘*">오늘*</option>
                    <option value="7일내">7일내</option>
                    <option value="14일내">14일내</option>
                    <option value="한달내">한달내</option>
                    <option value="1년내">1년내</option>
                    <option value="이번주*">이번주*</option>
                    <option value="이번달*">이번달*</option>
                    <option value="올해*">올해*</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                  </select>
                  <span className="order-mgmt-filter-label">인수자명</span>
                  <input
                    type="text"
                    className="order-mgmt-filter-input order-mgmt-filter-input--text order-mgmt-filter-input--recipient"
                    defaultValue={member?.name ?? ""}
                  />
                  <select className="order-mgmt-filter-input order-mgmt-filter-select" defaultValue="전체">
                    <option value="전체">전체</option>
                    <option value="출고완료">출고완료</option>
                    <option value="주문접수">주문접수</option>
                  </select>
                  <button type="button" className="order-mgmt-filter-btn" aria-label="새로고침">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
              <OmDataTable
                columns={orderListColumns}
                rows={orderListRows}
                layout="compact"
                showFullText
                selectedRow={selectedOrder}
                onSelectRow={setSelectedOrder}
                summaryRow={member ? orderListSummaryRow : undefined}
              />
              </section>
            </div>

            <div
              className="order-mgmt-splitter order-mgmt-splitter--horizontal"
              role="separator"
              aria-orientation="horizontal"
              aria-label="주문서·구입제품 목록 높이 조절"
              onMouseDown={onListSplitResizeStart}
            >
              <span className="panel-splitter__line" aria-hidden />
              <span className="panel-splitter__grip" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </div>

            <div
              className="order-mgmt-block-wrap order-mgmt-block-wrap--products"
              style={{ flex: `${1 - ordersListShare} 1 0` }}
            >
              <OmSectionTitle title="구입제품 목록" />
              <div className="order-mgmt-order-toolbar-shell">
                <div className="member-info-toolbar order-mgmt-order-toolbar">
                  <OmOrderToolbarButton icon={FileText} label="문서" />
                  <OmOrderToolbarButton icon={Pencil} label="수정" />
                  <OmOrderToolbarButton icon={Trash2} label="삭제" />
                  <OmOrderToolbarButton icon={RefreshCw} label="새로고침" />
                </div>
              </div>
              <section className="order-mgmt-section order-mgmt-section--products">
              <div className="order-mgmt-toolbar order-mgmt-toolbar--compact order-mgmt-toolbar--product">
                <div className="order-mgmt-product-filter-row">
                  <span className="order-mgmt-filter-label">주문서 구입제품</span>
                  <input
                    type="text"
                    className="order-mgmt-filter-input order-mgmt-product-code-input"
                    aria-label="제품코드"
                  />
                  <input
                    type="text"
                    className="order-mgmt-filter-input order-mgmt-product-name-input"
                    aria-label="제품명"
                    readOnly
                  />
                  <button type="button" className="order-mgmt-filter-btn" aria-label="제품검색">
                    <Ellipsis size={14} />
                  </button>
                  <span className="order-mgmt-filter-label">구입수량</span>
                  <input type="number" className="order-mgmt-qty-input" defaultValue={1} min={1} />
                  <OmOrderToolbarButton icon={ShoppingCart} label="장바구니 추가" />
                </div>
              </div>

              <OmDataTable
                columns={productListColumns}
                rows={activeProductRows}
                layout="compact"
                showFullText
                summaryRow={productSummaryRow}
                expandedGroups={expandedProductGroups}
                onToggleGroup={toggleProductGroup}
              />
              </section>
            </div>
          </div>
        </div>

        <div
          className="order-mgmt-splitter"
          role="separator"
          aria-orientation="vertical"
          aria-label="주문관리 패널 크기 조절"
          onMouseDown={onSplitResizeStart}
        >
          <span className="panel-splitter__line" aria-hidden />
          <span className="panel-splitter__grip" aria-hidden>
            <span />
            <span />
            <span />
          </span>
        </div>

        <aside
          ref={rightScrollRef}
          className={`order-mgmt-right order-mgmt-right--drag-scroll${isRightDragging ? " is-dragging" : ""}`}
          style={{
            width: rightPanelWidth,
            minWidth: rightPanelWidth,
            maxWidth: rightPanelWidth,
            flexShrink: 0,
          }}
          onMouseDown={onRightMouseDown}
          onMouseMove={onRightMouseMove}
          onMouseUp={endRightDrag}
          onMouseLeave={endRightDrag}
        >
          <OmOrderBasicInfo member={member} />
          <OmPaymentInfo />
          <OmShippingInfo member={member} />
        </aside>
      </div>
    </div>
  );
}
