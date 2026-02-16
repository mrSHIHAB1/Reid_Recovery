import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

type ParsedTruck = {
  ticket: string;
  date: Date;
  truckNo: string;
  yardage: number;
};

const parseDateLoose = (raw: string): Date | null => {
  // Try ISO-like, dd/mm/yyyy, mm/dd/yyyy, dd-mm-yyyy
  const cleaned = raw.trim();

  // First try native parse
  const d1 = new Date(cleaned);
  if (!isNaN(d1.getTime())) return d1;

  // dd/mm/yyyy or dd-mm-yyyy
  const m = cleaned.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (!m) return null;

  const dd = Number(m[1]);
  const mm = Number(m[2]);
  let yyyy = Number(m[3]);
  if (yyyy < 100) yyyy += 2000;

  // assume dd/mm/yyyy (common)
  const d2 = new Date(yyyy, mm - 1, dd);
  if (!isNaN(d2.getTime())) return d2;

  return null;
};

export const parseTruckFromOcrText = (text: string): ParsedTruck => {
  const t = text.replace(/\r/g, "").trim();

  // Examples (adjust to your ticket format):
  // Ticket: 12345   OR  Ticket No: 12345
  const ticketMatch =
    t.match(/ticket\s*(no|#)?\s*[:\-]?\s*([A-Z0-9\-]+)/i) ||
    t.match(/\bTICKET\b.*?\b([A-Z0-9\-]{3,})\b/i);

  const ticket = ticketMatch?.[2] || ticketMatch?.[1];
  if (!ticket) throw new AppError(httpStatus.BAD_REQUEST, "Ticket not found from image");

  // Truck No: DHA-1234 / TRK-001 / etc
  const truckMatch =
    t.match(/truck\s*(no|#)?\s*[:\-]?\s*([A-Z0-9\-]+)/i) ||
    t.match(/\bTRUCK\b.*?\b([A-Z0-9\-]{3,})\b/i);

  const truckNo = truckMatch?.[2] || truckMatch?.[1];
  if (!truckNo) throw new AppError(httpStatus.BAD_REQUEST, "Truck number not found from image");

  // Yardage: 12.5 or 12
  const yardMatch =
    t.match(/yard(age)?\s*[:\-]?\s*([0-9]+(\.[0-9]+)?)/i) ||
    t.match(/\bYD\b\s*[:\-]?\s*([0-9]+(\.[0-9]+)?)/i);

  const yardageStr = yardMatch?.[2] || yardMatch?.[1];
  const yardage = yardageStr ? Number(yardageStr) : NaN;
  if (!Number.isFinite(yardage)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Yardage not found from image");
  }

  // Date: try multiple patterns
  const dateMatch =
    t.match(/date\s*[:\-]?\s*([^\n]+)/i) ||
    t.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);

  const dateRaw = dateMatch?.[1]?.trim();
  const parsedDate = dateRaw ? parseDateLoose(dateRaw) : null;
  if (!parsedDate) throw new AppError(httpStatus.BAD_REQUEST, "Date not found from image");

  return {
    ticket: String(ticket).trim(),
    truckNo: String(truckNo).trim(),
    yardage,
    date: parsedDate,
  };
};
