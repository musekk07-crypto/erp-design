import React, { useState } from "react";
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
} from "lucide-react";
import type { ProfileMember } from "./Mm2ProfileCard";

const OM_CHECKBOX_WIDTH = 36;
const OM_CHECKBOX_PAD_LEFT = 14;
const OM_ROW_PAD_Y = 6;

type OmColumn = { key: string; label: string; width: number; align?: "left" | "right" | "center"; mono?: boolean; link?: boolean };

const orderListColumns: OmColumn[] = [
  { key: "no", label: "No", width: 36, align: "center" },
  { key: "deductNo", label: "공제번호", width: 88, mono: true },
  { key: "deductStatus", label: "공제신고상태명", width: 96 },
  { key: "orderNo", label: "주문서번호", width: 96, mono: true, link: true },
  { key: "orderDate", label: "주문일자", width: 84, mono: true },
  { key: "allowanceDate", label: "수당적용일자", width: 92, mono: true },
  { key: "plan", label: "플랜명", width: 72 },
];

const productListColumns: OmColumn[] = [
  { key: "no", label: "No", width: 36, align: "center" },
  { key: "code", label: "번호", width: 72, mono: true },
  { key: "product", label: "상품정보", width: 140 },
  { key: "point", label: "포인트", width: 64, align: "right" },
  { key: "salePrice", label: "판매가격", width: 72, align: "right" },
  { key: "consumerPrice", label: "소비자가", width: 72, align: "right" },
  { key: "price4", label: "가격4", width: 64, align: "right" },
  { key: "price5", label: "가격5", width: 64, align: "right" },
  { key: "price6", label: "가격6", width: 64, align: "right" },
  { key: "price7", label: "가격7", width: 64, align: "right" },
];

const orderListRows = [
  {
    no: 1,
    deductNo: "D202605001",
    deductStatus: "신고완료",
    orderNo: "O20260512001",
    orderDate: "2026-05-12",
    allowanceDate: "2026-06-01",
    plan: "기본플랜",
  },
  {
    no: 2,
    deductNo: "D202605002",
    deductStatus: "신고대기",
    orderNo: "O20260513002",
    orderDate: "2026-05-13",
    allowanceDate: "2026-06-01",
    plan: "기본플랜",
  },
  {
    no: 3,
    deductNo: "D202605003",
    deductStatus: "신고완료",
    orderNo: "O20260514003",
    orderDate: "2026-05-14",
    allowanceDate: "2026-06-01",
    plan: "VIP플랜",
  },
];

const productListRows = [
  {
    no: 1,
    code: "6489175",
    product: "[6489175] 테스트상품 A",
    point: "3,000",
    salePrice: "45,000",
    consumerPrice: "50,000",
    price4: "42,000",
    price5: "40,000",
    price6: "38,000",
    price7: "36,000",
  },
  {
    no: 2,
    code: "6489176",
    product: "[6489176] 오메가3 캡슐",
    point: "5,000",
    salePrice: "68,000",
    consumerPrice: "75,000",
    price4: "65,000",
    price5: "62,000",
    price6: "60,000",
    price7: "58,000",
  },
];

function OmToolbarButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button type="button" className="order-mgmt-toolbar-item">
      <Icon size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
      <span>{label}</span>
    </button>
  );
}

function OmSectionTitle({ title }: { title: string }) {
  return (
    <div className="order-mgmt-section-title">
      <span className="order-mgmt-section-bullet" aria-hidden />
      <span>{title}</span>
    </div>
  );
}

