import React, { useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Percent,
  SlidersHorizontal,
} from "lucide-react";

type SummaryRow = {
  id: number;
  date: string;
  orderCount: number;
  cash: number;
  online: number;
  card: number;
  credit: number;
  shopPoint: number;
  periodFee: number;
  salesTotal: number;
  tax: number;
  shipping: number;
  purchasePoint: number;
  purchaseSupply: number;
  exchangePoint: number;
  exchangeAmount: number;
  returnPoint: number;
  returnSales: number;
  pointTotal: number;
  supplyTotal: number;
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
  "오늘*",
  "7일내",
  "14일내",
  "한달내",
  "1년내",
  "이번주*",
  "이번달*",
  "올해*",
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

const SUMMARY_SEED: Array<Pick<SummaryRow, "date" | "orderCount" | "online" | "card" | "purchasePoint" | "returnPoint" | "returnSales">> = [
  { date: "2026-01-01", orderCount: 29, online: 68250, card: 7143090, purchasePoint: 6467700, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-02", orderCount: 32, online: 731200, card: 11765000, purchasePoint: 11181300, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-03", orderCount: 17, online: 215000, card: 3856000, purchasePoint: 3648000, returnPoint: -66600, returnSales: -74000 },
  { date: "2026-01-04", orderCount: 24, online: 428500, card: 6921000, purchasePoint: 6589000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-05", orderCount: 60, online: 980000, card: 15240000, purchasePoint: 14520000, returnPoint: -860200, returnSales: -955750 },
  { date: "2026-01-06", orderCount: 21, online: 312000, card: 5418000, purchasePoint: 5124000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-07", orderCount: 18, online: 156800, card: 3982000, purchasePoint: 3721000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-08", orderCount: 27, online: 544000, card: 8125000, purchasePoint: 7718000, returnPoint: -1368700, returnSales: -1520750 },
  { date: "2026-01-09", orderCount: 15, online: 98000, card: 2654000, purchasePoint: 2471000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-10", orderCount: 33, online: 672300, card: 9987000, purchasePoint: 9512000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-11", orderCount: 19, online: 241000, card: 4563000, purchasePoint: 4318000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-12", orderCount: 22, online: 385600, card: 6128000, purchasePoint: 5824000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-13", orderCount: 28, online: 512400, card: 7841000, purchasePoint: 7456000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-14", orderCount: 16, online: 178200, card: 3215000, purchasePoint: 3048000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-15", orderCount: 31, online: 698500, card: 10234000, purchasePoint: 9741000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-16", orderCount: 14, online: 125000, card: 2487000, purchasePoint: 2351000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-17", orderCount: 25, online: 456800, card: 7156000, purchasePoint: 6812000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-18", orderCount: 20, online: 298400, card: 5321000, purchasePoint: 5068000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-19", orderCount: 23, online: 367200, card: 6489000, purchasePoint: 6174000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-20", orderCount: 30, online: 612000, card: 9156000, purchasePoint: 8718000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-21", orderCount: 12, online: 89000, card: 1987000, purchasePoint: 1881000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-22", orderCount: 26, online: 501300, card: 7684000, purchasePoint: 7312000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-23", orderCount: 18, online: 234500, card: 4128000, purchasePoint: 3916000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-24", orderCount: 21, online: 345600, card: 5789000, purchasePoint: 5501000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-25", orderCount: 29, online: 578200, card: 8456000, purchasePoint: 8048000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-26", orderCount: 17, online: 198700, card: 3654000, purchasePoint: 3471000, returnPoint: 0, returnSales: 0 },
  { date: "2026-01-27", orderCount: 24, online: 412800, card: 6923000, purchasePoint: 6589000, returnPoint: 0, returnSales: 0 },
];

function formatAmount(n: number) {
  return n.toLocaleString("ko-KR");
}

function buildSummaryRows(): SummaryRow[] {
  return SUMMARY_SEED.map((seed, i) => {
    const salesTotal = seed.online + seed.card;
    const purchaseSupply = salesTotal;
    const pointTotal = seed.purchasePoint + seed.returnPoint;
    const supplyTotal = purchaseSupply + seed.returnSales;
    return {
      id: i + 1,
      date: seed.date,
      orderCount: seed.orderCount,
      cash: 0,
      online: seed.online,
      card: seed.card,
      credit: 0,
      shopPoint: 0,
      periodFee: 0,
      salesTotal,
      tax: 0,
      shipping: 0,
      purchasePoint: seed.purchasePoint,
      purchaseSupply,
      exchangePoint: 0,
      exchangeAmount: 0,
      returnPoint: seed.returnPoint,
      returnSales: seed.returnSales,
      pointTotal,
      supplyTotal,
    };
  });
}

function buildDetailRows(date: string): DetailRow[] {
  const count = date.endsWith("-05") ? 18 : 8;
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

export function OrderListManageView() {
  const [period, setPeriod] = useState("올해*");
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-12-31");
  const [dateField, setDateField] = useState("주문일자");
  const [searchType, setSearchType] = useState("이름 또는 회원번호");
  const [keyword, setKeyword] = useState("");
  const [searched, setSearched] = useState(false);
  const [selectedSummaryId, setSelectedSummaryId] = useState<number | null>(null);

  const summaryRows = useMemo(() => buildSummaryRows(), []);
  const selectedSummary = summaryRows.find((r) => r.id === selectedSummaryId) ?? null;
  const detailRows = selectedSummary ? buildDetailRows(selectedSummary.date) : [];

  const onPeriodChange = (value: string) => {
    setPeriod(value);
    if (value === "올해*" || value === "올해") {
      setDateFrom("2026-01-01");
      setDateTo("2026-12-31");
    } else if (value === "이번달*" || value === "이번달") {
      setDateFrom("2026-01-01");
      setDateTo("2026-01-31");
    } else if (value === "오늘*" || value === "오늘") {
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
          <button type="button" className="order-list-manage__nav-btn" aria-label="이전">
            <ChevronLeft size={14} />
          </button>
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
          <button type="button" className="order-list-manage__nav-btn" aria-label="다음">
            <ChevronRight size={14} />
          </button>
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
            className="order-list-manage__control order-list-manage__control--search-type"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="이름 또는 회원번호">이름 또는 회원번호</option>
            <option value="주문서번호">주문서번호</option>
            <option value="인수자명">인수자명</option>
          </select>
          <div className="order-list-manage__keyword-wrap">
            <input
              type="text"
              className="order-list-manage__control order-list-manage__control--keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearch();
                }
              }}
              placeholder=""
            />
            <button
              type="button"
              className="order-list-manage__percent-btn"
              aria-label="와일드카드"
              onClick={() => setKeyword((prev) => (prev.includes("%") ? prev : `${prev}%`))}
            >
              <Percent size={13} />
            </button>
          </div>
          <button type="button" className="order-list-manage__search-btn" onClick={onSearch}>
            <Search size={15} strokeWidth={2.2} />
            <span>검색</span>
          </button>
          <button type="button" className="order-list-manage__filter-icon-btn" aria-label="상세필터">
            <SlidersHorizontal size={15} />
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
                  <th>주문서 갯수</th>
                  <th>현금</th>
                  <th>온라인</th>
                  <th>카드</th>
                  <th>여신</th>
                  <th>쇼핑포인트</th>
                  <th>기간수수료</th>
                  <th>매출금액합</th>
                  <th>세금</th>
                  <th>배송료</th>
                  <th>구입포인트합</th>
                  <th>구입공급가합</th>
                  <th>교환포인트</th>
                  <th>교환금액</th>
                  <th>회수포인트</th>
                  <th>회수매출액</th>
                  <th>포인트합</th>
                  <th>공급가합</th>
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
                      <td className="is-num">{formatAmount(row.shopPoint)}</td>
                      <td className="is-num">{formatAmount(row.periodFee)}</td>
                      <td className="is-num">{formatAmount(row.salesTotal)}</td>
                      <td className="is-num">{formatAmount(row.tax)}</td>
                      <td className="is-num">{formatAmount(row.shipping)}</td>
                      <td className="is-num">{formatAmount(row.purchasePoint)}</td>
                      <td className="is-num">{formatAmount(row.purchaseSupply)}</td>
                      <td className="is-num">{formatAmount(row.exchangePoint)}</td>
                      <td className="is-num">{formatAmount(row.exchangeAmount)}</td>
                      <td className="is-num">{formatAmount(row.returnPoint)}</td>
                      <td className="is-num">{formatAmount(row.returnSales)}</td>
                      <td className="is-num">{formatAmount(row.pointTotal)}</td>
                      <td className="is-num">{formatAmount(row.supplyTotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="is-empty">
                    <td colSpan={21}>검색 후 집계 목록이 표시됩니다.</td>
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
    </div>
  );
}
