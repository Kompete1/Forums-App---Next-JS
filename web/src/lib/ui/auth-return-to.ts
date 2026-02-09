type ParamValue = string | string[] | undefined;

function firstParam(value: ParamValue) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function getSafeInternalPath(value: string | null | undefined) {
  const candidate = (value ?? "").trim();

  if (!candidate) {
    return null;
  }

  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return null;
  }

  return candidate;
}

export function getSafeReturnToPath(params: { returnTo?: ParamValue; next?: ParamValue }) {
  const returnToValue = getSafeInternalPath(firstParam(params.returnTo));
  if (returnToValue) {
    return returnToValue;
  }

  const nextValue = getSafeInternalPath(firstParam(params.next));
  if (nextValue) {
    return nextValue;
  }

  return null;
}
