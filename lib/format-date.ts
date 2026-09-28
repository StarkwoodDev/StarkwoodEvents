export function formatEventDate(startDate?: string, endDate?: string): string {
  if (!startDate) return "Date to be confirmed";

  const format = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (!endDate || endDate === startDate) return format(startDate);

  return `${format(startDate)} – ${format(endDate)}`;
}
