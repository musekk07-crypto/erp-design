import React, { useState } from "react";
import { User, Shield, ChevronDown, GitFork, CreditCard, Users, Building, Info } from "lucide-react";
import { OrgChart } from "./OrgChart";


function MemberTypeToggle() {
  const [type, setType] = useState<"일반" | "소비자">("일반");
  return (
    <div
      className="flex items-center ml-1"
      style={{ background: "#f8f7ff", borderRadius: 20, padding: 2, border: "1px solid var(--accent-light)" }}
    >
      {(["일반", "소비자"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setType(t)}
          style={{
            fontSize: "11px",
            padding: "2px 10px",
            borderRadius: 20,
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s",
            background: type === t ? "var(--accent-primary)" : "transparent",
            color: type === t ? "#fff" : "var(--muted-foreground)",
            fontWeight: type === t ? 600 : 400,
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
        background: "#f8f7ff",
        border: "1px solid var(--accent-light)",
        minWidth: 90,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color, fontFamily: "monospace" }}>
        {value}
      </span>
      <span className="mt-0.5" style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
        {label}
      </span>
    </div>
  );
}

function FormSection({ title, icon, subtitle, children }: { title: string; icon: React.ReactNode; subtitle?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded mb-3" style={{ background: "#fff", border: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-5 transition-all duration-150"
        style={{ cursor: "pointer", background: "transparent", borderBottom: open ? "1px solid var(--border)" : "none", paddingTop: 12, paddingBottom: 12 }}
      >
        <span className="content-form-section-icon shrink-0 inline-flex items-center" style={{ color: "var(--accent-primary)" }}>
          {icon}
        </span>
        <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{title}</span>
        <div className="flex-1" />
        <ChevronDown
          size={14}
          style={{
            color: "var(--muted-foreground)",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        />
      </button>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.25s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ padding: "10px 20px 14px" }}>
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
      <label className="block mb-1.5" style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{label}</label>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full rounded px-3 py-2.5 text-sm outline-none transition-all duration-200"
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
      <label className="block mb-1.5" style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>성별</label>
      <div className="flex gap-2">
        {["남", "여"].map((g) => (
          <button
            key={g}
            onClick={() => setSelected(g)}
            className="px-4 py-2.5 rounded text-sm font-medium transition-all duration-200"
            style={{
              background: selected === g ? "var(--accent-gradient)" : "#f8f8fb",
              color: selected === g ? "#fff" : "var(--muted-foreground)",
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
            fontSize: 11,
            padding: "3px 14px",
            background: selected === g ? "var(--accent-gradient)" : "#f8f8fb",
            color: selected === g ? "#fff" : "var(--muted-foreground)",
            border: selected === g ? "1px solid var(--accent-primary)" : "1px solid var(--border)",
          }}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

export function MemberDetail({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: "none", background: "#f9f9f9" }}>

        {/* Member Header Card */}
        <div
          className="rounded p-3 mb-4"
          style={{ background: "#fff", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-9 h-9 rounded flex items-center justify-center font-bold shrink-0"
              style={{ background: "var(--accent-gradient)", color: "#fff", fontSize: 11 }}
            >
              한
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span style={{ color: "var(--muted-foreground)", fontSize: 11 }}>한미채 · hmc0810</span>
              <span style={{ width: 1, height: 14, background: "var(--border)", display: "inline-block" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#1e2130" }}>N26431021</span>
              <MemberTypeToggle />
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-start">
        {/* 왼쪽 폼 */}
        <div className="flex-1 min-w-0">

        {/* Login Info */}
        <FormSection title="로그인 사용정보" icon={<Shield size={14} />}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {[
                [{ label: "* 회원번호", value: "N26431021", mono: true }, { label: "* 아이디", value: "hmc0810", mono: true }],
                [{ label: "비밀번호", placeholder: "변경 시에만 입력", type: "password" }, { label: "보안 비밀번호", placeholder: "····", type: "password" }],
                [{ label: "전자메일주소", value: "hmc0810@email.com", type: "email", colSpan: 2 }],
              ].map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell: any, ci) => (
                    <React.Fragment key={ci}>
                      <td style={{ padding: "4px 12px 4px 0", width: 120, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                        <span style={{ fontSize: "11px", color: cell.label.startsWith("*") ? "var(--accent-primary)" : "var(--muted-foreground)", fontWeight: 500 }}>
                          {cell.label}
                        </span>
                      </td>
                      <td colSpan={cell.colSpan === 2 ? 3 : 1} style={{ padding: "4px 12px 4px 0", verticalAlign: "middle" }}>
                        <input
                          type={cell.type || "text"}
                          defaultValue={cell.value}
                          placeholder={cell.placeholder}
                          className="w-full rounded outline-none transition-all duration-200"
                          style={{
                            fontSize: 11,
                            padding: "4px 10px",
                            background: "var(--input-background)",
                            border: "none",
                            color: "var(--foreground)",
                            fontFamily: "inherit",
                          }}
                          onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }}
                          onBlur={(e) => { e.target.style.background = "var(--input-background)"; }}
                        />
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </FormSection>

        {/* 일반 회원정보 */}
        <FormSection title="일반 회원정보" subtitle="16개 항목" icon={<User size={14} />}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {/* Row: 회원 등록일자 | 한글명 */}
              <tr>
                <td style={{ padding: "4px 12px 4px 0", width: 120, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: 500 }}>* 회원 등록일자</span>
                </td>
                <td style={{ padding: "4px 12px 4px 0", verticalAlign: "middle" }}>
                  <input type="date" defaultValue="2023-04-15" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "4px 12px 4px 0", width: 100, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>한글명</span>
                </td>
                <td style={{ padding: "4px 0 4px 0", verticalAlign: "middle" }}>
                  <input defaultValue="한미채" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              {/* Row: * 고객 이름/성 — 3칸 입력 */}
              <tr>
                <td style={{ padding: "4px 12px 4px 0", width: 120, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: 500 }}>* 고객 이름/성</span>
                </td>
                <td colSpan={3} style={{ padding: "4px 0 4px 0", verticalAlign: "middle" }}>
                  <div className="flex gap-2">
                    <input defaultValue="미채" className="flex-1 rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                    <input defaultValue="Mi-chae" className="flex-1 rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                    <input defaultValue="Han" className="flex-1 rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                  </div>
                </td>
              </tr>
              {/* Row: Nick Name | Business Name */}
              <tr>
                <td style={{ padding: "4px 12px 4px 0", width: 120, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>Nick Name</span>
                </td>
                <td style={{ padding: "4px 12px 4px 0", verticalAlign: "middle" }}>
                  <input placeholder="닉네임" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "4px 12px 4px 0", width: 100, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>Business Name</span>
                </td>
                <td style={{ padding: "4px 0 4px 0", verticalAlign: "middle" }}>
                  <input placeholder="사업자명" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              {/* Row: Legal Name | 생년월일 */}
              <tr>
                <td style={{ padding: "4px 12px 4px 0", width: 120, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>Legal Name</span>
                </td>
                <td style={{ padding: "4px 12px 4px 0", verticalAlign: "middle" }}>
                  <input placeholder="법적 이름" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "4px 12px 4px 0", width: 100, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>생년월일</span>
                </td>
                <td style={{ padding: "4px 0 4px 0", verticalAlign: "middle" }}>
                  <input type="date" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              {/* Row: 주민등록번호 + 성별 드롭다운 + 인증완료 | EIN Number */}
              <tr>
                <td style={{ padding: "4px 12px 4px 0", width: 120, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>주민등록번호</span>
                </td>
                <td style={{ padding: "4px 12px 4px 0", verticalAlign: "middle" }}>
                  <div className="flex gap-1 items-center">
                    <input defaultValue="900822-2······" className="flex-1 rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                    <div className="relative" style={{ flexShrink: 0 }}>
                      <select defaultValue="여" className="rounded outline-none appearance-none" style={{ fontSize: 11, padding: "4px 28px 4px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }}>
                        <option value="남">남</option>
                        <option value="여">여</option>
                      </select>
                      <ChevronDown size={12} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
                    </div>
                    <button style={{ fontSize: 11, padding: "4px 10px", background: "#f5f6fa", color: "var(--accent-primary)", border: "1px solid #a7f3d0", borderRadius: 4, whiteSpace: "nowrap" }}>✓ 실명인증</button>
                  </div>
                </td>
                <td style={{ padding: "4px 12px 4px 0", width: 100, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>EIN Number</span>
                </td>
                <td style={{ padding: "4px 0 4px 0", verticalAlign: "middle" }}>
                  <input placeholder="미국 사업자 번호" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              {/* Row: 비자종류 | 체류기간 만료일자 */}
              <tr>
                <td style={{ padding: "4px 12px 4px 0", width: 120, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>비자종류</span>
                </td>
                <td style={{ padding: "4px 12px 4px 0", verticalAlign: "middle" }}>
                  <div className="relative" style={{ display: "inline-block", width: "100%" }}>
                    <select className="w-full rounded outline-none appearance-none" style={{ fontSize: 11, padding: "4px 28px 4px 8px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }}>
                      <option>() 내국인</option>
                      <option>F-2 거주</option>
                      <option>F-4 재외동포</option>
                      <option>F-6 결혼이민</option>
                    </select>
                    <ChevronDown size={12} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
                  </div>
                </td>
                <td style={{ padding: "4px 12px 4px 0", width: 100, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>체류기간 만료일자</span>
                </td>
                <td style={{ padding: "4px 0 4px 0", verticalAlign: "middle" }}>
                  <input type="date" placeholder="YYYY-MM-DD" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              {/* Row: 주소지 (full) */}
              <tr>
                <td style={{ padding: "4px 12px 4px 0", width: 120, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>주소지</span>
                </td>
                <td colSpan={3} style={{ padding: "4px 0 4px 0", verticalAlign: "middle" }}>
                  <div className="flex gap-2">
                    <input defaultValue="서울특별시 강남구 테헤란로 152, 강남파이낸스센터 23층" className="flex-1 rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                    <button style={{ fontSize: 11, padding: "4px 12px", background: "#f5f6fa", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: 4 }}>검색</button>
                  </div>
                </td>
              </tr>
              {/* Row: 우편번호 | 연락처 */}
              <tr>
                <td style={{ padding: "4px 12px 4px 0", width: 120, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>우편번호</span>
                </td>
                <td style={{ padding: "4px 12px 4px 0", verticalAlign: "middle" }}>
                  <input defaultValue="06236" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "4px 12px 4px 0", width: 100, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>연락처</span>
                </td>
                <td style={{ padding: "4px 0 4px 0", verticalAlign: "middle" }}>
                  <input defaultValue="02-3456-7890" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              {/* Row: 휴대폰번호 | 세금신고번호 */}
              <tr>
                <td style={{ padding: "4px 12px 4px 0", width: 120, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>휴대폰번호</span>
                </td>
                <td style={{ padding: "4px 12px 4px 0", verticalAlign: "middle" }}>
                  <input defaultValue="010-2345-6789" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "4px 12px 4px 0", width: 100, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>세금신고번호</span>
                </td>
                <td style={{ padding: "4px 0 4px 0", verticalAlign: "middle" }}>
                  <input defaultValue="220-81-12345" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              {/* Row: 메모 (full) */}
              <tr>
                <td style={{ padding: "4px 12px 4px 0", width: 120, whiteSpace: "nowrap", verticalAlign: "top", paddingTop: 8 }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>메모</span>
                </td>
                <td colSpan={3} style={{ padding: "4px 0 4px 0", verticalAlign: "middle" }}>
                  <textarea
                    defaultValue="VIP 회원. 2024년 4분기 우수판매자 선정. 분기 정산 우선 처리 요망. 사업자 등록 갱신 예정(2026-03)."
                    rows={3}
                    className="w-full rounded outline-none transition-all duration-200 resize-none"
                    style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }}
                    onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }}
                    onBlur={(e) => { e.target.style.background = "var(--input-background)"; }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </FormSection>

        {/* 거래은행 정보 */}
        <FormSection title="거래은행 정보" icon={<CreditCard size={14} />}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {/* Row: 은행명 | 계좌번호 | 예금주 */}
              <tr>
                <td style={{ padding: "4px 12px 4px 0", width: 100, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>은행명</span>
                </td>
                <td style={{ padding: "4px 12px 4px 0", verticalAlign: "middle" }}>
                  <input defaultValue="신한은행" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "4px 12px 4px 0", width: 80, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>계좌번호</span>
                </td>
                <td style={{ padding: "4px 12px 4px 0", verticalAlign: "middle" }}>
                  <input defaultValue="110-234-567890" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "4px 12px 4px 0", width: 60, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>예금주</span>
                </td>
                <td style={{ padding: "4px 0 4px 0", verticalAlign: "middle" }}>
                  <input defaultValue="김지영" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              {/* Row: SwiftCode | Branch Number */}
              <tr>
                <td style={{ padding: "4px 12px 4px 0", width: 100, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>SwiftCode</span>
                </td>
                <td colSpan={3} style={{ padding: "4px 12px 4px 0", verticalAlign: "middle" }}>
                  <input defaultValue="SHBKKRSE" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "4px 12px 4px 0", width: 60, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>Branch Number</span>
                </td>
                <td style={{ padding: "4px 0 4px 0", verticalAlign: "middle" }}>
                  <input defaultValue="0234" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
              </tr>
              {/* Row: 은행동합 거래번호 | 실명계좌 인증 */}
              <tr>
                <td style={{ padding: "4px 12px 4px 0", width: 100, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>은행동합 거래번호</span>
                </td>
                <td colSpan={3} style={{ padding: "4px 12px 4px 0", verticalAlign: "middle" }}>
                  <input defaultValue="88012345" className="w-full rounded outline-none transition-all duration-200" style={{ fontSize: 11, padding: "4px 10px", background: "var(--input-background)", border: "none", color: "var(--foreground)" }} onFocus={(e) => { e.target.style.background = "var(--input-focus-bg)"; }} onBlur={(e) => { e.target.style.background = "var(--input-background)"; }} />
                </td>
                <td style={{ padding: "4px 12px 4px 0", width: 60, whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>실명계좌 인증</span>
                </td>
                <td style={{ padding: "4px 0 4px 0", verticalAlign: "middle" }}>
                  <span style={{ fontSize: 11, padding: "3px 10px", background: "#f0fdf4", color: "var(--accent-primary)", border: "1px solid #a7f3d0", borderRadius: 4, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    ✓ 인증완료
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </FormSection>

        {/* 상위 회원과의 관계 */}
        <FormSection title="상위 회원과의 관계" icon={<Users size={14} />}>
          <div className="flex items-center gap-4">
            {/* 추천인 */}
            <span className="shrink-0" style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: 500 }}>* 추천인</span>
            <input readOnly value="100012" className="rounded px-2 py-1 outline-none" style={{ fontSize: 11, width: 72, background: "#f1f5f9", border: "none", color: "var(--foreground)", fontFamily: "monospace" }} />
            <input readOnly value="박민수" className="rounded px-2 py-1 outline-none" style={{ fontSize: 11, width: 60, background: "#f1f5f9", border: "none", color: "var(--foreground)" }} />
            <span style={{ fontSize: 11, padding: "2px 8px", background: "var(--accent-light)", color: "var(--accent-primary)", border: "1px solid var(--accent-border)", borderRadius: 4, whiteSpace: "nowrap" }}>38명</span>
            <button className="rounded p-1 flex items-center justify-center" style={{ background: "#f5f6fa", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
            {/* 후원인 */}
            <span className="shrink-0" style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: 500 }}>* 후원인</span>
            <input readOnly value="100008" className="rounded px-2 py-1 outline-none" style={{ fontSize: 11, width: 72, background: "#f1f5f9", border: "none", color: "var(--foreground)", fontFamily: "monospace" }} />
            <input readOnly value="이정환" className="rounded px-2 py-1 outline-none" style={{ fontSize: 11, width: 60, background: "#f1f5f9", border: "none", color: "var(--foreground)" }} />
            <span style={{ fontSize: 11, padding: "2px 8px", background: "var(--accent-light)", color: "var(--accent-primary)", border: "1px solid var(--accent-border)", borderRadius: 4, whiteSpace: "nowrap" }}>12명</span>
            <button className="rounded p-1 flex items-center justify-center" style={{ background: "#f5f6fa", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </div>
        </FormSection>

        {/* 소속 그룹 정보 */}
        <FormSection title="소속 그룹 정보" icon={<Building size={14} />}>
          <div className="flex items-center gap-4">
            <span className="shrink-0" style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: 500 }}>* 센터</span>
            <div className="relative flex-1">
              <select
                className="w-full rounded py-1.5 text-sm outline-none appearance-none"
                style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)", paddingLeft: 10, paddingRight: 36, fontSize: 12 }}
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
            <span className="shrink-0" style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500 }}>직급</span>
            <div className="relative flex-1">
              <select
                className="w-full rounded py-1.5 text-sm outline-none appearance-none"
                style={{ background: "var(--input-background)", border: "none", color: "var(--foreground)", paddingLeft: 10, paddingRight: 36, fontSize: 12 }}
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
        </FormSection>

        {/* 기타 회원정보 */}
        <FormSection title="기타 회원정보" icon={<Info size={14} />}>
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
                <span style={{ fontSize: 11, color: "var(--foreground)" }}>{item.label}</span>
              </label>
            ))}
          </div>
        </FormSection>

        {/* 등록/저장 버튼 */}
        <div className="flex justify-end pt-2 pb-6">
          <button
            className="rounded font-medium transition-all duration-200"
            style={{ fontSize: 11, padding: "7px 13px", background: "var(--save-btn-bg, var(--accent-gradient))", color: "#fff", border: "none" }}
          >
            등록/저장
          </button>
        </div>
        </div>{/* 왼쪽 폼 끝 */}

        {/* 오른쪽: 조직도 카드 */}
        <div style={{ width: 500, flexShrink: 0 }}>
          <FormSection title="조직도" icon={<GitFork size={14} />}>
            <OrgChart memberId={1} memberName="한미채" />
          </FormSection>
        </div>

        </div>{/* flex row 끝 */}
      </div>
    </div>
  );
}
