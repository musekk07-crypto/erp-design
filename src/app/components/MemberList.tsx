import { useState } from "react";
import { Search, X, ChevronDown, Phone, Mail } from "lucide-react";

const members = [
  { id: 1, no: "N26431021", name: "한미채", type: "일반", phone: "010-0000-0000", email: "hmc0810@email.com", joinDate: "2026-06-08" },
  { id: 2, no: "N26482827", name: "황기봉", type: "일반", phone: "010-1111-2222", email: "kbhwang@email.com", joinDate: "2026-05-14" },
  { id: 3, no: "N26081224", name: "황찬하", type: "일반", phone: "010-2222-3333", email: "chh@email.com", joinDate: "2026-04-20" },
  { id: 4, no: "N26614351", name: "홍세라", type: "일반", phone: "010-3333-4444", email: "srhong@email.com", joinDate: "2026-03-15" },
  { id: 5, no: "N26455673", name: "김성남", type: "일반", phone: "010-4444-5555", email: "snkim@email.com", joinDate: "2026-02-28" },
  { id: 6, no: "N26414074", name: "이숙련", type: "일반", phone: "010-5555-6666", email: "srlee@email.com", joinDate: "2026-01-10" },
  { id: 7, no: "N26783741", name: "장은경", type: "일반", phone: "010-6666-7777", email: "ekjang@email.com", joinDate: "2025-12-05" },
  { id: 8, no: "N26648797", name: "방지유", type: "일반", phone: "010-7777-8888", email: "jybang@email.com", joinDate: "2025-11-22" },
  { id: 9, no: "N26802225", name: "엄진희", type: "일반", phone: "010-8888-9999", email: "jheom@email.com", joinDate: "2025-10-18" },
  { id: 10, no: "N26694939", name: "김소유", type: "일반", phone: "010-9999-0000", email: "sykim@email.com", joinDate: "2025-09-30" },
  { id: 11, no: "N26791820", name: "김영란", type: "일반", phone: "010-1234-5678", email: "yrkim@email.com", joinDate: "2025-08-14" },
  { id: 12, no: "N26639457", name: "김성환", type: "일반", phone: "010-2345-6789", email: "shkim@email.com", joinDate: "2025-07-03" },
  { id: 13, no: "N26848528", name: "이인자", type: "소비자", phone: "010-3456-7890", email: "ijlee@email.com", joinDate: "2025-06-20" },
  { id: 14, no: "N26445650", name: "정경선", type: "일반", phone: "010-4567-8901", email: "ksjung@email.com", joinDate: "2025-05-11" },
  { id: 15, no: "N26521742", name: "이가은", type: "일반", phone: "010-5678-9012", email: "gelee@email.com", joinDate: "2025-04-08" },
  { id: 16, no: "N26683868", name: "신미라", type: "일반", phone: "010-6789-0123", email: "mrshin@email.com", joinDate: "2025-03-25" },
  { id: 17, no: "N26454707", name: "김묘신", type: "일반", phone: "010-7890-1234", email: "mskim@email.com", joinDate: "2025-02-14" },
];

interface MemberListProps {
  selectedId: number;
  onSelect: (id: number) => void;
}

export function MemberList({ selectedId, onSelect }: MemberListProps) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const filtered = members.filter((m) => m.name.includes(search) || m.no.includes(search));

  function handleClick(id: number) {
    onSelect(id);
    setExpandedId(expandedId === id ? null : id);
  }

  return (
    <div className="flex flex-col h-full" style={{ width: 240, background: "#ffffff" }}>
      {/* Header */}
      <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>회원 목록</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent-primary)" }}>
            {members.length}명
          </span>
        </div>
        <div
          className="flex items-center gap-2 rounded px-3 py-2"
          style={{ background: "#f9f9f9", border: "1px solid var(--border)" }}
        >
          <Search size={14} style={{ color: "var(--muted-foreground)" }} />
          <input
            className="flex-1 bg-transparent text-xs outline-none"
            placeholder="이름/회원번호 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ color: "var(--foreground)" }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={12} style={{ color: "var(--muted-foreground)" }} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="p-2">
          {filtered.map((member, idx) => {
            const isSelected = selectedId === member.id;
            const isExpanded = expandedId === member.id;

            return (
              <div key={member.id} className="mb-0.5">
                {/* Row */}
                <button
                  onClick={() => handleClick(member.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all duration-150"
                  style={{
                    background: isSelected ? "var(--surface-row-selected)" : "transparent",
                    border: isSelected ? "1px solid var(--accent-border)" : "1px solid transparent",
                    borderBottomLeftRadius: isExpanded && isSelected ? 0 : undefined,
                    borderBottomRightRadius: isExpanded && isSelected ? 0 : undefined,
                  }}
                >
                  <span className="text-xs w-5 shrink-0 text-right" style={{ color: "var(--muted-foreground)" }}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: isSelected ? "var(--accent-primary)" : "var(--foreground)" }}>
                      {member.name}
                    </div>
                    <div className="text-xs truncate mt-0.5" style={{ color: "var(--muted-foreground)", fontFamily: "monospace", fontSize: 11 }}>
                      {member.no}
                    </div>
                  </div>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded shrink-0"
                    style={{
                      background: member.type === "소비자" ? "#cffafe" : "#f5f6fa",
                      color: member.type === "소비자" ? "#0891b2" : "var(--muted-foreground)",
                    }}
                  >
                    {member.type}
                  </span>
                  <ChevronDown
                    size={12}
                    style={{
                      color: isSelected ? "var(--accent-primary)" : "var(--muted-foreground)",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      flexShrink: 0,
                    }}
                  />
                </button>

                {/* Expanded Detail */}
                <div
                  style={{
                    maxHeight: isExpanded ? 120 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.25s ease",
                  }}
                >
                  <div
                    className="px-3 py-3 rounded"
                    style={{
                      background: "var(--surface-row-checked)",
                      border: "1px solid var(--accent-border)",
                      borderTop: "none",
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Phone size={10} style={{ color: "var(--accent-primary)" }} />
                      <span className="text-xs" style={{ color: "var(--foreground)", fontFamily: "monospace", fontSize: 12 }}>
                        {member.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Mail size={10} style={{ color: "var(--accent-primary)" }} />
                      <span className="text-xs truncate" style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
                        {member.email}
                      </span>
                    </div>
                    <div
                      className="text-xs mt-2 pt-2"
                      style={{ color: "var(--muted-foreground)", borderTop: "1px solid var(--accent-border)", fontSize: 12 }}
                    >
                      가입일 <span style={{ color: "var(--accent-primary)", fontFamily: "monospace" }}>{member.joinDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
