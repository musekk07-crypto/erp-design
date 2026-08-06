import React, { useEffect } from "react";

type BrowserPromptModalProps = {
  open: boolean;
  ariaLabel: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
};

export function BrowserPromptModal({
  open,
  ariaLabel,
  message,
  onConfirm,
  onClose,
  children,
}: BrowserPromptModalProps) {
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

  return (
    <div className="browser-prompt-modal" role="presentation" onClick={onClose}>
      <div
        className="browser-prompt-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="browser-prompt-modal__origin">office.binsoft.co.kr:7999 내용:</p>
        <div className="browser-prompt-modal__message">{message}</div>
        {children}
        <div className="browser-prompt-modal__actions">
          <button type="button" className="browser-prompt-modal__btn browser-prompt-modal__btn--primary" onClick={onConfirm}>
            확인
          </button>
          <button type="button" className="browser-prompt-modal__btn" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
