import React, { useEffect, useState } from "react";
import { Info, X } from "lucide-react";

export type BusinessInfoValues = {
  registrationNumber: string;
  companyName: string;
  representative: string;
  representativeSsn: string;
  businessType: string;
  businessItem: string;
  phone: string;
  fax: string;
  mobile: string;
  address: string;
  addressDetail: string;
  zipCode: string;
  remarks: string;
};

const DEFAULT_VALUES: BusinessInfoValues = {
  registrationNumber: "123-12-000001",
  companyName: "사업자",
  representative: "대표자명",
  representativeSsn: "123122-000000",
  businessType: "",
  businessItem: "",
  phone: "02-584-3757",
  fax: "",
  mobile: "010-5539-0000",
  address: "서울 구로구 디지털로32길 30 (구로동, 코오롱디지털1차)",
  addressDetail: "709호",
  zipCode: "08390",
  remarks: "비고111",
};

type BusinessInfoPopupProps = {
  open: boolean;
  initialValues?: Partial<BusinessInfoValues>;
  onClose: () => void;
  onConfirm?: (values: BusinessInfoValues) => void;
};

type FieldRowProps = {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

function FieldRow({ label, htmlFor, children, className }: FieldRowProps) {
  return (
    <div className={`business-info-modal__field${className ? ` ${className}` : ""}`}>
      <label className="business-info-modal__label" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="business-info-modal__control">{children}</div>
    </div>
  );
}

export function BusinessInfoPopup({
  open,
  initialValues,
  onClose,
  onConfirm,
}: BusinessInfoPopupProps) {
  const [values, setValues] = useState<BusinessInfoValues>(DEFAULT_VALUES);

  useEffect(() => {
    if (!open) return;
    setValues({ ...DEFAULT_VALUES, ...initialValues });
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function updateField<K extends keyof BusinessInfoValues>(key: K, value: BusinessInfoValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleConfirm() {
    onConfirm?.(values);
    onClose();
  }

  return (
    <div className="business-info-modal" role="presentation" onClick={onClose}>
      <div
        className="business-info-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label="사업자 등록정보"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="business-info-modal__header">
          <h2 className="business-info-modal__title">사업자 등록정보</h2>
          <button type="button" className="business-info-modal__close" aria-label="닫기" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="business-info-modal__body">
          <div className="business-info-modal__notice">
            <Info size={16} className="business-info-modal__notice-icon" aria-hidden />
            <div className="business-info-modal__notice-text">
              <strong>사업자 등록정보</strong>
              <span>
                고객의 사업자로 등록된 회원에 한하여 적용하며 세금계산서 및 사업자의 등록정보를 관리하는 사업자의
                등록정보를 입력하십시오.
              </span>
              <span className="business-info-modal__notice-warn">
                사업자 정보가 없는 경우, 회원정보 기준으로 작동합니다.
              </span>
            </div>
          </div>

          <FieldRow label="사업자등록번호" htmlFor="business-info-reg-no">
            <input
              id="business-info-reg-no"
              type="text"
              className="business-info-modal__input business-info-modal__input--highlight"
              value={values.registrationNumber}
              onChange={(event) => updateField("registrationNumber", event.target.value)}
            />
          </FieldRow>

          <FieldRow label="상호" htmlFor="business-info-company">
            <input
              id="business-info-company"
              type="text"
              className="business-info-modal__input"
              value={values.companyName}
              onChange={(event) => updateField("companyName", event.target.value)}
            />
          </FieldRow>

          <FieldRow label="대표자" htmlFor="business-info-rep">
            <input
              id="business-info-rep"
              type="text"
              className="business-info-modal__input"
              value={values.representative}
              onChange={(event) => updateField("representative", event.target.value)}
            />
          </FieldRow>

          <FieldRow label="대표자주민번호" htmlFor="business-info-rep-ssn">
            <input
              id="business-info-rep-ssn"
              type="text"
              className="business-info-modal__input"
              value={values.representativeSsn}
              onChange={(event) => updateField("representativeSsn", event.target.value)}
            />
          </FieldRow>

          <FieldRow label="업태" htmlFor="business-info-type">
            <input
              id="business-info-type"
              type="text"
              className="business-info-modal__input"
              value={values.businessType}
              onChange={(event) => updateField("businessType", event.target.value)}
            />
          </FieldRow>

          <FieldRow label="종목" htmlFor="business-info-item">
            <input
              id="business-info-item"
              type="text"
              className="business-info-modal__input"
              value={values.businessItem}
              onChange={(event) => updateField("businessItem", event.target.value)}
            />
          </FieldRow>

          <FieldRow label="전화번호" htmlFor="business-info-phone">
            <input
              id="business-info-phone"
              type="text"
              className="business-info-modal__input"
              value={values.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </FieldRow>

          <FieldRow label="팩스번호" htmlFor="business-info-fax">
            <input
              id="business-info-fax"
              type="text"
              className="business-info-modal__input"
              value={values.fax}
              onChange={(event) => updateField("fax", event.target.value)}
            />
          </FieldRow>

          <FieldRow label="휴대전화" htmlFor="business-info-mobile">
            <input
              id="business-info-mobile"
              type="text"
              className="business-info-modal__input"
              value={values.mobile}
              onChange={(event) => updateField("mobile", event.target.value)}
            />
          </FieldRow>

          <FieldRow label="주소" className="business-info-modal__field--address">
            <div className="business-info-modal__address-group">
              <div className="business-info-modal__address-row">
                <input
                  id="business-info-address"
                  type="text"
                  className="business-info-modal__input"
                  value={values.address}
                  onChange={(event) => updateField("address", event.target.value)}
                />
                <button type="button" className="business-info-modal__ellipsis-btn" aria-label="주소 검색">
                  ...
                </button>
              </div>
              <input
                id="business-info-address-detail"
                type="text"
                className="business-info-modal__input"
                value={values.addressDetail}
                onChange={(event) => updateField("addressDetail", event.target.value)}
              />
            </div>
          </FieldRow>

          <FieldRow label="우편번호" htmlFor="business-info-zip">
            <input
              id="business-info-zip"
              type="text"
              className="business-info-modal__input business-info-modal__input--readonly"
              value={values.zipCode}
              readOnly
            />
          </FieldRow>

          <FieldRow label="비고" htmlFor="business-info-remarks">
            <input
              id="business-info-remarks"
              type="text"
              className="business-info-modal__input"
              value={values.remarks}
              onChange={(event) => updateField("remarks", event.target.value)}
            />
          </FieldRow>

          <div className="business-info-modal__divider" aria-hidden />

          <div className="business-info-modal__actions">
            <button type="button" className="business-info-modal__btn" onClick={handleConfirm}>
              확인
            </button>
            <button type="button" className="business-info-modal__btn" onClick={onClose}>
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
