import React, { useEffect, useState } from "react";
import { FileText, Pencil, RefreshCw, Trash2, X } from "lucide-react";

export type RankHistoryRow = {
  id: number;
  closingDate: string;
  closingType: string;
  promotionType: string;
  previousRank: string;
  assignedRank: string;
  calculatedRank: string;
  effectiveRank: string;
  currentRank: string;
  totalPersonalSales: number;
  totalPersonalSalesGroup: number;
  closingPersonalSales: number;
  closingPersonalSalesGroup: number;
  salesA: number;
  salesB: number;
  closingSalesA: number;
  closingSalesB: number;
  remarks: string;
};

const SALES_ROW_DEFAULT = {
  totalPersonalSales: 10_000,
  totalPersonalSalesGroup: 10_000,
  closingPersonalSales: 0,
  closingPersonalSalesGroup: 0,
  salesA: 3_198_000,
  salesB: 0,
  closingSalesA: 0,
  closingSalesB: 0,
  remarks: "",
};

const SAMPLE_RANK_HISTORY: RankHistoryRow[] = [
  {
    id: 1,
    closingDate: "2026-08-04",
    closingType: "주간수당 정산",
    promotionType: "직급고정",
    previousRank: "매니저",
    assignedRank: "",
    calculatedRank: "그린",
    effectiveRank: "그린",
    currentRank: "매니저",
    ...SALES_ROW_DEFAULT,
  },
  {
    id: 2,
    closingDate: "2026-07-28",
    closingType: "주간수당 정산",
    promotionType: "직급하락 없음",
    previousRank: "매니저",
    assignedRank: "",
    calculatedRank: "그린",
    effectiveRank: "그린",
    currentRank: "매니저",
    ...SALES_ROW_DEFAULT,
  },
  {
    id: 3,
    closingDate: "2026-07-21",
    closingType: "주간수당 정산",
    promotionType: "직급고정",
    previousRank: "정회원",
    assignedRank: "",
    calculatedRank: "그린",
    effectiveRank: "그린",
    currentRank: "매니저",
    ...SALES_ROW_DEFAULT,
  },
  {
    id: 4,
    closingDate: "2026-07-14",
    closingType: "주간수당 정산",
    promotionType: "직급하락 없음",
    previousRank: "정회원",
    assignedRank: "",
    calculatedRank: "정회원",
    effectiveRank: "정회원",
    currentRank: "정회원",
    ...SALES_ROW_DEFAULT,
  },
  {
    id: 5,
    closingDate: "2026-07-07",
    closingType: "주간수당 정산",
    promotionType: "직급고정",
    previousRank: "정회원",
    assignedRank: "",
    calculatedRank: "정회원",
    effectiveRank: "정회원",
    currentRank: "정회원",
    totalPersonalSales: 10_000,
    totalPersonalSalesGroup: 10_000,
    closingPersonalSales: 10_000,
    closingPersonalSalesGroup: 10_000,
    salesA: 3_198_000,
    salesB: 0,
    closingSalesA: 0,
    closingSalesB: 0,
    remarks: "adbcc",
  },
  {
    id: 6,
    closingDate: "2026-06-30",
    closingType: "주간수당 정산",
    promotionType: "직급하락 없음",
    previousRank: "Unspecified",
    assignedRank: "",
    calculatedRank: "정회원",
    effectiveRank: "정회원",
    currentRank: "정회원",
    totalPersonalSales: 0,
    totalPersonalSalesGroup: 0,
    closingPersonalSales: 0,
    closingPersonalSalesGroup: 0,
    salesA: 3_198_000,
    salesB: 0,
    closingSalesA: 3_198_000,
    closingSalesB: 0,
    remarks: "",
  },
  {
    id: 7,
    closingDate: "2026-06-23",
    closingType: "주간수당 정산",
    promotionType: "직급고정",
    previousRank: "Unspecified",
    assignedRank: "",
    calculatedRank: "Unspecified",
    effectiveRank: "Unspecified",
    currentRank: "Unspecified",
    totalPersonalSales: 0,
    totalPersonalSalesGroup: 0,
    closingPersonalSales: 0,
    closingPersonalSalesGroup: 0,
    salesA: 0,
    salesB: 0,
    closingSalesA: 0,
    closingSalesB: 0,
    remarks: "",
  },
];

type RankHistoryPopupProps = {
  open: boolean;
  rows?: RankHistoryRow[];
  onClose: () => void;
};