function OmDataTable({
  columns,
  rows,
  selectedRow,
  onSelectRow,
  summaryRow,
}: {
  columns: OmColumn[];
  rows: Record<string, string | number>[];
  selectedRow?: number;
  onSelectRow?: (index: number) => void;
  summaryRow?: Record<string, string | number>;
}) {
  const dataWeight = columns.reduce((sum, col) => sum + col.width, 0);

  const cellStyle: React.CSSProperties = {
    padding: `${OM_ROW_PAD_Y}px 8px`,
    fontSize: 13,
    color: "var(--text-body)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const checkboxCellStyle: React.CSSProperties = {
    padding: `${OM_ROW_PAD_Y}px 8px ${OM_ROW_PAD_Y}px ${OM_CHECKBOX_PAD_LEFT}px`,
    textAlign: "left",
  };

  const checkboxHeaderStyle: React.CSSProperties = {
    padding: `${OM_ROW_PAD_Y}px 8px ${OM_ROW_PAD_Y}px ${OM_CHECKBOX_PAD_LEFT}px`,
    textAlign: "left",
    background: "var(--split-table-header-bg, var(--surface-table-header))",
  };

  return (
    <div
      className="split-table-block order-mgmt-table-wrap flex flex-col flex-1 min-h-0"
      style={{ background: "var(--surface-panel)" }}
    >
      <div style={{ width: "100%", overflowY: "auto", overflowX: "hidden", flex: 1, minHeight: 0 }}>
        <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: OM_CHECKBOX_WIDTH }} />
            {columns.map((col) => (
              <col key={col.key} style={{ width: `${(col.width / dataWeight) * 100}%` }} />
            ))}
          </colgroup>
          <thead className="split-table-head" style={{ position: "sticky", top: 0, zIndex: 2 }}>
            <tr
              style={{
                background: "var(--split-table-header-bg, var(--surface-table-header))",
                borderBottom: "1px solid var(--split-table-header-border, var(--border))",
              }}
            >
              <th style={checkboxHeaderStyle}>
                <input type="checkbox" readOnly style={{ accentColor: "var(--accent-primary)", cursor: "pointer" }} />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: `${OM_ROW_PAD_Y}px 8px`,
                    textAlign: "left",
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
            {rows.map((row, index) => {
              const isSelected = selectedRow === index;
              return (
                <tr
                  key={index}
                  className={`member-table-row${isSelected ? " is-selected" : ""}`}
                  onClick={() => onSelectRow?.(index)}
                  style={{ cursor: onSelectRow ? "pointer" : undefined }}
                >
                  <td style={{ ...cellStyle, ...checkboxCellStyle }} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" readOnly style={{ accentColor: "var(--accent-primary)", cursor: "pointer" }} />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        ...cellStyle,
                        textAlign: col.align ?? "left",
                        fontFamily: col.mono ? "monospace" : undefined,
                        color: col.link ? "var(--accent-primary)" : cellStyle.color,
                        fontWeight: col.link ? 600 : 400,
                      }}
                    >
                      {row[col.key] ?? ""}
                    </td>
                  ))}
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
                      ...cellStyle,
                      textAlign: col.align ?? "left",
                      fontWeight: 600,
                    }}
                  >
                    {summaryRow[col.key] ?? ""}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
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

function OmOrderBasicInfo({ member }: { member: ProfileMember }) {
  const centerCode = member.region.includes("서울") ? "NUXIA2359" : "NUXIA2359";
  const txnTypes = ["구매", "교환", "교환구매", "교환반품", "포인트", "반품"];

  return (
    <section className="order-mgmt-form-section">
      <OmSectionTitle title="주문서 기본정보" />
      <div className="order-mgmt-form-body">
        <div className="order-mgmt-radio-group" role="radiogroup" aria-label="거래구분">
          {txnTypes.map((type, index) => (
            <label key={type} className="order-mgmt-radio-item">
              <input type="radio" name="order-txn-type" defaultChecked={index === 0} />
              <span>{type}</span>
            </label>
          ))}
        </div>

        <div className="order-mgmt-form-grid order-mgmt-form-grid--2">
          <OmFormField label="제품주문일자" value="2026-06-17" type="date" />
          <OmFormField label="수당적용일자" value="2026-06-17" type="date" />
        </div>
        <p className="order-mgmt-form-note">
          ※주문일자는 매출집계에 사용되며 수당적용일이 수당계산에 사용됩니다.
        </p>

        <div className="order-mgmt-form-grid order-mgmt-form-grid--4">
          <OmFormSelect label="센터" value={centerCode} options={[centerCode]} />
          <OmFormSelect label="고객유형" value="판매원" options={["판매원", "소비자", "일반"]} />
          <OmFormSelect label="접수구분" value="방문" options={["방문", "전화", "온라인"]} />
          <label className="order-mgmt-field">
            <span className="order-mgmt-field-label">주문서상태</span>
            <input
              type="text"
              className="order-mgmt-input order-mgmt-input--readonly"
              defaultValue="주문승인"
              readOnly
            />
          </label>
        </div>

        <label className="order-mgmt-field order-mgmt-field--full">
          <span className="order-mgmt-field-label">메모</span>
          <textarea className="order-mgmt-textarea" rows={4} />
        </label>
      </div>
    </section>
  );
}

function OmMemberInfoPanel({ member }: { member: ProfileMember }) {
  const centerCode = member.region.includes("서울") ? "NUXIA2359" : member.region;
  const address =
    member.region === "서울 강남"
      ? "경남 김해시 우암로 106 (건영아파트) 301동504호"
      : `${member.region} (상세주소)`;

  return (
    <section className="order-mgmt-member-info">
      <OmSectionTitle title={`${member.name}(${member.no}) 회원의 일반회원정보`} />
      <div className="order-mgmt-member-info-body">
        <p>
          <span className="order-mgmt-member-info-label">회원번호 :</span>{" "}
          <span className="order-mgmt-member-info-link">{member.no}</span>
          <span className="order-mgmt-member-info-gap" />
          <span className="order-mgmt-member-info-label">회원명 :</span> {member.name}
          <span className="order-mgmt-member-info-gap" />
          <span className="order-mgmt-member-info-label">주민등록번호 :</span> {member.ssn}
        </p>
        <p>
          <span className="order-mgmt-member-info-label">전화번호 :</span> {member.phone}
          <span className="order-mgmt-member-info-gap" />
          <span className="order-mgmt-member-info-label">주소지 :</span> {address}
        </p>
        <p>
          <span className="order-mgmt-member-info-label">센터 :</span> {centerCode}
        </p>
      </div>
    </section>
  );
}

