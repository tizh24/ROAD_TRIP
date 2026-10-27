import type { TripListItem } from "./trip-model.ts";

export type StatusFilter = "ALL" | TripListItem["status"];
export type SortOrder = "NEAREST" | "NEWEST";

/** Rows rendered per page; the list grows by this much per "Xem thêm". */
export const TRIP_PAGE_SIZE = 20;

const time = (date: string) => new Date(`${date}T00:00:00Z`).getTime();

/**
 * "Nearest" puts trips that are happening or still ahead first (soonest start first),
 * then finished trips (most recently ended first). Ties break on id so the order is stable.
 */
export function compareNearest(a: TripListItem, b: TripListItem, today: string): number {
  const aOpen = a.endDate >= today;
  const bOpen = b.endDate >= today;
  if (aOpen !== bOpen) return aOpen ? -1 : 1;
  const byDate = aOpen ? time(a.startDate) - time(b.startDate) : time(b.endDate) - time(a.endDate);
  return byDate || a.id.localeCompare(b.id);
}

export function compareNewest(a: TripListItem, b: TripListItem): number {
  return time(b.startDate) - time(a.startDate) || a.id.localeCompare(b.id);
}

export function countByStatus(trips: readonly TripListItem[], status: StatusFilter): number {
  return status === "ALL" ? trips.length : trips.filter((trip) => trip.status === status).length;
}

export function selectTrips(
  trips: readonly TripListItem[],
  options: { status: StatusFilter; query: string; sort: SortOrder; today: string },
): TripListItem[] {
  const query = options.query.trim().toLowerCase();
  return trips
    .filter((trip) => options.status === "ALL" || trip.status === options.status)
    .filter((trip) => !query || trip.title.toLowerCase().includes(query))
    .sort((a, b) => (options.sort === "NEAREST" ? compareNearest(a, b, options.today) : compareNewest(a, b)));
}

export function todayIso(now: Date = new Date()): string {
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}
