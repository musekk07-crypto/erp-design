import React, { useState } from "react";
import { ChevronDown, FilePlus, Save, Trash2 } from "lucide-react";

const DETAIL_PANEL_PAD = 12;
const DETAIL_CONTENT_GAP = 12;
const FORM_COLUMN_WIDTH_MIN = 1000;
const PRODUCT_IMAGE_PANEL_WIDTH = 280;

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

const compactSelectStyle: React.CSSProperties = {
  ...inputStyle,
  width: 88,
  minWidth: 88,
};

const compactDateStyle: React.CSSProperties = {
  ...inputStyle,
  width: 124,
  minWidth: 124,
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

const labelCellClass = "member-form-cell member-form-cell--label";
const fieldCellClass = "member-form-cell member-form-cell--field";
const fieldWideCellClass = "member-form-cell member-form-cell--field member-form-cell--field-wide";
const fieldColSpan = 3;

function FormSection({
  title,
  subtitle,
  headerExtra,
  children,
  bodyPadding,
  clipBody = true,
  className = "",
}: {
  title: string;
  subtitle?: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  bodyPadding?: string;
  clipBody?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`rounded content-form-section ${className}`.trim()} style={{ background: "var(--surface-panel)", border: "1px solid var(--border)" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 transition-all duration-150"
        style={{
          cursor: "pointer",
          background: "var(--content-form-section-header-bg, transparent)",
          borderBottom: open ? "1px solid var(--content-form-section-header-bg, var(--border))" : "none",
        }}
      >
        <span className="text-sm font-semibold shrink-0" style={{ color: "var(--content-form-section-header-fg, var(--foreground))" }}>
          {title}
        </span>
        {subtitle ? (
          <span className="text-xs shrink-0" style={{ color: "var(--content-form-section-header-fg-muted, var(--text-muted))" }}>
            {subtitle}
          </span>
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

function ProductProfileHeader() {
  return (
    <div className="member-profile-header member-profile-header--inline-summary">
      <span className="member-profile-header__summary-name">*[오토십] 로얄 골든팩 & 다이어트 쉐이크 세트</span>
      <span className="member-profile-header-divider" aria-hidden />
      <span className="content-member-header-no member-profile-header__summary-no">4000000007</span>
      <span className="member-profile-header__status-badge">판매중</span>
    </div>
  );
}

const basicMgmtToolbarItems = [
  { label: "새로 만들기", icon: FilePlus },
  { label: "저장", icon: Save },
  { label: "삭제", icon: Trash2 },
] as const;

function BasicMgmtToolbar() {
  return (
    <div className="basic-mgmt-toolbar-area">
      <div className="member-org-chart-toolbar-shell">
        <div className="member-info-toolbar member-org-chart-toolbar">
          {basicMgmtToolbarItems.map(({ label, icon: Icon }) => (
            <button key={label} type="button" className="member-info-toolbar-item member-org-chart-toolbar__item">
              <Icon size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
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

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span style={{ fontSize: 12, color: required ? "var(--required-color, #001673)" : "var(--form-label-color)", fontWeight: 500 }}>
      {required ? "* " : null}
      {children}
    </span>
  );
}

function FormRow({
  label,
  required,
  children,
  colSpan = fieldColSpan,
  dual,
  label2,
  required2,
  children2,
}: {
  label: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  colSpan?: number;
  dual?: boolean;
  label2?: React.ReactNode;
  required2?: boolean;
  children2?: React.ReactNode;
}) {
  if (dual && label2 !== undefined && children2 !== undefined) {
    return (
      <tr className="form-row-dual">
        <td className={labelCellClass}>
          <Label required={required}>{label}</Label>
        </td>
        <td className={fieldCellClass}>{children}</td>
        <td className={labelCellClass}>
          <Label required={required2}>{label2}</Label>
        </td>
        <td className={fieldCellClass}>{children2}</td>
      </tr>
    );
  }

  return (
    <tr>
      <td className={labelCellClass}>
        <Label required={required}>{label}</Label>
      </td>
      <td className={fieldCellClass} colSpan={colSpan}>
        {children}
      </td>
    </tr>
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
                    textAlign: "center",
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
                <td style={{ padding: "6px 8px", fontSize: 13, textAlign: "center" }}>{row.no}</td>
                <td style={{ padding: "6px 8px", fontSize: 13, textAlign: "center" }}>{row.code}</td>
                <td style={{ padding: "6px 8px", fontSize: 13, textAlign: "center" }}>{row.category}</td>
                <td style={{ padding: "6px 8px", fontSize: 13, textAlign: "center" }}>{row.name}</td>
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
        <div
          className="flex items-start"
          style={{
            width: "100%",
            minWidth: 0,
            gap: DETAIL_CONTENT_GAP,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              flex: "1 1 0",
              minWidth: FORM_COLUMN_WIDTH_MIN,
            }}
          >
            <FormSection
              title="기본정보"
              subtitle="2개 항목"
              className="content-form-section--member-form"
              headerExtra={<ProductProfileHeader />}
            >
              <FormGrid>
                <FormRow label="제품코드">
                  <input readOnly defaultValue="4000000007" className="rounded px-2 py-1.5 outline-none" style={readonlyStyle} />
                </FormRow>
                <FormRow label="제품명" required colSpan={3}>
                  <input
                    defaultValue="*[오토십] 로얄 골든팩 & 다이어트 쉐이크 세트"
                    className="rounded px-2 py-1.5 outline-none"
                    style={inputStyle}
                    {...focusProps}
                  />
                </FormRow>
              </FormGrid>
            </FormSection>

            <FormSection title="상품노출/품절/재고 설정" subtitle="4개 항목" className="content-form-section--member-form">
              <FormGrid>
                <tr>
                  <td colSpan={4} className="member-form-cell member-form-cell--field basic-mgmt-exposure-row">
                    <div className="basic-mgmt-exposure-inline">
                      <div className="basic-mgmt-exposure-item">
                        <Label>상품노출</Label>
                        <select defaultValue="노출" className="rounded px-2 py-1.5 outline-none appearance-none" style={compactSelectStyle} {...focusProps}>
                          <option>노출</option>
                          <option>비노출</option>
                        </select>
                      </div>
                      <div className="basic-mgmt-exposure-item">
                        <Label>상태</Label>
                        <select defaultValue="판매중" className="rounded px-2 py-1.5 outline-none appearance-none" style={compactSelectStyle} {...focusProps}>
                          <option>판매중</option>
                          <option>품절</option>
                        </select>
                      </div>
                      <div className="basic-mgmt-exposure-item basic-mgmt-exposure-item--dates">
                        <Label>노출기간</Label>
                        <div className="basic-mgmt-exposure-dates">
                          <input type="date" defaultValue="2025-01-01" className="rounded px-2 py-1.5 outline-none" style={compactDateStyle} {...focusProps} />
                          <span style={{ color: "var(--text-muted)" }}>~</span>
                          <input type="date" defaultValue="2026-12-31" className="rounded px-2 py-1.5 outline-none" style={compactDateStyle} {...focusProps} />
                        </div>
                      </div>
                      <div className="basic-mgmt-exposure-item">
                        <Label>상태표기 아이콘</Label>
                        <label className="inline-flex items-center gap-2" style={{ fontSize: 13 }}>
                          <input type="checkbox" defaultChecked style={{ accentColor: "var(--checkbox-accent)", width: 14, height: 14 }} />
                          사용
                        </label>
                      </div>
                    </div>
                  </td>
                </tr>
              </FormGrid>
            </FormSection>

            <FormSection title="가격정보" subtitle="5개 항목" className="content-form-section--member-form">
              <div className="member-form-split">
                <div className="member-form-split__group">
                  <FormGrid>
                    {[
                      ["포인트가", "118,800"],
                      ["판매가", "118,800"],
                      ["소비자가", "118,800"],
                    ].map(([label, value]) => (
                      <FormRow key={label} label={label}>
                        <input defaultValue={value} className="rounded px-2 py-1.5 outline-none text-right" style={inputStyle} {...focusProps} />
                      </FormRow>
                    ))}
                  </FormGrid>
                </div>
                <div className="member-form-split__group">
                  <FormGrid>
                    {[
                      ["원가", "95,000"],
                      ["마진율", "20.0"],
                    ].map(([label, value]) => (
                      <FormRow key={label} label={label}>
                        <input defaultValue={value} className="rounded px-2 py-1.5 outline-none text-right" style={inputStyle} {...focusProps} />
                      </FormRow>
                    ))}
                  </FormGrid>
                </div>
              </div>
            </FormSection>

            <FormSection title="상품구분 (내부분류)" subtitle="4개 항목" className="content-form-section--member-form">
              <div className="member-form-split">
                <div className="member-form-split__group">
                  <FormGrid>
                    {[
                      ["대분류", "건강기능식품", true],
                      ["중분류", "오토십", true],
                    ].map(([label, value, required]) => (
                      <FormRow key={String(label)} label={String(label)} required={Boolean(required)}>
                        <select defaultValue={String(value)} className="rounded px-2 py-1.5 outline-none appearance-none" style={inputStyle} {...focusProps}>
                          <option>{value}</option>
                        </select>
                      </FormRow>
                    ))}
                  </FormGrid>
                </div>
                <div className="member-form-split__group">
                  <FormGrid>
                    {[
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
                </div>
              </div>
            </FormSection>

            <FormSection title="세부정보" subtitle="6개 항목" className="content-form-section--member-form">
              <div className="member-form-split">
                <div className="member-form-split__group">
                  <FormGrid>
                    <FormRow label="사용 거래처" colSpan={3}>
                      <select defaultValue="[1285915]알앤디피아" className="rounded px-2 py-1.5 outline-none appearance-none" style={inputStyle} {...focusProps}>
                        <option>[1285915]알앤디피아</option>
                      </select>
                    </FormRow>
                    <FormRow
                      label="모델명"
                      dual
                      label2="제조사"
                      children2={
                        <input defaultValue="비아블" className="rounded px-2 py-1.5 outline-none" style={inputStyle} {...focusProps} />
                      }
                    >
                      <input defaultValue="RG-DIET-SET" className="rounded px-2 py-1.5 outline-none" style={inputStyle} {...focusProps} />
                    </FormRow>
                    <FormRow label="제품규격(가로*세로*높이*무게)" colSpan={3}>
                      <div className="flex gap-2">
                        {["120", "80", "60", "450"].map((value) => (
                          <input key={value} defaultValue={value} className="rounded px-2 py-1.5 outline-none text-center" style={inputStyle} {...focusProps} />
                        ))}
                      </div>
                    </FormRow>
                  </FormGrid>
                </div>
                <div className="member-form-split__group">
                  <FormGrid>
                    <FormRow label="제품의 설명" colSpan={3}>
                      <input defaultValue="오토십 전용 골든팩 & 다이어트 쉐이크 세트 상품입니다." className="rounded px-2 py-1.5 outline-none" style={inputStyle} {...focusProps} />
                    </FormRow>
                    <tr>
                      <td className={labelCellClass}>
                        <Label>과세대상</Label>
                      </td>
                      <td className={fieldWideCellClass} colSpan={fieldColSpan}>
                        <label className="inline-flex items-center gap-2" style={{ fontSize: 13 }}>
                          <input type="checkbox" defaultChecked style={{ accentColor: "var(--checkbox-accent)", width: 14, height: 14 }} />
                          과세
                        </label>
                      </td>
                    </tr>
                  </FormGrid>
                </div>
              </div>
            </FormSection>

            <FormSection title="상품 구성 관리" className="content-form-section--member-form">
              <div className="basic-mgmt-table-group">
                <BasicMgmtTable caption="묶음상품 구성" rows={productCompositionRows} />
                <BasicMgmtTable caption="옵션상품 구성" rows={productCompositionRows} />
              </div>
            </FormSection>

            <FormSection title="상품 판매 제약조건 관리" className="content-form-section--member-form">
              <div className="basic-mgmt-table-group">
                <BasicMgmtTable caption="등급별 상품 게시" rows={constraintRows} />
                <BasicMgmtTable caption="직급별 상품 게시" rows={constraintRows} />
              </div>
            </FormSection>

            <div className="flex justify-end pt-2 pb-6">
              <button type="button" className="order-mgmt-save-btn">
                등록/저장
              </button>
            </div>
          </div>

          <div style={{ flex: `0 0 ${PRODUCT_IMAGE_PANEL_WIDTH}px`, width: PRODUCT_IMAGE_PANEL_WIDTH, overflow: "hidden" }}>
            <FormSection title="상품 이미지" className="content-form-section--org" bodyPadding="16px 20px 12px">
              <div
                className="flex flex-col items-center justify-center gap-3"
                style={{
                  minHeight: 240,
                  border: "1px dashed var(--border)",
                  borderRadius: 6,
                  background: "var(--surface-panel)",
                  color: "var(--text-muted)",
                  fontSize: 12,
                }}
              >
                <span>상품 이미지 미리보기</span>
                <button
                  type="button"
                  style={{
                    fontSize: 12,
                    padding: "4px 12px",
                    background: "var(--surface-button-muted)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                  }}
                >
                  이미지 등록
                </button>
              </div>
            </FormSection>
          </div>
        </div>
      </div>
    </div>
  );
}