export function OrderManagementView({ member }: { member: ProfileMember }) {
  const [selectedOrder, setSelectedOrder] = useState(1);

  return (
    <div className="order-mgmt-view">
      <div className="order-mgmt-body">
        <div className="order-mgmt-left">
          <OmMemberInfoPanel member={member} />

          <section className="order-mgmt-section order-mgmt-section--orders">
            <OmSectionTitle title="주문서 목록" />

            <div className="order-mgmt-toolbar">
              <OmToolbarButton icon={FilePlus} label="새로 주문하기" />
              <OmToolbarButton icon={FileText} label="거래명세서" />
              <OmToolbarButton icon={RotateCcw} label="반품등록" />
              <OmToolbarButton icon={Repeat2} label="교환등록" />
              <OmToolbarButton icon={CheckCircle2} label="주문서승인" />
              <OmToolbarButton icon={Ban} label="주문서취소" />
            </div>

            <div className="order-mgmt-filter-bar">
              <span className="order-mgmt-filter-label">검색기간</span>
              <input type="date" className="order-mgmt-filter-input" defaultValue="2026-05-01" />
              <span className="order-mgmt-filter-sep">~</span>
              <input type="date" className="order-mgmt-filter-input" defaultValue="2026-06-08" />
              <span className="order-mgmt-filter-label">인수자명</span>
              <input type="text" className="order-mgmt-filter-input order-mgmt-filter-input--text" defaultValue={member.name} />
              <select className="order-mgmt-filter-input order-mgmt-filter-select" defaultValue="전체">
                <option value="전체">전체</option>
                <option value="출고완료">출고완료</option>
                <option value="주문접수">주문접수</option>
              </select>
              <button type="button" className="order-mgmt-filter-btn" aria-label="새로고침">
                <RefreshCw size={14} />
              </button>
            </div>

            <OmDataTable
              columns={orderListColumns}
              rows={orderListRows}
              selectedRow={selectedOrder}
              onSelectRow={setSelectedOrder}
            />
          </section>

          <section className="order-mgmt-section order-mgmt-section--products">
            <OmSectionTitle title="구입제품 목록" />

            <div className="order-mgmt-subtitle">주문서 구입제품</div>

            <div className="order-mgmt-toolbar order-mgmt-toolbar--compact">
              <span className="order-mgmt-inline-label">구매수량</span>
              <input type="number" className="order-mgmt-qty-input" defaultValue={1} min={1} />
              <OmToolbarButton icon={ShoppingCart} label="장바구니 추가" />
              <div className="order-mgmt-toolbar-separator" aria-hidden />
              <button type="button" className="order-mgmt-icon-btn" aria-label="문서">
                <FileText size={16} />
              </button>
              <button type="button" className="order-mgmt-icon-btn" aria-label="수정">
                <Pencil size={16} />
              </button>
              <button type="button" className="order-mgmt-icon-btn" aria-label="삭제">
                <Trash2 size={16} />
              </button>
              <button type="button" className="order-mgmt-icon-btn" aria-label="새로고침">
                <RefreshCw size={16} />
              </button>
            </div>

            <OmDataTable
              columns={productListColumns}
              rows={productListRows}
              summaryRow={{
                no: "",
                code: "",
                product: "합계",
                point: "8,000",
                salePrice: "113,000",
                consumerPrice: "125,000",
                price4: "107,000",
                price5: "102,000",
                price6: "98,000",
                price7: "94,000",
              }}
            />
          </section>
        </div>

        <aside className="order-mgmt-right">
          <OmOrderBasicInfo member={member} />

          <section className="order-mgmt-form-section order-mgmt-form-section--grow">
            <OmSectionTitle title="배송지 및 인수자 정보" />
            <div className="order-mgmt-form-body">
              <OmFormSelect label="배송방법" value="직접수령" options={["직접수령", "택배", "퀵서비스"]} />
              <OmFormField label="인수자명" value={member.name} />
              <OmFormField label="인수자연락처" value="02-583-9201" />
              <OmFormField label="인수자핸드폰번호" value={member.phone} />
              <OmFormField
                label="배송지주소"
                value={member.region.includes("서울") ? "서울특별시 강남구 테헤란로 123" : member.region}
                full
                suffix={
                  <button type="button" className="order-mgmt-search-btn" aria-label="주소 검색">
                    <Search size={14} />
                  </button>
                }
              />
              <div className="order-mgmt-form-grid">
                <OmFormField label="우편번호" value="06123" />
                <OmFormField label="세금" value="0" />
                <OmFormField label="배송비용" value="0" />
                <OmFormField label="요구사항" value="" />
              </div>
            </div>
          </section>

          <div className="order-mgmt-footer">
            <div className="order-mgmt-meta">
              <span>생성일시 2026-06-17 09:12:33 .myoffice</span>
              <span>수정일시 2026-06-17 14:28:01 .myoffice</span>
            </div>
            <button type="button" className="order-mgmt-save-btn">
              <Save size={14} />
              등록/저장
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
