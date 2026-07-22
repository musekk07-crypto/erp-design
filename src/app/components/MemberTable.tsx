import { useState, useRef } from "react";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

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

const columns = [
  { key: "id",      label: "No",       width: 48 },
  { key: "no",      label: "회원번호",  width: 120 },
  { key: "loginId", label: "아이디",   width: 130 },
  { key: "name",    label: "이름",     width: 80 },
  { key: "type",    label: "회원구분",  width: 80 },
  { key: "regDate", label: "등록일자",  width: 100 },
  { key: "status",  label: "상태명",   width: 72 },
  { key: "rank",    label: "직급명",   width: 72 },
  { key: "grade",   label: "등급명",   width: 72 },
  { key: "phone",   label: "핸드폰",   width: 130 },
  { key: "ssn",     label: "주민등록번호", width: 130 },
  { key: "region",  label: "센티명",   width: 110 },
];

type SortKey = string | null;
type SortDir = "asc" | "desc";

interface MemberTableProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function MemberTable({ selectedId, onSelect }: MemberTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startX: 0, scrollLeft: 0 });

  function onMouseDown(e: React.MouseEvent) {
    dragState.current = { dragging: true, startX: e.clientX, scrollLeft: scrollRef.current?.scrollLeft ?? 0 };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragState.current.dragging) return;
    e.preventDefault();
    const dx = e.clientX - dragState.current.startX;
    if (scrollRef.current) scrollRef.current.scrollLeft = dragState.current.scrollLeft - dx;
  }
  function onMouseUp() { dragState.current.dragging = false; }
  function onMouseLeave() { dragState.current.dragging = false; }

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

  function toggleAll() {
    if (checked.size === sorted.length) setChecked(new Set());
    else setChecked(new Set(sorted.map((m) => m.id)));
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
    if (sortKey !== col) return <ChevronsUpDown size={11} style={{ color: "#cbd5e1", flexShrink: 0 }} />;
    return sortDir === "asc"
      ? <ChevronUp size={11} style={{ color: "var(--accent-primary)", flexShrink: 0 }} />
      : <ChevronDown size={11} style={{ color: "var(--accent-primary)", flexShrink: 0 }} />;
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#fff" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="flex items-center gap-2 rounded px-3 py-1.5"
          style={{ background: "#f9f9f9", border: "1px solid var(--border)", minWidth: 220 }}
        >
          <Search size={13} style={{ color: "var(--muted-foreground)" }} />
          <input
            className="bg-transparent outline-none flex-1"
            placeholder="이름 또는 회원번호 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: "13px", color: "var(--foreground)" }}
          />
        </div>
        <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
          총 <strong style={{ color: "var(--foreground)" }}>{sorted.length}</strong>명
        </span>
      </div>

      {/* Table */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent", cursor: "grab" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        <table style={{ borderCollapse: "collapse", minWidth: "100%", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 40 }} />
            {columns.map((c) => <col key={c.key} style={{ width: c.width }} />)}
          </colgroup>
          <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <tr style={{ background: "#f9f9f9", borderBottom: "1px solid var(--border)" }}>
              <th style={{ width: 40, padding: "8px 12px", textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={checked.size === sorted.length && sorted.length > 0}
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
                    padding: "8px 10px",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 600,
                    color: sortKey === col.key ? "var(--accent-primary)" : "#64748b",
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap",
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
            {sorted.map((member) => {
              const isSelected = selectedId === member.id;
              const isChecked = checked.has(member.id);
              const cellBase: React.CSSProperties = { padding: "7px 10px", whiteSpace: "nowrap" };
              return (
                <tr
                  key={member.id}
                  onClick={() => onSelect(member.id)}
                  style={{
                    background: isSelected ? "var(--surface-row-selected)" : isChecked ? "var(--surface-row-checked)" : "transparent",
                    borderBottom: "1px solid #f1f5f9",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#f8f9fa"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = isSelected ? "var(--surface-row-selected)" : isChecked ? "var(--surface-row-checked)" : "transparent"; }}
                >
                  <td style={{ padding: "7px 12px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleOne(member.id)} style={{ accentColor: "var(--checkbox-accent)", cursor: "pointer" }} />
                  </td>
                  <td style={{ ...cellBase, fontSize: 13, color: "#94a3b8" }}>{member.id}</td>
                  <td style={{ ...cellBase, fontSize: 13, fontFamily: "monospace", color: isSelected ? "var(--accent-primary)" : "#1e2130", fontWeight: isSelected ? 600 : 400 }}>{member.no}</td>
                  <td style={{ ...cellBase, fontSize: 13, color: "#475569" }}>{member.loginId}</td>
                  <td style={{ ...cellBase, fontSize: 13, color: isSelected ? "var(--accent-primary)" : "#1e2130", fontWeight: isSelected ? 600 : 500 }}>{member.name}</td>
                  <td style={{ ...cellBase }}>
                    <span style={{ fontSize: 13, padding: "2px 7px", borderRadius: 4, background: member.type === "소비자" ? "#cffafe" : "#f1f5f9", color: member.type === "소비자" ? "#0891b2" : "#64748b" }}>{member.type}</span>
                  </td>
                  <td style={{ ...cellBase, fontSize: 13, color: "#64748b" }}>{member.regDate}</td>
                  <td style={{ ...cellBase }}>
                    <span style={{ fontSize: 13, padding: "2px 7px", borderRadius: 4, background: member.status === "탈퇴" ? "#fee2e2" : "#dcfce7", color: member.status === "탈퇴" ? "#dc2626" : "#16a34a" }}>{member.status}</span>
                  </td>
                  <td style={{ ...cellBase, fontSize: 13, color: "#475569" }}>{member.rank}</td>
                  <td style={{ ...cellBase, fontSize: 13, color: "#475569" }}>{member.grade}</td>
                  <td style={{ ...cellBase, fontSize: 13, color: "#475569", fontFamily: "monospace" }}>{member.phone}</td>
                  <td style={{ ...cellBase, fontSize: 13, color: "#94a3b8", fontFamily: "monospace" }}>{member.ssn}</td>
                  <td style={{ ...cellBase, fontSize: 13, color: "#475569" }}>{member.region}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
