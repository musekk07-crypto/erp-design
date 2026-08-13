import React, { useMemo, useState } from "react";
import {
  Search,
  FilePlus,
  FileText,
  RotateCcw,
  Repeat2,
  CheckCircle2,
  Ban,
} from "lucide-react";

type SummaryRow = {
  id: number;
  date: string;
  orderCount: number;
  cash: number;
  online: number;
  card: number;
  credit: number;
  point: number;
  fee: number;
  sales: number;
};

type DetailRow = {
  id: number;
  orderNo: string;
  orderDate: string;
  allowanceDate: string;
  originalDate: string;
  memberName: string;
  memberType: string;
  purchaseType: string;
  receiptType: string;
};

const PERIOD_OPTIONS = [
  "오늘",
  "7일내",
  "14일내",
  "한달내",
  "1년내",
  "이번주",
  "이번달",
  "올해",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

const FILTER_CHIPS = [
  { key: "buyType", label: "매입구분", value: "전체 외 2건" },
  { key: "purchase", label: "구매구분", value: "전체 외 4건" },
  { key: "receipt", label: "접수구분", value: "전체 외 8건" },
  { key: "country", label: "국가", value: "South Korea 외 1건" },
  { key: "center", label: "센터", value: "본사 외 164건" },
  { key: "office", label: "영업소", value: "영업소 외 2건" },
  { key: "status", label: "주문상태", value: "주문취소 외 11건" },
];

function formatAmount(n: number) {
  return n.toLocaleString("ko-KR");
}

function buildSummaryRows(): SummaryRow[] {
  return Array.from({ length: 12 }, (_, i) => {
    const day = i + 1;
    const orderCount = day === 5 ? 60 : 8 + ((day * 3) % 17);
    const cash = day * 12000;
    const online = day * 45000;
    const card = day * 38000;
    const credit = day % 3 === 0 ? day * 5000 : 0;
    const point = day * 2000;
    const fee = day * 1500;
    return {
      id: day,
      date: `2026-01-${String(day).padStart(2, "0")}`,
      orderCount,
      cash,
      online,
      card,
      credit,
      point,
      fee,
      sales: cash + online + card + credit + point,
    };
  });
}

function buildDetailRows(date: string): DetailRow[] {
  const count = date.endsWith("-05") ? 18 : 6;
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    orderNo: `O${date.replace(/-/g, "")}${String(i + 1).padStart(3, "0")}`,
    orderDate: date,
    allowanceDate: date,
    originalDate: date,
    memberName: ["김민수", "이서연", "박준호", "최유진", "정하늘"][i % 5],
    memberType: i % 2 === 0 ? "일반회원" : "소비자",
    purchaseType: i % 3 === 0 ? "오토십" : "일반구매",
    receiptType: i % 4 === 0 ? "전화" : "온라인",
  }));
}

function ActionButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button type="button" className="member-info-toolbar-item order-mgmt-order-toolbar__item">
      <Icon size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
      <span>{label}</span>
    </button>
  );
}

