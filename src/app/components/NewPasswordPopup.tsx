import React from "react";
import { BrowserPromptModal } from "./BrowserPromptModal";

type NewPasswordPopupProps = {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
};

export function NewPasswordPopup({ open, onClose, onConfirm }: NewPasswordPopupProps) {
  function handleConfirm() {
    onConfirm?.();
    onClose();
  }

  return (
    <BrowserPromptModal
      open={open}
      ariaLabel="새 비밀번호 생성"
      message={
        <>
          선택된 회원에게 새로운 비밀번호를 랜덤하게 생성합니다.
          <br />
          생성하시겠습니까?
        </>
      }
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}
