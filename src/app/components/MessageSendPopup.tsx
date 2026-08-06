import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus, X } from "lucide-react";

type MessageSendPopupProps = {
  open: boolean;
  memberName: string;
  phoneOptions?: string[];
  defaultPhone?: string;
  onClose: () => void;
  onConfirm?: (payload: { message: string; recipient: string }) => void;
};

function formatMessageTimestamp(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "오후" : "오전";
  hours = hours % 12 || 12;
  return `${year}-${month}-${day} ${String(hours).padStart(2, "0")}:${minutes} ${period}`;
}

export function MessageSendPopup({
  open,
  memberName,
  phoneOptions = ["010-4355-7783"],
  defaultPhone,
  onClose,
  onConfirm,
}: MessageSendPopupProps) {
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState(defaultPhone ?? phoneOptions[0] ?? "");
  const [timestamp, setTimestamp] = useState(() => formatMessageTimestamp(new Date()));

  const options = useMemo(() => {
    const unique = new Set(phoneOptions.filter(Boolean));
    if (defaultPhone) unique.add(defaultPhone);
    return Array.from(unique);
  }, [phoneOptions, defaultPhone]);

  useEffect(() => {
    if (!open) return;
    setMessage("");
    setRecipient(defaultPhone ?? phoneOptions[0] ?? "");
    setTimestamp(formatMessageTimestamp(new Date()));
  }, [open, defaultPhone, phoneOptions]);

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
    onConfirm?.({ message, recipient });
    onClose();
  }

  return (
    <div className="message-send-modal" role="presentation" onClick={onClose}>
      <div
        className="message-send-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${memberName} 회원에게 메세지 보내기`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="message-send-modal__header">
          <h2 className="message-send-modal__title">메세지 보내기</h2>
          <button type="button" className="message-send-modal__close" aria-label="닫기" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="message-send-modal__body">
          <div className="message-send-modal__compose">
            <div className="message-send-modal__timestamp">{timestamp}</div>
            <textarea
              className="message-send-modal__textarea"
              placeholder="메세지를 입력하세요"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>

          <div className="message-send-modal__recipient">
            <label className="message-send-modal__recipient-label" htmlFor="message-send-recipient">
              받는사람
            </label>
            <div className="message-send-modal__recipient-row">
              <div className="message-send-modal__select-wrap">
                <select
                  id="message-send-recipient"
                  className="message-send-modal__select"
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                >
                  {options.map((phone) => (
                    <option key={phone} value={phone}>
                      {phone}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="message-send-modal__select-icon" aria-hidden />
              </div>
              <button type="button" className="message-send-modal__add-btn" aria-label="받는사람 추가">
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="message-send-modal__actions">
            <button type="button" className="message-send-modal__btn" onClick={handleConfirm}>
              확인
            </button>
            <button type="button" className="message-send-modal__btn" onClick={onClose}>
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