function formatSales(value: number) {
  return value.toLocaleString("en-US");
}

export function RankHistoryPopup({ open, rows = SAMPLE_RANK_HISTORY, onClose }: RankHistoryPopupProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!open) return;
    setChecked(new Set());
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

  const allChecked = rows.length > 0 && rows.every((row) => checked.has(row.id));

  function toggleAll() {
    if (allChecked) {
      setChecked(new Set());
      return;
    }
    setChecked(new Set(rows.map((row) => row.id)));
  }

  function toggleOne(id: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="rank-history-modal" role="presentation" onClick={onClose}>
      <div
        className="rank-history-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label="직급 히스토리"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rank-history-modal__header">
          <h2 className="rank-history-modal__title">직급 히스토리</h2>
          <button type="button" className="rank-history-modal__close" aria-label="닫기" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="rank-history-modal__toolbar">
          <div className="rank-history-modal__toolbar-spacer" />
          <div className="rank-history-modal__toolbar-actions">
            <button type="button" className="rank-history-modal__icon-btn" aria-label="새로 만들기">
              <FileText size={16} />
            </button>
            <button type="button" className="rank-history-modal__icon-btn" aria-label="수정">
              <Pencil size={16} />
            </button>
            <button type="button" className="rank-history-modal__icon-btn" aria-label="삭제">
              <Trash2 size={16} />
            </button>
            <button type="button" className="rank-history-modal__icon-btn" aria-label="새로고침">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="rank-history-modal__table-wrap">
          <table className="rank-history-modal__table">
            <thead>
              <tr>
                <th className="rank-history-modal__col-check">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    aria-label="전체 선택"
                  />
                </th>
                <th className="rank-history-modal__col-no">No</th>
                <th>마감일자</th>
                <th>마감구분명</th>
                <th>승급구분명</th>
                <th>이전직급명</th>
                <th>사용자할당직급명</th>
                <th>계산직급명</th>
                <th>유효직급명</th>
                <th>현재직급명</th>
                <th className="rank-history-modal__col-num">전체본인매출</th>
                <th className="rank-history-modal__col-num">전체본인매출(그룹용)</th>
                <th className="rank-history-modal__col-num">마감내본인매출</th>
                <th className="rank-history-modal__col-num">마감내본인매출(그룹용)</th>
                <th className="rank-history-modal__col-num">A</th>
                <th className="rank-history-modal__col-num">B</th>
                <th className="rank-history-modal__col-num">마감내A매출</th>
                <th className="rank-history-modal__col-num">마감내B매출</th>
                <th className="rank-history-modal__col-remarks">비고</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className={checked.has(row.id) ? "is-checked" : undefined}>
                  <td className="rank-history-modal__col-check">
                    <input
                      type="checkbox"
                      checked={checked.has(row.id)}
                      onChange={() => toggleOne(row.id)}
                      aria-label={`${index + 1}행 선택`}
                    />
                  </td>
                  <td className="rank-history-modal__col-no">{index + 1}</td>
                  <td>{row.closingDate}</td>
                  <td>{row.closingType}</td>
                  <td>{row.promotionType}</td>
                  <td>{row.previousRank}</td>
                  <td>{row.assignedRank}</td>
                  <td>{row.calculatedRank}</td>
                  <td>{row.effectiveRank}</td>
                  <td>{row.currentRank}</td>
                  <td className="rank-history-modal__col-num">{formatSales(row.totalPersonalSales)}</td>
                  <td className="rank-history-modal__col-num">{formatSales(row.totalPersonalSalesGroup)}</td>
                  <td className="rank-history-modal__col-num">{formatSales(row.closingPersonalSales)}</td>
                  <td className="rank-history-modal__col-num">{formatSales(row.closingPersonalSalesGroup)}</td>
                  <td className="rank-history-modal__col-num">{formatSales(row.salesA)}</td>
                  <td className="rank-history-modal__col-num">{formatSales(row.salesB)}</td>
                  <td className="rank-history-modal__col-num">{formatSales(row.closingSalesA)}</td>
                  <td className="rank-history-modal__col-num">{formatSales(row.closingSalesB)}</td>
                  <td className="rank-history-modal__col-remarks">{row.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rank-history-modal__footer">
          <div className="rank-history-modal__footer-bar" aria-hidden />
          <button type="button" className="rank-history-modal__close-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
