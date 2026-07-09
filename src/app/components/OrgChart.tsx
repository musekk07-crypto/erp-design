import React from "react";

interface OrgChartProps {
  memberId: number;
  memberName: string;
}

const TEXT_BLUE = "#3b82f6";
const LABEL_GRAY = "#94a3b8";
const BORDER_GRAY = "#e2e8f0";
const BORDER_BLUE = "#3b82f6";
const CARD_W = 167;
const CARD_H = 112;
const EXTRA_H = 36;
const GAP = 10;
const COL_GAP = 36;

function Card({ label, name, id, date, rank, score, isSelf = false }: {
  label: string; name: string; id: number; date: string; rank: string; score: number | string; isSelf?: boolean;
}) {
  return (
    <div style={{
      width: CARD_W,
      height: CARD_H,
      border: isSelf ? `2px solid ${BORDER_BLUE}` : `1px solid ${BORDER_GRAY}`,
      borderRadius: 6,
      background: "#fff",
      textAlign: "center",
      padding: "8px 6px 6px",
      position: "relative",
      boxSizing: "border-box",
      flexShrink: 0,
    }}>
      {isSelf && (
        <span style={{
          position: "absolute", top: 5, right: 5,
          background: BORDER_BLUE, color: "#fff",
          fontSize: 10, padding: "1px 5px", borderRadius: 8, fontWeight: 700,
        }}>자신</span>
      )}
      <div style={{ fontSize: 11, color: LABEL_GRAY, marginBottom: 4 }}>
        {isSelf ? "나" : label}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: isSelf ? TEXT_BLUE : "#1e2130", marginBottom: 2 }}>
        {name}({id})
      </div>
      <div style={{ fontSize: 11, color: isSelf ? TEXT_BLUE : "#64748b", marginBottom: 1 }}>{date}</div>
      <div style={{ fontSize: 11, color: isSelf ? TEXT_BLUE : "#64748b", marginBottom: 3 }}>{rank}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: isSelf ? TEXT_BLUE : "#1e2130" }}>{score}</div>
    </div>
  );
}

function ExtraBox({ label }: { label: string }) {
  return (
    <div style={{
      width: CARD_W, height: EXTRA_H,
      border: `1px dashed ${BORDER_GRAY}`,
      borderRadius: 6, background: "#f8fafc",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, color: LABEL_GRAY, boxSizing: "border-box", flexShrink: 0,
    }}>
      {label}
    </div>
  );
}

export function OrgChart({ memberId, memberName }: OrgChartProps) {
  // Static data matching the image
  const parent = { label: "상위", name: "고병도", id: 6, date: "2026-02-20", rank: "매니저", score: 72.63 };
  const extraAbove = "외 15명";
  const sibling = { label: "형제", name: "한숙자", id: 15, date: "2026-04-28", rank: "정회원", score: 0 };
  const self = { label: "나", name: "이숙련", id: 16, date: "2026-05-07", rank: "그린", score: 7.18 };
  const child = { name: "김성남", id: 0 };

  // Heights in center column (top to bottom): extra, sibling, self
  const col2Items = [
    { type: "extra", h: EXTRA_H },
    { type: "node", h: CARD_H },  // sibling
    { type: "node", h: CARD_H },  // self
  ];
  const totalCol2H = col2Items.reduce((a, b) => a + b.h, 0) + GAP * (col2Items.length - 1);

  // Y centers of each col2 item
  let col2Ys: number[] = [];
  let y = 0;
  col2Items.forEach((item) => {
    col2Ys.push(y + item.h / 2);
    y += item.h + GAP;
  });

  const selfIdx = 2;
  const selfCenterY = col2Ys[selfIdx];
  const parentCenterY = selfCenterY; // parent aligned with self

  const HPAD = 20;
  const VPAD = 16;
  const col1X = HPAD;
  const col2X = col1X + CARD_W + COL_GAP;
  const col3X = col2X + CARD_W + COL_GAP;

  const railX = col2X - COL_GAP / 2;
  const svgW = col3X + CARD_W + HPAD;
  const svgH = totalCol2H + VPAD * 2;

  return (
    <div style={{ overflow: "auto", scrollbarWidth: "none", padding: `${VPAD}px 0`, display: "flex", justifyContent: "center" }}>
      <svg width={svgW} height={svgH} style={{ overflow: "visible", display: "block" }}>

        {/* ── Parent card ── */}
        <foreignObject x={col1X} y={parentCenterY - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
          <Card {...parent} />
        </foreignObject>

        {/* Parent → rail */}
        <line x1={col1X + CARD_W} y1={parentCenterY} x2={railX} y2={parentCenterY} stroke={BORDER_GRAY} strokeWidth={1} />

        {/* Vertical rail: from top extra center to self center */}
        <line x1={railX} y1={col2Ys[0]} x2={railX} y2={selfCenterY} stroke={BORDER_GRAY} strokeWidth={1} />

        {/* Rail → each col2 item */}
        {col2Ys.map((cy, i) => (
          <line key={i} x1={railX} y1={cy} x2={col2X} y2={cy} stroke={BORDER_GRAY} strokeWidth={1} />
        ))}

        {/* Extra above */}
        <foreignObject x={col2X} y={0} width={CARD_W + 2} height={EXTRA_H + 2}>
          <ExtraBox label={extraAbove} />
        </foreignObject>

        {/* Sibling card */}
        <foreignObject x={col2X} y={col2Ys[1] - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
          <Card {...sibling} />
        </foreignObject>

        {/* Self card */}
        <foreignObject x={col2X} y={col2Ys[2] - CARD_H / 2} width={CARD_W + 2} height={CARD_H + 2}>
          <Card {...self} isSelf />
        </foreignObject>

        {/* Self → child line */}
        <line x1={col2X + CARD_W} y1={selfCenterY} x2={col3X} y2={selfCenterY} stroke={BORDER_GRAY} strokeWidth={1} />

        {/* Child text node */}
        <foreignObject x={col3X} y={selfCenterY - 16} width={CARD_W + 2} height={34}>
          <div style={{
            border: `1px solid ${BORDER_GRAY}`, borderRadius: 6,
            background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            height: 32, fontSize: 13, fontWeight: 600, color: "#1e2130",
          }}>
            {child.name} ({child.id})
          </div>
        </foreignObject>

      </svg>
    </div>
  );
}
