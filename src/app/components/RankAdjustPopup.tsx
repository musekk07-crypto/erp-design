import React, { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { RankHistoryPopup } from "./RankHistoryPopup";

const RANK_OPTIONS = [
  "매니저",
  "이사",
  "디렉터",
  "실버",
  "골드",
  "퍼플",
  "다이아몬드",
  "블루",
  "정회원",
  "멤버",
  "준회원",
];

type RankPolicy = "noDemotion" | "fixed" | "general";

type RankAdjustPopupProps = {
  open: boolean;
  memberName: string;
  memberLoginId: string;
  currentRank?: string;
  onClose: () => void;
  onConfirm?: (payload: { rank: string; policy: RankPolicy }) => void;
};

export function RankAdjustPopup({
  open,
  memberName,
  memberLoginId,
  currentRank = "매니저",
  onClose,
  onConfirm,
}: RankAdjustPopupProps) {
  const [rank, setRank] = useState(currentRank);
  const [policy, setPolicy] = useState<RankPolicy>("fixed");
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRank(RANK_OPTIONS.includes(currentRank) ? currentRank : "매니저");
    setPolicy("fixed");
    setHistoryOpen(false);
  }, [open, currentRank]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (historyOpen) setHistoryOpen(false);
        else onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, historyOpen]);

  if (!open) return null;

  const loginTail = memberLoginId.slice(-2);
  const titleName = /[a-zA-Z]{2}/.test(loginTail) ? `${memberName}${loginTail}` : memberName;

  function handleConfirm() {
    onConfirm?.({ rank, policy });
    onClose();
  }

  return (
    <>
      <div className="rank-adjust-modal" role="presentation" onClick={onClose}>
        <div
          className="rank-adjust-modal__panel"
          role="dialog"
          aria-modal="true"
          aria-label={`${memberName} 회원의 직급`}
          onClick={(event) => event.stopPropagation()}
        >
        <div className="rank-adjust-modal__header">
          <h2 className="rank-adjust-modal__title">&apos;{titleName}&apos; 회원의 직급</h2>
          <button type="button" className="rank-adjust-modal__close" aria-label="닫기" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="rank-adjust-modal__body">
          <div className="rank-adjust-modal__field">
            <label className="rank-adjust-modal__label" htmlFor="rank-adjust-select">
              직급명
            </label>
            <div className="rank-adjust-modal__select-wrap">
              <select
                id="rank-adjust-select"
                className="rank-adjust-modal__select"
                value={rank}
                onChange={(event) => setRank(event.target.value)}
              >
                {RANK_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="rank-adjust-modal__select-icon" aria-hidden />
            </div>
          </div>

          <p className="rank-adjust-modal__guide">
            직급 히스토리를 보시려면{" "}
            <button type="button" className="rank-adjust-modal__link" onClick={() => setHistoryOpen(true)}>
              여기
            </button>{" "}
            를 클릭하세요.
          </p>
          <p className="rank-adjust-modal__guide">
            사용자 직급할당은 <button type="button" className="rank-adjust-modal__link">여기</button> 를 클릭하세요.
          </p>

          <fieldset className="rank-adjust-modal__policy">
            <legend className="sr-only">직급 정책</legend>
            <label className="rank-adjust-modal__radio">
              <input
                type="radio"
                name="rank-policy"
                value="noDemotion"
                checked={policy === "noDemotion"}
                onChange={() => setPolicy("noDemotion")}
              />
              <span>직급하락 없음</span>
            </label>
            <label className="rank-adjust-modal__radio">
              <input
                type="radio"
                name="rank-policy"
                value="fixed"
                checked={policy === "fixed"}
                onChange={() => setPolicy("fixed")}
              />
              <span>직급고정</span>
            </label>
            <label className="rank-adjust-modal__radio">
              <input
                type="radio"
                name="rank-policy"
                value="general"
                checked={policy === "general"}
                onChange={() => setPolicy("general")}
              />
              <span>일반</span>
            </label>
          </fieldset>

          <p className="rank-adjust-modal__hint">
            상위 직급으로 변경시에는 직급하락없음이나 고정을 선택하세요
          </p>

          <div className="rank-adjust-modal__divider" aria-hidden />

          <div className="rank-adjust-modal__actions">
            <button type="button" className="rank-adjust-modal__btn" onClick={handleConfirm}>
              확인
            </button>
            <button type="button" className="rank-adjust-modal__btn" onClick={onClose}>
              취소
            </button>
          </div>
          </div>
        </div>
      </div>

      <RankHistoryPopup open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
