import React, { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

export type RelationMemberOption = {
  id: number;
  no: string;
  loginId: string;
  name: string;
  type: string;
  regDate: string;
  status: string;
  rank: string;
};

type SearchField = "nameOrNo" | "loginId" | "name";

type RecommenderSelectPopupProps = {
  open: boolean;
  title?: string;
  candidates: RelationMemberOption[];
  excludeId?: number;
  onClose: () => void;
  onSelect: (member: RelationMemberOption) => void;
};

const SEARCH_FIELDS: { value: SearchField; label: string }[] = [
  { value: "nameOrNo", label: "이름 또는 회원번호" },
  { value: "loginId", label: "아이디" },
  { value: "name", label: "이름" },
];

function matchPattern(value: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed || trimmed === "%") return true;
  const pattern = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*");
  return new RegExp(`^${pattern}$`, "i").test(value);
}

function filterCandidates(
  candidates: RelationMemberOption[],
  excludeId: number | undefined,
  field: SearchField,
  query: string,
) {
  return candidates.filter((member) => {
    if (excludeId != null && member.id === excludeId) return false;
    if (field === "nameOrNo") {
      return matchPattern(member.name, query) || matchPattern(member.no, query) || matchPattern(member.loginId, query);
    }
    if (field === "loginId") return matchPattern(member.loginId, query);
    return matchPattern(member.name, query);
  });
}

export function RecommenderSelectPopup({
  open,
  title = "추천인 선택",
  candidates,
  excludeId,
  onClose,
  onSelect,
}: RecommenderSelectPopupProps) {
  const [searchField, setSearchField] = useState<SearchField>("nameOrNo");
  const [searchQuery, setSearchQuery] = useState("%");
  const [results, setResults] = useState<RelationMemberOption[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSearchField("nameOrNo");
    setSearchQuery("%");
    setResults([]);
    setHasSearched(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const resultRows = useMemo(
    () => results.map((member, index) => ({ member, index: index + 1 })),
    [results],
  );

  if (!open) return null;

  function handleSearch() {
    setResults(filterCandidates(candidates, excludeId, searchField, searchQuery));
    setHasSearched(true);
  }

  return (
    <div className="recommender-select-modal" role="presentation" onClick={onClose}>
      <div
        className="recommender-select-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="recommender-select-modal__header">
          <h2 className="recommender-select-modal__title">{title}</h2>
          <button type="button" className="recommender-select-modal__close" aria-label="닫기" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="recommender-select-modal__toolbar">
          <div className="recommender-select-modal__search-field">
            <select
              value={searchField}
              onChange={(event) => setSearchField(event.target.value as SearchField)}
              className="recommender-select-modal__select"
            >
              {SEARCH_FIELDS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDownIcon />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch();
            }}
            className="recommender-select-modal__input"
            aria-label="검색어"
          />
          <button type="button" className="recommender-select-modal__search-btn" onClick={handleSearch}>
            <Search size={16} />
            <span>검색</span>
          </button>
        </div>

        <div className="recommender-select-modal__table-wrap split-table-block">
          <div className="recommender-select-modal__table-scroll">
            <table className="recommender-select-modal__table">
              <thead className="split-table-head">
                <tr>
                  <th className="recommender-select-modal__col-check" />
                  <th>No</th>
                  <th>회원번호</th>
                  <th>아이디</th>
                  <th>이름</th>
                  <th>회원구분명</th>
                  <th>등록일자</th>
                  <th>상태명</th>
                  <th>직급</th>
                </tr>
              </thead>
              <tbody>
                {resultRows.length > 0 ? (
                  resultRows.map(({ member, index }) => (
                    <tr
                      key={member.id}
                      className="member-table-row recommender-select-modal__row"
                      onClick={() => onSelect(member)}
                    >
                      <td className="recommender-select-modal__col-check">
                        <input type="checkbox" readOnly tabIndex={-1} />
                      </td>
                      <td>{index}</td>
                      <td className="recommender-select-modal__mono">{member.no}</td>
                      <td className="recommender-select-modal__mono">{member.loginId}</td>
                      <td>{member.name}</td>
                      <td>{member.type}</td>
                      <td>{member.regDate}</td>
                      <td>{member.status}</td>
                      <td>{member.rank}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="recommender-select-modal__empty-row">
                    <td colSpan={9}>{hasSearched ? "검색 결과가 없습니다." : ""}</td>
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

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
