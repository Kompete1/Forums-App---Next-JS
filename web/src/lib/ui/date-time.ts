const FORUM_TIMEZONE = "Africa/Johannesburg";

const forumDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: FORUM_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

type DateInput = string | Date;

function toDateParts(input: DateInput) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = forumDateTimeFormatter.formatToParts(date);
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      lookup[part.type] = part.value;
    }
  }

  const year = lookup.year ?? "";
  const month = lookup.month ?? "";
  const day = lookup.day ?? "";
  const hour = lookup.hour ?? "";
  const minute = lookup.minute ?? "";
  const second = lookup.second ?? "";

  if (!year || !month || !day || !hour || !minute || !second) {
    return null;
  }

  return { year, month, day, hour, minute, second };
}

export function formatForumDateTime(input: DateInput) {
  const parts = toDateParts(input);
  if (!parts) {
    return "";
  }

  return `${parts.year}/${parts.month}/${parts.day}, ${parts.hour}:${parts.minute}:${parts.second}`;
}

