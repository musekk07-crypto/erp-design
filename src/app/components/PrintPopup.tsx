import React, { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";

const DOCUMENT_TYPE_OPTIONS = ["회원등록증", "회원정보", "주문서", "수당내역서"];
const PRINT_OPTION_OPTIONS = ["미리보기", "인쇄", "PDF 저장"];

export type PrintPopupValues = {
  documentType: string;
  printOption: string;
};

type PrintPopupProps = {
  open: boolean;
  onClose: () => void;
  onConfirm?: (values: PrintPopupValues) => void;
};

export function PrintPopup({ open, onClose, onConfirm }: PrintPopupProps) {
  const [documentType, setDocumentType] = useState("회원등록증");
  const [printOption, setPrintOption] = useState("미리보기");

  useEffect(() => {
    if (!open) return;
    setDocumentType("회원등록증");
    setPrintOption("미리보기");
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
    onConfirm?.({ documentType, printOption });
    onClose();
  }

  return (
    <div className="print-modal" role="presentation" onClick={onClose}>
      <div
        className="print-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label="인쇄"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="print-modal__header">
          <h2 className="print-modal__title">인쇄</h2>
          <button type="button" className="print-modal__close" aria-label="닫기" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="print-modal__body">
          <div className="print-modal__field">
            <label className="print-modal__label" htmlFor="print-document-type">
              문서 종류(D)
            </label>
            <div className="print-modal__select-wrap">
              <select
                id="print-document-type"
                className="print-modal__select"
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
              >
                {DOCUMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="print-modal__select-icon" aria-hidden />
            </div>
          </div>

          <div className="print-modal__field">
            <label className="print-modal__label" htmlFor="print-option">
              인쇄옵션
            </label>
            <div className="print-modal__select-wrap">
              <select
                id="print-option"
                className="print-modal__select"
                value={printOption}
                onChange={(event) => setPrintOption(event.target.value)}
              >
                {PRINT_OPTION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="print-modal__select-icon" aria-hidden />
            </div>
          </div>

          <div className="print-modal__actions">
            <button type="button" className="print-modal__btn" onClick={handleConfirm}>
              확인
            </button>
            <button type="button" className="print-modal__btn" onClick={onClose}>
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
