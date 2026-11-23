// Somalia time is UTC+3 year-round. Never use the browser's local timezone.
export function deadlineInput(instant: string): string {
  const time = Date.parse(instant);
  return Number.isFinite(time) ? new Date(time + 3 * 3600000).toISOString().slice(0, 16) : "";
}
export function deadlineInstant(local: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local) || Number(local.slice(0, 4)) < 2000) return null;
  const time = Date.parse(`${local}:00+03:00`);
  if (!Number.isFinite(time)) return null;
  const instant = new Date(time).toISOString().replace(".000Z", "Z");
  return deadlineInput(instant) === local ? instant : null;
}
