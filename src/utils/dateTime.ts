export function getNowDateTimeLocalValue(date: Date = new Date()): string {
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

export function toDateTimeLocalValue(value?: string): string {
  if (!value) {
    return getNowDateTimeLocalValue();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00`;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return getNowDateTimeLocalValue();
  }

  return getNowDateTimeLocalValue(parsedDate);
}

export function formatThaiDateTime(value?: string): string {
  if (!value) return "-";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
