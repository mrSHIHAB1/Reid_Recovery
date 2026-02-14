export function generateTrackingId() {
  const date = new Date();

  // Format date as YYYYMMDD
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const dateString = `${year}${month}${day}`;

  // Generate a 6-digit random number (000001 to 999999)
  const randomPart = Math.floor(Math.random() * 999999 + 1).toString().padStart(6, '0');

  return `TRK-${dateString}-${randomPart}`;
}
