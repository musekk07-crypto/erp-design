import React, { useEffect } from "react";
import { GitFork, X } from "lucide-react";

type OrgChartPopupProps = {
  open: boolean;
  memberName: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function OrgChartPopup({ open, memberName, onClose, children }: OrgChartPopupProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="org-chart-modal" role="presentation" onClick={onClose}>
      <div
        className="org-chart-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${memberName} 회원의 조직도`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="org-chart-modal__header">
          <div className="org-chart-modal__title-wrap">
            <GitFork size={16} className="org-chart-modal__title-icon" aria-hidden />
            <h2 className="org-chart-modal__title">&apos;{memberName}&apos; 회원의 조직도</h2>
          </div>
          <button type="button" className="org-chart-modal__close" aria-label="닫기" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="org-chart-modal__body">{children}</div>

        <div className="org-chart-modal__footer">
          <button type="button" className="org-chart-modal__close-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
