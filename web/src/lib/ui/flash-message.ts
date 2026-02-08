import { getWriteErrorMessage, isWriteErrorCode, type WriteErrorCode } from "@/lib/db/write-errors";

export type SearchParamRecord = Record<string, string | string[] | undefined>;

export function getSingleSearchParam(params: SearchParamRecord, key: string) {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

export function getWriteErrorMessageFromSearchParams(params: SearchParamRecord, key: string) {
  const rawCode = getSingleSearchParam(params, key);
  if (!isWriteErrorCode(rawCode)) {
    return null;
  }

  return getWriteErrorMessage(rawCode);
}

export function appendWriteErrorCode(pathname: string, key: string, code: WriteErrorCode) {
  const search = new URLSearchParams();
  search.set(key, code);
  return `${pathname}?${search.toString()}`;
}

export function appendQueryParams(pathname: string, params: Record<string, string | null | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}
