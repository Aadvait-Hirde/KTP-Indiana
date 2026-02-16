"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import useSWR from "swr";

interface CalendarEvent {
  uid: string;
  summary: string;
  description: string;
  location: string;
  start: string;
  end: string;
  isAllDay: boolean;
  recurrence?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateRange(
  start: string,
  end: string,
  isAllDay: boolean
): string {
  const startDate = new Date(start);
  //   const endDate = new Date(end);

  if (isAllDay) {
    return startDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  const startFormatted = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const startTime = formatTime(start);
  const endTime = formatTime(end);

  return `${startFormatted} · ${startTime} - ${endTime}`;
}

function EventPopover({ event }: { event: CalendarEvent }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-base text-foreground">
          {event.summary}
        </h3>
      </div>

      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <CalendarIcon className="size-4 mt-0.5 shrink-0" />
        <span>{formatDateRange(event.start, event.end, event.isAllDay)}</span>
      </div>

      {event.location && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 mt-0.5 shrink-0" />
          <span>{event.location}</span>
        </div>
      )}

      {event.recurrence && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Repeat className="size-4 mt-0.5 shrink-0" />
          <span>Recurring event</span>
        </div>
      )}

      {event.description && (
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {event.description}
          </p>
        </div>
      )}
    </div>
  );
}

function EventItem({ event }: { event: CalendarEvent }) {
  const startTime = event.isAllDay ? null : formatTime(event.start);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full text-left px-1.5 py-0.5 rounded text-xs truncate",
            "bg-sky-500 text-white hover:bg-sky-600 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
          )}
        >
          {startTime && <span className=" font-bold">{startTime} </span>}
          <span>{event.summary}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <EventPopover event={event} />
      </PopoverContent>
    </Popover>
  );
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get the starting day of the week (0 = Sunday)
  const startDayOfWeek = firstDay.getDay();

  // Add days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = new Date(year, month, -i);
    days.push(day);
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add days from next month to complete the grid (6 rows)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, day);
    })
    .sort((a, b) => {
      // Sort all-day events first, then by time
      if (a.isAllDay && !b.isAllDay) return -1;
      if (!a.isAllDay && b.isAllDay) return 1;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
}

export function GoogleCalendar({ className }: { className?: string }) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [useListView, setUseListView] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate the range for fetching events (include surrounding months for overlap)
  const rangeStart = new Date(year, month - 1, 1);
  const rangeEnd = new Date(year, month + 2, 0);

  const { data, error, isLoading } = useSWR<{ events: CalendarEvent[] }>(
    `/api/calendar?start=${rangeStart.toISOString()}&end=${rangeEnd.toISOString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const events = data?.events || [];
  const days = getDaysInMonth(year, month);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const upcomingEvents = React.useMemo(() => {
    const now = new Date();
    return events
      .filter((event) => new Date(event.end).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5);
  }, [events]);

  const groupedUpcomingEvents = React.useMemo(() => {
    const grouped: { date: Date; items: CalendarEvent[] }[] = [];
    for (const event of upcomingEvents) {
      const eventDate = new Date(event.start);
      const last = grouped[grouped.length - 1];
      if (!last || !isSameDay(last.date, eventDate)) {
        grouped.push({ date: eventDate, items: [event] });
      } else {
        last.items.push(event);
      }
    }
    return grouped;
  }, [upcomingEvents]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthYearLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  React.useEffect(() => {
    if (!containerRef.current) return;

    const MIN_COLUMN_WIDTH = 120;
    const updateViewMode = (width: number) => {
      const columnWidth = width / 7;
      setUseListView(columnWidth < MIN_COLUMN_WIDTH);
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateViewMode(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    updateViewMode(containerRef.current.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={cn("w-full h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold text-foreground">
          {monthYearLabel}
        </h2>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="size-4" />
              <span className="sr-only">Previous month</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="size-4" />
              <span className="sr-only">Next month</span>
            </Button>
          </div>
        </div>
        {isLoading && (
          <div className="text-sm text-muted-foreground">Loading events...</div>
        )}
        {error && (
          <div className="text-sm text-destructive">Failed to load events</div>
        )}
      </div>

      {/* List View (auto) */}
      {useListView && (
        <div className="p-2">
        {isLoading && (
          <div className="text-sm text-muted-foreground px-2 py-4">
            Loading events...
          </div>
        )}
        {!isLoading && groupedUpcomingEvents.length === 0 && (
          <div className="text-sm text-muted-foreground px-2 py-4">
            No upcoming events.
          </div>
        )}
        <div className="space-y-4">
          {groupedUpcomingEvents.map((group) => (
            <div key={group.date.toISOString()} className="space-y-2">
              <div className="text-sm font-semibold text-foreground px-2">
                {group.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="space-y-2">
                {group.items.map((event) => (
                  <Popover key={event.uid}>
                    <PopoverTrigger asChild>
                      <button className="w-full text-left rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="font-medium text-sm text-foreground">
                              {event.summary}
                            </div>
                            {!event.isAllDay && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="size-3" />
                                {formatTime(event.start)} -{" "}
                                {formatTime(event.end)}
                              </div>
                            )}
                            {event.isAllDay && (
                              <div className="text-xs text-muted-foreground">
                                All day
                              </div>
                            )}
                            {event.location && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="size-3" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start">
                      <EventPopover event={event} />
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Calendar Grid (auto) */}
      {!useListView && (
        <div className="p-2">
        {/* Week day headers */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === month;
            const isToday = isSameDay(day, today);
            const dayEvents = getEventsForDay(events, day);
            const maxVisibleEvents = 5;
            const hasMore = dayEvents.length > maxVisibleEvents;

            return (
              <div
                key={index}
                className={cn(
                  "min-h-25 bg-card p-1 transition-colors",
                  !isCurrentMonth && "bg-muted/30"
                )}
              >
                <div className="flex justify-end mb-1">
                  <span
                    className={cn(
                      "text-sm w-7 h-7 flex items-center justify-center rounded-full",
                      isToday && "bg-sky-500 text-white font-semibold",
                      !isToday && isCurrentMonth && "text-foreground",
                      !isToday && !isCurrentMonth && "text-muted-foreground"
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {dayEvents.slice(0, maxVisibleEvents).map((event) => (
                    <EventItem key={event.uid} event={event} />
                  ))}

                  {hasMore && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted rounded transition-colors">
                          +{dayEvents.length - maxVisibleEvents} more
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-80 max-h-96 overflow-y-auto"
                        align="start"
                      >
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">
                            {day.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </h4>
                          <div className="space-y-1">
                            {dayEvents.map((event) => (
                              <div
                                key={event.uid}
                                className="p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
                              >
                                <div className="font-medium text-sm">
                                  {event.summary}
                                </div>
                                {!event.isAllDay && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Clock className="size-3" />
                                    {formatTime(event.start)} -{" "}
                                    {formatTime(event.end)}
                                  </div>
                                )}
                                {event.location && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="size-3" />
                                    {event.location}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
