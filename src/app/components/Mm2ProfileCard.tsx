import React from "react";
import { User, Camera, ExternalLink, MessageCircle, Phone } from "lucide-react";

export type ProfileMember = {
  name: string;
  no: string;
  loginId: string;
  regDate: string;
  ssn: string;
  phone: string;
  region: string;
  rank: string;
  grade: string;
};

export type ProfileField = {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  bold?: boolean;
};

export function buildMm2ProfileFields(member: ProfileMember): ProfileField[] {
  return [
    { label: "회원번호", value: member.no, highlight: true, bold: true },
    { label: "아이디", value: member.loginId, bold: true },
    { label: "성명", value: member.name, bold: true },
    { label: "회원등록일자", value: member.regDate },
    { label: "주민등록번호", value: member.ssn },
    { label: "휴대폰 번호", value: member.phone },
    { label: "비밀번호", value: <span className="mm2-profile-masked">········</span> },
    { label: "우편번호", value: "06123" },
    { label: "주소", value: member.region },
    { label: "은행명, 계좌번호, 예금주", value: `국민은행 / 123-456-789012 / ${member.name}`, bold: true },
    { label: "추천인, 후원인", value: "김성남 / 이숙련", bold: true },
    { label: "센터, 영업소", value: "서울센터 / 강남영업소", bold: true },
  ];
}

function Mm2ProfileFieldColumn({ rows }: { rows: ProfileField[] }) {
  return (
    <div className="mm2-profile-field-col">
      {rows.map((row) => (
        <div key={row.label} className="mm2-profile-field-stack">
          <span className="mm2-profile-stack-label">{row.label}</span>
          <span
            className={`mm2-profile-stack-value${row.highlight ? " is-highlight" : ""}${row.bold ? " is-bold" : ""}`}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Mm2ProfileCard({
  member,
  profileFields,
}: {
  member: ProfileMember;
  profileFields: ProfileField[];
}) {
  const fieldColumns = [0, 1, 2, 3].map((i) => profileFields.slice(i * 3, i * 3 + 3));

  return (
    <div className="mm2-profile-card">
      <button type="button" className="mm2-profile-avatar-wrap" aria-label="프로필 사진 변경">
        <span className="mm2-profile-avatar" aria-hidden>
          <User size={58} strokeWidth={1.6} />
        </span>
        <span className="mm2-profile-avatar-badge" aria-hidden>
          <Camera size={20} strokeWidth={2.25} />
        </span>
      </button>

      <div className="mm2-profile-identity">
        <h2 className="mm2-profile-name">{member.name}</h2>
        <p className="mm2-profile-rank-link">
          {member.rank} · {member.grade}
          <ExternalLink size={13} strokeWidth={2} aria-hidden />
        </p>
        <p className="mm2-profile-location">{member.region}</p>
        <div className="mm2-profile-icon-actions">
          <button type="button" className="mm2-profile-icon-btn" aria-label="문자 발송">
            <MessageCircle size={17} strokeWidth={2} />
          </button>
          <button type="button" className="mm2-profile-icon-btn" aria-label="전화">
            <Phone size={17} strokeWidth={2} />
          </button>
        </div>
      </div>

      {fieldColumns.map((col, index) => (
        <React.Fragment key={index}>
          <div className="mm2-profile-col-divider" aria-hidden />
          <Mm2ProfileFieldColumn rows={col} />
        </React.Fragment>
      ))}
    </div>
  );
}
