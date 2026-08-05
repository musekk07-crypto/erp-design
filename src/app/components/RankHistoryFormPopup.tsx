import React, { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";

const CLOSING_TYPE_OPTIONS = ["일간수당 정산", "주간수당 정산", "월간수당 정산"];

const RANK_OPTIONS = [
  "일반회원",
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
  "그린",
  "Unspecified",
];

export type RankHistoryFormValues = {
  closingDate: string;
  closingType: string;
  previousRank: string;
  afterRank: string;
  effectiveRank: string;
  remarks: string;
};

const DEFAULT_VALUES: RankHistoryFormValues = {
  closingDate: "2026-08-05",
  closingType: "일간수당 정산",
  previousRank: "일반회원",
  afterRank: "일반회원",
  effectiveRank: "일반회원",
  remarks: "",
};

type RankHistoryFormPopupProps = {
  open: boolean;
  initialValues?: Partial<RankHistoryFormValues>;
  onClose: () => void;
  onConfirm?: (values: RankHistoryFormValues) => void;
};

export function RankHistoryFormPopup({
  open,
  initialValues,
  onClose,
  onConfirm,
}: RankHistoryFormPopupProps) {
  const [values, setValues] = useState<RankHistoryFormValues>(DEFAULT_VALUES);

  useEffect(() => {
    if (!open) return;
    setValues({ ...DEFAULT_VALUES, ...initialValues });
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      onClose();
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;

  function updateField<K extends keyof RankHistoryFormValues>(key: K, value: RankHistoryFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleConfirm() {
    onConfirm?.(values);
    onClose();
  }

  return (
    <div className="rank-history-form-modal" role="presentation" onClick={onClose}>
      <div
        className="rank-history-form-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label="직급 히스토리"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rank-history-form-modal__header">
          <h2 className="rank-history-form-modal__title">직급 히스토리</h2>
          <button type="button" className="rank-history-form-modal__close" aria-label="닫기" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="rank-history-form-modal__body">
          <div className="rank-history-form-modal__field">
            <label className="rank-history-form-modal__label" htmlFor="rank-history-form-date">
              마감일자
            </label>
            <input
              id="rank-history-form-date"
              type="date"
              className="rank-history-form-modal__input rank-history-form-modal__input--date"
              value={values.closingDate}
              onChange={(event) => updateField("closingDate", event.target.value)}
            />
          </div>

          <div className="rank-history-form-modal__field">
            <label className="rank-history-form-modal__label" htmlFor="rank-history-form-type">
              마감종류
            </label>
            <div className="rank-history-form-modal__select-wrap">
              <select
                id="rank-history-form-type"
                className="rank-history-form-modal__select"
                value={values.closingType}
                onChange={(event) => updateField("closingType", event.target.value)}
              >
                {CLOSING_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="rank-history-form-modal__select-icon" aria-hidden />
            </div>
          </div>

          <div className="rank-history-form-modal__field">
            <label className="rank-history-form-modal__label" htmlFor="rank-history-form-prev">
              마감이전직급
            </label>
            <div className="rank-history-form-modal__select-wrap">
              <select
                id="rank-history-form-prev"
                className="rank-history-form-modal__select"
                value={values.previousRank}
                onChange={(event) => updateField("previousRank", event.target.value)}
              >
                {RANK_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="rank-history-form-modal__select-icon" aria-hidden />
            </div>
          </div>

          <div className="rank-history-form-modal__field">
            <label className="rank-history-form-modal__label" htmlFor="rank-history-form-after">
              마감이후직급
            </label>
            <div className="rank-history-form-modal__select-wrap">
              <select
                id="rank-history-form-after"
                className="rank-history-form-modal__select"
                value={values.afterRank}
                onChange={(event) => updateField("afterRank", event.target.value)}
              >
                {RANK_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="rank-history-form-modal__select-icon" aria-hidden />
            </div>
          </div>

          <div className="rank-history-form-modal__field">
            <label className="rank-history-form-modal__label" htmlFor="rank-history-form-effective">
              유효직급
            </label>
            <div className="rank-history-form-modal__select-wrap">
              <select
                id="rank-history-form-effective"
                className="rank-history-form-modal__select"
                value={values.effectiveRank}
                onChange={(event) => updateField("effectiveRank", event.target.value)}
              >
                {RANK_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="rank-history-form-modal__select-icon" aria-hidden />
            </div>
          </div>

          <div className="rank-history-form-modal__field">
            <label className="rank-history-form-modal__label" htmlFor="rank-history-form-remarks">
              비고
            </label>
            <input
              id="rank-history-form-remarks"
              type="text"
              className="rank-history-form-modal__input"
              value={values.remarks}
              onChange={(event) => updateField("remarks", event.target.value)}
            />
          </div>

          <div className="rank-history-form-modal__actions">
            <button type="button" className="rank-history-form-modal__btn" onClick={handleConfirm}>
              완료
            </button>
            <button type="button" className="rank-history-form-modal__btn" onClick={onClose}>
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
