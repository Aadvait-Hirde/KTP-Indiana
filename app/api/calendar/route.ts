import { NextResponse } from "next/server";
import {
  parseICS,
  expandRecurringEvents,
  type CalendarEvent,
} from "@/lib/ics-parser";

const ICS_URL =
  "https://calendar.google.com/calendar/ical/ktpindiana%40gmail.com/public/basic.ics";

// Cache the raw ICS data
let cachedIcsData: string | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchICSData(): Promise<string> {
  const now = Date.now();

  if (cachedIcsData && now - lastFetch < CACHE_DURATION) {
    return cachedIcsData;
  }

  const response = await fetch(ICS_URL, {
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ICS: ${response.statusText}`);
  }

  cachedIcsData = await response.text();
  lastFetch = now;

  return cachedIcsData;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: "Missing start or end parameters" },
        { status: 400 }
      );
    }

    const rangeStart = new Date(startParam);
    const rangeEnd = new Date(endParam);

    const icsData = await fetchICSData();
    const rawEvents = parseICS(icsData);
    const events = expandRecurringEvents(rawEvents, rangeStart, rangeEnd);

    // Convert dates to ISO strings for JSON serialization
    const serializedEvents = events.map((event) => ({
      ...event,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
    }));

    return NextResponse.json({ events: serializedEvents });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}
