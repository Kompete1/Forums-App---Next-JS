type LogMeta = Record<string, string | number | boolean | null | undefined>;

function redactSensitiveText(value: string) {
  return value
    .replace(/(access[_-]?token\s*[=:]\s*)([^\s"'`]+)/gi, "$1[REDACTED]")
    .replace(/(refresh[_-]?token\s*[=:]\s*)([^\s"'`]+)/gi, "$1[REDACTED]")
    .replace(/(authorization\s*[=:]\s*bearer\s+)([^\s"'`]+)/gi, "$1[REDACTED]")
    .replace(/(apikey\s*[=:]\s*)([^\s"'`]+)/gi, "$1[REDACTED]")
    .replace(/(token_hash\s*[=:]\s*)([^\s"'`]+)/gi, "$1[REDACTED]");
}

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return redactSensitiveText(error.message);
  }

  if (typeof error === "string") {
    return redactSensitiveText(error);
  }

  return "Unknown error";
}

export function logServerError(action: string, error: unknown, meta?: LogMeta) {
  const message = normalizeErrorMessage(error);
  const payload = {
    action,
    message: message.slice(0, 500),
    ...(error instanceof Error ? { name: error.name } : {}),
    ...(meta ?? {}),
  };

  if (process.env.NODE_ENV !== "production" && error instanceof Error && error.stack) {
    console.error("[server-error]", payload, redactSensitiveText(error.stack).slice(0, 1500));
    return;
  }

  console.error("[server-error]", payload);
}
