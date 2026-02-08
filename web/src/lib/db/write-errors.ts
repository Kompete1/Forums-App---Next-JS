export type WriteErrorCode =
  | "THREAD_COOLDOWN"
  | "REPLY_COOLDOWN"
  | "REPORT_COOLDOWN"
  | "REPORT_BURST_LIMIT"
  | "UNKNOWN_WRITE_ERROR";

export type NormalizedWriteError = {
  code: WriteErrorCode;
  message: string;
};

const CODE_MESSAGE_MAP: Record<WriteErrorCode, string> = {
  THREAD_COOLDOWN: "You're posting threads too quickly. Please wait about 60 seconds and try again.",
  REPLY_COOLDOWN: "You're replying too quickly. Please wait about 20 seconds and try again.",
  REPORT_COOLDOWN: "You're reporting too quickly. Please wait about 30 seconds and try again.",
  REPORT_BURST_LIMIT: "You reached the report limit (10 reports per 15 minutes). Please try again later.",
  UNKNOWN_WRITE_ERROR: "Could not complete this action. Please try again.",
};

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

function getErrorCode(error: unknown): WriteErrorCode | null {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string" && isWriteErrorCode(error.code)) {
    return error.code;
  }

  return null;
}

function toWriteErrorCode(message: string): WriteErrorCode {
  if (message.includes("RATE_LIMIT_THREAD_COOLDOWN")) {
    return "THREAD_COOLDOWN";
  }

  if (message.includes("RATE_LIMIT_REPLY_COOLDOWN")) {
    return "REPLY_COOLDOWN";
  }

  if (message.includes("RATE_LIMIT_REPORT_COOLDOWN")) {
    return "REPORT_COOLDOWN";
  }

  if (message.includes("RATE_LIMIT_REPORT_BURST")) {
    return "REPORT_BURST_LIMIT";
  }

  return "UNKNOWN_WRITE_ERROR";
}

export function isWriteErrorCode(value: string): value is WriteErrorCode {
  return value in CODE_MESSAGE_MAP;
}

export function getWriteErrorMessage(code: WriteErrorCode) {
  return CODE_MESSAGE_MAP[code];
}

export class WriteActionError extends Error {
  code: WriteErrorCode;

  constructor(code: WriteErrorCode, message?: string) {
    super(message ?? getWriteErrorMessage(code));
    this.name = "WriteActionError";
    this.code = code;
  }
}

export function normalizeWriteError(error: unknown): NormalizedWriteError {
  const code = getErrorCode(error) ?? toWriteErrorCode(getErrorMessage(error));
  return {
    code,
    message: getWriteErrorMessage(code),
  };
}

export function toWriteActionError(error: unknown) {
  const normalized = normalizeWriteError(error);
  return new WriteActionError(normalized.code, normalized.message);
}