export function OrderListManageView() {
  const [period, setPeriod] = useState("올해");
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-12-31");
  const [dateField, setDateField] = useState("주문일자");
  const [searchType, setSearchType] = useState("이름");
  const [keyword, setKeyword] = useState("%");
  const [searched, setSearched] = useState(false);
  const [selectedSummaryId, setSelectedSummaryId] = useState<number | null>(null);

  const summaryRows = useMemo(() => buildSummaryRows(), []);
  const selectedSummary = summaryRows.find((r) => r.id === selectedSummaryId) ?? null;
  const detailRows = selectedSummary ? buildDetailRows(selectedSummary.date) : [];

  const onPeriodChange = (value: string) => {
    setPeriod(value);
    if (value === "올해") {
      setDateFrom("2026-01-01");
      setDateTo("2026-12-31");
    } else if (value === "이번달") {
      setDateFrom("2026-01-01");
      setDateTo("2026-01-31");
    } else if (value === "오늘") {
      setDateFrom("2026-01-13");
      setDateTo("2026-01-13");
    }
  };

  const onSearch = () => {
    setSearched(true);
    setSelectedSummaryId(null);
  };

  return (
    <div className="order-list-manage">
      <div className="order-list-manage__search">
        <div className="order-list-manage__search-row">
          <span className="order-list-manage__label">검색기간</span>
          <select
            className="order-list-manage__control order-list-manage__control--period"
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="order-list-manage__control"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="order-list-manage__sep">~</span>
          <input
            type="date"
            className="order-list-manage__control"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <select
            className="order-list-manage__control"
            value={dateField}
            onChange={(e) => setDateField(e.target.value)}
          >
            <option value="주문일자">주문일자</option>
            <option value="결제일자">결제일자</option>
            <option value="수당적용일자">수당적용일자</option>
          </select>
        </div>

        <div className="order-list-manage__search-row">
          <span className="order-list-manage__label">검색조건</span>
          <select
            className="order-list-manage__control"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="이름">이름</option>
            <option value="회원번호">회원번호</option>
            <option value="주문서번호">주문서번호</option>
          </select>
          <input
            type="text"
            className="order-list-manage__control order-list-manage__control--keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="이름 또는 회원번호"
          />
          <button type="button" className="order-list-manage__search-btn" onClick={onSearch}>
            <Search size={15} strokeWidth={2.2} />
            <span>검색</span>
          </button>
        </div>

        <div className="order-list-manage__chips">
          {FILTER_CHIPS.map((chip) => (
            <button key={chip.key} type="button" className="order-list-manage__chip" title={chip.label}>
              <span className="order-list-manage__chip-label">{chip.label}</span>
              <span className="order-list-manage__chip-value">{chip.value}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="order-list-manage__tables">
        <div className="order-list-manage__pane">
          <div className="order-list-manage__table-scroll">
            <table className="order-list-manage__table">
              <thead>
                <tr>
                  <th className="is-check">
                    <input type="checkbox" readOnly />
                  </th>
                  <th>No</th>
                  <th>집계일자</th>
                  <th>주문서 건수</th>
                  <th>현금</th>
                  <th>온라인</th>
                  <th>카드</th>
                  <th>여신</th>
                  <th>쇼핑포인트</th>
                  <th>기간수수료</th>
                  <th>매출금액</th>
                </tr>
              </thead>
              <tbody>
                {searched ? (
                  summaryRows.map((row) => (
                    <tr
                      key={row.id}
                      className={selectedSummaryId === row.id ? "is-selected" : undefined}
                      onClick={() => setSelectedSummaryId(row.id)}
                    >
                      <td className="is-check">
                        <input type="checkbox" readOnly checked={selectedSummaryId === row.id} />
                      </td>
                      <td>{row.id}</td>
                      <td>{row.date}</td>
                      <td className="is-num">{row.orderCount}</td>
                      <td className="is-num">{formatAmount(row.cash)}</td>
                      <td className="is-num">{formatAmount(row.online)}</td>
                      <td className="is-num">{formatAmount(row.card)}</td>
                      <td className="is-num">{formatAmount(row.credit)}</td>
                      <td className="is-num">{formatAmount(row.point)}</td>
                      <td className="is-num">{formatAmount(row.fee)}</td>
                      <td className="is-num">{formatAmount(row.sales)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="is-empty">
                    <td colSpan={11}>검색 후 집계 목록이 표시됩니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="order-list-manage__pane">
          <div className="order-list-manage__table-scroll">
            <table className="order-list-manage__table">
              <thead>
                <tr>
                  <th className="is-check">
                    <input type="checkbox" readOnly />
                  </th>
                  <th>No</th>
                  <th>주문서번호</th>
                  <th>주문일자</th>
                  <th>수당적용일자</th>
                  <th>원본주문일자</th>
                  <th>회원명</th>
                  <th>주문회원구분명</th>
                  <th>구매구분명</th>
                  <th>접수구분</th>
                </tr>
              </thead>
              <tbody>
                {selectedSummary ? (
                  detailRows.map((row) => (
                    <tr key={row.id}>
                      <td className="is-check">
                        <input type="checkbox" readOnly />
                      </td>
                      <td>{row.id}</td>
                      <td>{row.orderNo}</td>
                      <td>{row.orderDate}</td>
                      <td>{row.allowanceDate}</td>
                      <td>{row.originalDate}</td>
                      <td>{row.memberName}</td>
                      <td>{row.memberType}</td>
                      <td>{row.purchaseType}</td>
                      <td>{row.receiptType}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="is-empty">
                    <td colSpan={10}>
                      {searched ? "왼쪽 집계 행을 선택하면 주문서 상세가 표시됩니다." : ""}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="order-list-manage__actions">
        <div className="member-info-toolbar order-mgmt-order-toolbar">
          <ActionButton icon={FilePlus} label="새로 주문하기" />
          <ActionButton icon={FileText} label="거래명세서" />
          <ActionButton icon={RotateCcw} label="반품등록" />
          <ActionButton icon={Repeat2} label="교환등록" />
          <ActionButton icon={CheckCircle2} label="주문서승인" />
          <ActionButton icon={Ban} label="주문서취소" />
        </div>
      </div>
    </div>
  );
}
