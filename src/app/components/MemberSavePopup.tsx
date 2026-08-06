import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

export type MemberSavePopupMember = {
  name: string;
  loginId: string;
  no: string;
  phone: string;
  ssn: string;
  regDate: string;
  region: string;
};

type SummarySection = {
  title: string;
  items: string[];
};

type MemberSavePopupProps = {
  open: boolean;
  member: MemberSavePopupMember;
  onClose: () => void;
  onConfirm?: () => void;
};

function buildSummarySections(member: MemberSavePopupMember): SummarySection[] {
  const isKim = member.name === "김상경";

  return [
    {
      title: "1. 로그인사용자 정보",
      items: [
        `회원번호 : ${member.no}`,
        `로그인 ID : ${member.loginId}`,
        "비밀번호 : ",
        `전자메일주소 : ${member.loginId}@email.com`,
      ],
    },
    {
      title: "2. 추가 회원정보",
      items: isKim
        ? [
            "등록일자 : 2025-08-26",
            `고객명 : ${member.name}`,
            "주민등록번호 : 900313-1124610",
            "주소 : 부산 금정구 대룡2길 21 (브라카하우스)",
            "City : ",
            "State : ",
            "Country : South Korea",
            "연락처 : 010-9352-1177",
          ]
        : [
            `등록일자 : ${member.regDate}`,
            `고객명 : ${member.name}`,
            `주민등록번호 : ${member.ssn}`,
            `주소 : ${member.region}`,
            "City : ",
            "State : ",
            "Country : South Korea",
            `연락처 : ${member.phone}`,
          ],
    },
    {
      title: "3. 거래은행정보",
      items: [
        "은행명 : 신한은행",
        "계좌번호 : 110-234-567890",
        "예금주 : " + member.name,
        "SwiftCode : SHBKKRSE",
        "은행통합 거래번호 : 88012345",
      ],
    },
    {
      title: "4. 상위회원과의 관계",
      items: ["후원인 : ", "추천인 : "],
    },
    {
      title: "5. 소속 그룹정보",
      items: ["센터 : 본사", "영업소 : "],
    },
    {
      title: "6. 기타 회원정보",
      items: [
        "SMS 수신동의 √",
        "EMail 수신동의 √",
        "신분증 사본등록 ",
        "신분증 등록 신청서 접수 ",
        "계좌사본등록 ",
      ],
    },
  ];
}

export function MemberSavePopup({ open, member, onClose, onConfirm }: MemberSavePopupProps) {
  const [checked, setChecked] = useState(false);
  const sections = useMemo(() => buildSummarySections(member), [member]);

  useEffect(() => {
    if (!open) return;
    setChecked(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleConfirm() {
    if (!checked) return;
    onConfirm?.();
    onClose();
  }

  return (
    <div className="member-save-modal" role="presentation" onClick={onClose}>
      <div
        className="member-save-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label="회원정보 저장"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="member-save-modal__header">
          <h2 className="member-save-modal__title">회원정보 저장</h2>
          <button type="button" className="member-save-modal__close" aria-label="닫기" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="member-save-modal__content">
          <ol className="member-save-modal__sections">
            {sections.map((section) => (
              <li key={section.title} className="member-save-modal__section">
                <div className="member-save-modal__section-title">{section.title}</div>
                <ul className="member-save-modal__list">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="member-save-modal__warnings">
            <p>후원인이 선택되어 있지 않습니다.</p>
            <p>추천인이 선택되어 있지 않습니다.</p>
          </div>
        </div>

        <div className="member-save-modal__footer">
          <label className="member-save-modal__confirm-label">
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => setChecked(event.target.checked)}
            />
            <span>검사 항목이 모두 확인되었습니다.</span>
          </label>

          <div className="member-save-modal__actions">
            <button
              type="button"
              className="member-save-modal__btn member-save-modal__btn--plain"
              disabled={!checked}
              onClick={handleConfirm}
            >
              확인
            </button>
            <button type="button" className="member-save-modal__btn member-save-modal__btn--outline" onClick={onClose}>
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
