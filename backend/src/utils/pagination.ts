import aqp from "api-query-params";

type SortOrder = "asc" | "desc";

type PaginationResult = {
  currentPage: number;
  limit: number;
  skip: number;
  sort: Record<string, SortOrder> | undefined;
  filter: Record<string, unknown>;
};

export function parsePagination(query: Record<string, unknown>): PaginationResult {
  const currentPage = Number(query.current ?? 1) || 1;
  const limit = Number(query.pageSize ?? 10) || 10;
  const skip = (currentPage - 1) * limit;
  const { filter, sort } = aqp(query as Record<string, string>);

  delete filter.current;
  delete filter.pageSize;

  const normalizedSort = normalizeSort(sort as Record<string, 1 | -1> | undefined);

  return {
    currentPage,
    limit,
    skip,
    sort: normalizedSort,
    filter
  };
}

function normalizeSort(sort: Record<string, 1 | -1> | undefined) {
  if (!sort) {
    return undefined;
  }

  const entries = Object.entries(sort).map(([key, value]) => [key, value === -1 ? "desc" : "asc"]);
  return Object.fromEntries(entries) as Record<string, SortOrder>;
}
