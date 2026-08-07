import React, { useMemo } from "react";
import { FileSpreadsheet, RefreshCw, Search, SlidersHorizontal } from "lucide-react";

export type MemberOrgChartNode = {
  name: string;
  memberNo: string;
  rank: string;
  isSelf?: boolean;
};

type MemberOrgChartMember = {
  id: number;
  name: string;
  no: string;
  rank: string;
};

const KIM_SANGKYUNG_CHAIN: Omit<MemberOrgChartNode, "isSelf">[] = [
  { name: "양영숙", memberNo: "N26946526", rank: "정회원" },
  { name: "CHEN KU CHENG", memberNo: "N26731562", rank: "정회원" },
  { name: "조수용", memberNo: "N26926256", rank: "그린" },
  { name: "임소연", memberNo: "N26887412", rank: "정회원" },
  { name: "강태민", memberNo: "N26845109", rank: "정회원" },
  { name: "윤하늘", memberNo: "N26790231", rank: "정회원" },
  { name: "서민호", memberNo: "N26711884", rank: "정회원" },
];

function buildOrgChartChain(member: MemberOrgChartMember): MemberOrgChartNode[] {
  const selfNode: MemberOrgChartNode = {
    name: member.name,
    memberNo: member.no,
    rank: member.rank,
    isSelf: true,
  };

  if (member.id === 20) {
    return [selfNode, ...KIM_SANGKYUNG_CHAIN];
  }

  const downline: MemberOrgChartNode[] = Array.from({ length: 7 }, (_, index) => ({
    name: `구성원${index + 1}`,
    memberNo: `N26${String(900000 + member.id * 10 + index).slice(-6)}`,
    rank: index === 2 ? "그린" : "정회원",
  }));

  return [selfNode, ...downline];
}

type MemberOrgChartViewProps = {
  member: MemberOrgChartMember;
};

function OrgChartToolbarButton({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
}) {
  return (
    <button type="button" className="member-info-toolbar-item member-org-chart-toolbar__item">
      <Icon size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
      <span>{label}</span>
    </button>
  );
}

function OrgChartNodeBox({ node }: { node: MemberOrgChartNode }) {
  return (
    <div className={`member-org-chart-node${node.isSelf ? " is-self" : ""}`}>
      <div className="member-org-chart-node__name">{node.name}</div>
      <div className="member-org-chart-node__no">{node.memberNo}</div>
      <div className="member-org-chart-node__rank">{node.rank}</div>
    </div>
  );
}

export function MemberOrgChartView({ member }: MemberOrgChartViewProps) {
  const chain = useMemo(() => buildOrgChartChain(member), [member]);

  return (
    <div className="member-org-chart-view">
      <div className="member-org-chart-toolbar-shell">
        <div className="member-info-toolbar member-org-chart-toolbar">
          <OrgChartToolbarButton icon={Search} label="검색" />
          <OrgChartToolbarButton icon={SlidersHorizontal} label="조직도설정" />
          <OrgChartToolbarButton icon={FileSpreadsheet} label="엑셀 내보내기" />
          <OrgChartToolbarButton icon={RefreshCw} label="새로고침" />
        </div>
      </div>

      <div className="member-org-chart-canvas">
        <div className="member-org-chart-chain">
          {chain.map((node, index) => (
            <React.Fragment key={`${node.memberNo}-${index}`}>
              <OrgChartNodeBox node={node} />
              {index < chain.length - 1 && <div className="member-org-chart-connector" aria-hidden />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
