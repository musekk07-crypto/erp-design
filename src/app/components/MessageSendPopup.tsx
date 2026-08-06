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
  const [recipientOptions, setRecipientOptions] = useState<string[]>([]);
  const [recipient, setRecipient] = useState(defaultPhone ?? phoneOptions[0] ?? "");
  const [timestamp, setTimestamp] = useState(() => formatMessageTimestamp(new Date()));
  const [addPhoneOpen, setAddPhoneOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");

  const initialOptions = useMemo(() => {
    const unique = new Set(phoneOptions.filter(Boolean));
    if (defaultPhone) unique.add(defaultPhone);
    return Array.from(unique);
  }, [phoneOptions, defaultPhone]);

  useEffect(() => {
    if (!open) return;
    setMessage("");
    setRecipientOptions(initialOptions);
    setRecipient(defaultPhone ?? phoneOptions[0] ?? "");
    setTimestamp(formatMessageTimestamp(new Date()));
    setAddPhoneOpen(false);
    setNewPhone("");
  }, [open, defaultPhone, phoneOptions, initialOptions]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      if (addPhoneOpen) setAddPhoneOpen(false);
      else onClose();
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose, addPhoneOpen]);

  if (!open) return null;

  function handleConfirm() {
    onConfirm?.({ message, recipient });
    onClose();
  }

  function handleAddPhoneConfirm() {
    const trimmed = newPhone.trim();
    if (!trimmed) {
      setAddPhoneOpen(false);
      return;
    }
    setRecipientOptions((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setRecipient(trimmed);
    setNewPhone("");
    setAddPhoneOpen(false);
  }

  return (
    <>
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
                  {recipientOptions.map((phone) => (
                    <option key={phone} value={phone}>
                      {phone}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="message-send-modal__select-icon" aria-hidden />
              </div>
              <button
                type="button"
                className="message-send-modal__add-btn"
                aria-label="받는사람 추가"
                onClick={(event) => {
                  event.stopPropagation();
                  setAddPhoneOpen(true);
                }}
              >
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

    {addPhoneOpen && (
      <div className="message-add-phone-modal" role="presentation" onClick={() => setAddPhoneOpen(false)}>
        <div
          className="message-add-phone-modal__panel"
          role="dialog"
          aria-modal="true"
          aria-label="이동전화 번호 추가"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="message-add-phone-modal__origin">office.binsoft.co.kr:7999 내용:</p>
          <p className="message-add-phone-modal__prompt">추가할 이동전화 번호를 입력하세요.</p>
          <input
            type="text"
            className="message-add-phone-modal__input"
            value={newPhone}
            onChange={(event) => setNewPhone(event.target.value)}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") handleAddPhoneConfirm();
            }}
          />
          <div className="message-add-phone-modal__actions">
            <button type="button" className="message-add-phone-modal__btn message-add-phone-modal__btn--primary" onClick={handleAddPhoneConfirm}>
              확인
            </button>
            <button type="button" className="message-add-phone-modal__btn" onClick={() => setAddPhoneOpen(false)}>
              취소
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
