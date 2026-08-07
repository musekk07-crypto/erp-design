import React, { useState } from "react";
import { ChevronDown, FilePlus, Save, Trash2 } from "lucide-react";

const DETAIL_PANEL_PAD = 12;

const productCompositionRows = [
  {
    no: 1,
    code: "4000000007",
    category: "오토십",
    name: "*[오토십] 로얄 골든팩 & 다이어트 쉐이크 세트",
  },
];

const constraintRows = productCompositionRows;

const inputStyle: React.CSSProperties = {
  background: "var(--input-background)",
  border: "none",
  color: "var(--foreground)",
  width: "100%",
};

const readonlyStyle: React.CSSProperties = {
  ...inputStyle,
  background: "var(--surface-input-readonly, #f1f5f9)",
};

const focusProps = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.background = "var(--input-focus-bg)";
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.background = "var(--input-background)";
  },
};

function BasicMgmtToolbar() {
  const items = [
    { label: "새로 만들기", icon: FilePlus },
    { label: "저장", icon: Save },
    { label: "삭제", icon: Trash2 },
  ] as const;

  return (
    <div className="member-info-toolbar">
      {items.map((item) => (
        <button key={item.label} type="button" className="member-info-toolbar-item">
          <item.icon size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function BasicMgmtSectionTitle({ title }: { title: string }) {
  return (
    <div className="order-mgmt-block-title basic-mgmt-section-title">
      <span className="order-mgmt-section-bullet" aria-hidden />
      <span>{title}</span>
    </div>
  );
}

function BasicMgmtFormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="basic-mgmt-section">
      <button type="button" className="basic-mgmt-section-header" onClick={() => setOpen((v) => !v)}>
        <BasicMgmtSectionTitle title={title} />
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
      {open ? <div className="basic-mgmt-section-body">{children}</div> : null}
    </div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span
      style={{
        fontSize: 12,
        color: required ? "var(--required-color, #001673)" : "var(--form-label-color)",
        fontWeight: 500,
      }}
    >
      {required ? "* " : null}
      {children}
    </span>
  );
}

function FormRow({
  label,
  required,
  children,
  colSpan = 1,
}: {
  label: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  colSpan?: number;
}) {
  return (
    <tr>
      <td className="member-form-cell member-form-cell--label">
        <Label required={required}>{label}</Label>
      </td>
      <td className="member-form-cell member-form-cell--field" colSpan={colSpan}>
        {children}
      </td>
    </tr>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return (
    <table className="content-form-grid content-form-grid--member member-form-grid--split" style={{ width: "100%", borderCollapse: "collapse" }}>
      <colgroup>
        <col className="col-label-1" />
        <col className="col-field-1" />
        <col className="col-label-2" />
        <col className="col-field-2" />
      </colgroup>
      <tbody>{children}</tbody>
    </table>
  );
}

function BasicMgmtTable({
  caption,
  rows,
}: {
  caption: string;
  rows: { no: number; code: string; category: string; name: string }[];
}) {
  return (
    <div className="basic-mgmt-table-wrap">
      <div className="basic-mgmt-table-caption">{caption}</div>
      <div className="split-table-block" style={{ border: "1px solid var(--border)", background: "var(--surface-panel)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead className="split-table-head">
            <tr>
              {["No", "상품코드", "대표카테고리명", "상품명"].map((head) => (
                <th
                  key={head}
                  style={{
                    padding: "6px 8px",
                    fontSize: 13,
                    fontWeight: 400,
                    textAlign: "left",
                    color: "var(--split-table-header-fg, var(--text-muted))",
                    background: "var(--split-table-header-bg, var(--surface-table-header))",
                    borderBottom: "1px solid var(--split-table-header-border, var(--border))",
                  }}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.no}>
                <td style={{ padding: "6px 8px", fontSize: 13 }}>{row.no}</td>
                <td style={{ padding: "6px 8px", fontSize: 13 }}>{row.code}</td>
                <td style={{ padding: "6px 8px", fontSize: 13 }}>{row.category}</td>
                <td style={{ padding: "6px 8px", fontSize: 13 }}>{row.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BasicManagementView() {
  return (
    <div className="basic-mgmt-view flex flex-col h-full min-h-0">
      <BasicMgmtToolbar />
      <div
        className="content-scroll flex-1 min-h-0"
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          background: "var(--surface-page)",
          padding: DETAIL_PANEL_PAD,
        }}
      >
        <div className="basic-mgmt-stack">
          <BasicMgmtFormSection title="기본정보 및 이미지">
            <FormGrid>
              <FormRow label="제품코드">
                <input readOnly defaultValue="4000000007" className="rounded px-2 py-1.5 outline-none" style={readonlyStyle} />
              </FormRow>
              <FormRow label="제품명" required>
                <input
                  defaultValue="*[오토십] 로얄 골든팩 & 다이어트 쉐이크 세트"
                  className="rounded px-2 py-1.5 outline-none"
                  style={inputStyle}
                  {...focusProps}
                />
              </FormRow>
            </FormGrid>
          </BasicMgmtFormSection>

          <BasicMgmtFormSection title="상품노출/품절/재고 설정">
            <FormGrid>
              <FormRow label="상품노출">
                <select defaultValue="노출" className="rounded px-2 py-1.5 outline-none appearance-none" style={inputStyle} {...focusProps}>
                  <option>노출</option>
                  <option>비노출</option>
                </select>
              </FormRow>
              <FormRow label="상태">
                <select defaultValue="판매중" className="rounded px-2 py-1.5 outline-none appearance-none" style={inputStyle} {...focusProps}>
                  <option>판매중</option>
                  <option>품절</option>
                </select>
              </FormRow>
              <FormRow label="노출기간">
                <div className="flex items-center gap-2">
                  <input type="date" defaultValue="2025-01-01" className="rounded px-2 py-1.5 outline-none" style={inputStyle} {...focusProps} />
                  <span style={{ color: "var(--text-muted)" }}>~</span>
                  <input type="date" defaultValue="2026-12-31" className="rounded px-2 py-1.5 outline-none" style={inputStyle} {...focusProps} />
                </div>
              </FormRow>
              <tr>
                <td className="member-form-cell member-form-cell--label">
                  <Label>상태표기 아이콘</Label>
                </td>
                <td className="member-form-cell member-form-cell--field" colSpan={3}>
                  <label className="inline-flex items-center gap-2" style={{ fontSize: 13 }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: "var(--checkbox-accent)" }} />
                    사용
                  </label>
                </td>
              </tr>
            </FormGrid>
          </BasicMgmtFormSection>

          <BasicMgmtFormSection title="가격정보">
            <FormGrid>
              {[
                ["포인트가", "118,800"],
                ["판매가", "118,800"],
                ["소비자가", "118,800"],
                ["원가", "95,000"],
                ["마진율", "20.0"],
              ].map(([label, value]) => (
                <FormRow key={label} label={label}>
                  <input defaultValue={value} className="rounded px-2 py-1.5 outline-none text-right" style={inputStyle} {...focusProps} />
                </FormRow>
              ))}
            </FormGrid>
          </BasicMgmtFormSection>

          <BasicMgmtFormSection title="상품구분 (내부분류)">
            <FormGrid>
              {[
                ["대분류", "건강기능식품", true],
                ["중분류", "오토십", true],
                ["소분류", "세트상품", true],
                ["브랜드", "로얄", false],
              ].map(([label, value, required]) => (
                <FormRow key={String(label)} label={String(label)} required={Boolean(required)}>
                  <select defaultValue={String(value)} className="rounded px-2 py-1.5 outline-none appearance-none" style={inputStyle} {...focusProps}>
                    <option>{value}</option>
                  </select>
                </FormRow>
              ))}
            </FormGrid>
          </BasicMgmtFormSection>

          <BasicMgmtFormSection title="세부정보">
            <FormGrid>
              <FormRow label="사용 거래처">
                <select defaultValue="[1285915]알앤디피아" className="rounded px-2 py-1.5 outline-none appearance-none" style={inputStyle} {...focusProps}>
                  <option>[1285915]알앤디피아</option>
                </select>
              </FormRow>
              <FormRow label="모델명">
                <input defaultValue="RG-DIET-SET" className="rounded px-2 py-1.5 outline-none" style={inputStyle} {...focusProps} />
              </FormRow>
              <FormRow label="제조사">
                <input defaultValue="비아블" className="rounded px-2 py-1.5 outline-none" style={inputStyle} {...focusProps} />
              </FormRow>
              <FormRow label="제품규격(가로*세로*높이*무게)">
                <div className="flex gap-2">
                  {["120", "80", "60", "450"].map((value) => (
                    <input key={value} defaultValue={value} className="rounded px-2 py-1.5 outline-none text-center" style={inputStyle} {...focusProps} />
                  ))}
                </div>
              </FormRow>
              <FormRow label="제품의 설명" colSpan={3}>
                <input defaultValue="오토십 전용 골든팩 & 다이어트 쉐이크 세트 상품입니다." className="rounded px-2 py-1.5 outline-none" style={inputStyle} {...focusProps} />
              </FormRow>
              <tr>
                <td className="member-form-cell member-form-cell--label">
                  <Label>과세대상</Label>
                </td>
                <td className="member-form-cell member-form-cell--field" colSpan={3}>
                  <label className="inline-flex items-center gap-2" style={{ fontSize: 13 }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: "var(--checkbox-accent)" }} />
                    과세
                  </label>
                </td>
              </tr>
            </FormGrid>
          </BasicMgmtFormSection>

          <BasicMgmtFormSection title="상품 구성 관리">
            <div className="basic-mgmt-table-group">
              <BasicMgmtTable caption="묶음상품 구성" rows={productCompositionRows} />
              <BasicMgmtTable caption="옵션상품 구성" rows={productCompositionRows} />
            </div>
          </BasicMgmtFormSection>

          <BasicMgmtFormSection title="상품 판매 제약조건 관리">
            <div className="basic-mgmt-table-group">
              <BasicMgmtTable caption="등급별 상품 게시" rows={constraintRows} />
              <BasicMgmtTable caption="직급별 상품 게시" rows={constraintRows} />
            </div>
          </BasicMgmtFormSection>
        </div>
      </div>
    </div>
  );
}
