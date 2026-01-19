export interface CalendarEvent {
  uid: string;
  summary: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  recurrence?: string;
}

interface RawEvent {
  uid: string;
  summary: string;
  description: string;
  location: string;
  dtstart: string;
  dtend: string;
  rrule?: string;
}

function parseICSDate(dateStr: string): { date: Date; isAllDay: boolean } {
  if (!dateStr) return { date: new Date(), isAllDay: false };

  // Remove any VALUE=DATE: prefix
  const cleanStr = dateStr
    .replace(/^VALUE=DATE:?/i, "")
    .replace(/^TZID=[^:]+:/i, "");

  // Check if it's an all-day event (YYYYMMDD format without time)
  if (/^\d{8}$/.test(cleanStr)) {
    const year = parseInt(cleanStr.slice(0, 4));
    const month = parseInt(cleanStr.slice(4, 6)) - 1;
    const day = parseInt(cleanStr.slice(6, 8));
    return { date: new Date(year, month, day), isAllDay: true };
  }

  // Parse datetime format (YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ)
  const match = cleanStr.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/
  );
  if (match) {
    const [, year, month, day, hour, minute, second, isUTC] = match;
    if (isUTC) {
      return {
        date: new Date(
          Date.UTC(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
          )
        ),
        isAllDay: false,
      };
    }
    return {
      date: new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      ),
      isAllDay: false,
    };
  }

  return { date: new Date(dateStr), isAllDay: false };
}

function unfoldLines(icsText: string): string {
  // ICS files use line folding - lines starting with space/tab are continuations
  return icsText
    .replace(/\r\n[ \t]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function unescapeValue(value: string): string {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

export function parseICS(icsText: string): RawEvent[] {
  const events: RawEvent[] = [];
  const unfolded = unfoldLines(icsText);
  const lines = unfolded.split("\n");

  let currentEvent: Partial<RawEvent> | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === "BEGIN:VEVENT") {
      currentEvent = {};
      continue;
    }

    if (trimmedLine === "END:VEVENT" && currentEvent) {
      if (currentEvent.uid && currentEvent.dtstart) {
        events.push({
          uid: currentEvent.uid,
          summary: currentEvent.summary || "Untitled Event",
          description: currentEvent.description || "",
          location: currentEvent.location || "",
          dtstart: currentEvent.dtstart,
          dtend: currentEvent.dtend || currentEvent.dtstart,
          rrule: currentEvent.rrule,
        });
      }
      currentEvent = null;
      continue;
    }

    if (!currentEvent) continue;

    // Parse property:value or property;params:value
    const colonIndex = trimmedLine.indexOf(":");
    if (colonIndex === -1) continue;

    const propertyPart = trimmedLine.slice(0, colonIndex);
    const value = unescapeValue(trimmedLine.slice(colonIndex + 1));

    // Extract property name (before any ; parameters)
    const semicolonIndex = propertyPart.indexOf(";");
    const propertyName =
      semicolonIndex === -1
        ? propertyPart.toUpperCase()
        : propertyPart.slice(0, semicolonIndex).toUpperCase();

    // Check for VALUE=DATE parameter
    const hasDateValue = propertyPart.toUpperCase().includes("VALUE=DATE");

    switch (propertyName) {
      case "UID":
        currentEvent.uid = value;
        break;
      case "SUMMARY":
        currentEvent.summary = value;
        break;
      case "DESCRIPTION":
        currentEvent.description = value;
        break;
      case "LOCATION":
        currentEvent.location = value;
        break;
      case "DTSTART":
        currentEvent.dtstart = hasDateValue ? `VALUE=DATE:${value}` : value;
        break;
      case "DTEND":
        currentEvent.dtend = hasDateValue ? `VALUE=DATE:${value}` : value;
        break;
      case "RRULE":
        currentEvent.rrule = value;
        break;
    }
  }

  return events;
}

interface RRuleOptions {
  freq: string;
  interval: number;
  until?: Date;
  count?: number;
  byday?: string[];
  bymonth?: number[];
  bymonthday?: number[];
  wkst?: string;
}

function parseRRule(rrule: string): RRuleOptions {
  const options: RRuleOptions = {
    freq: "DAILY",
    interval: 1,
  };

  const parts = rrule.split(";");
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (!value) continue;

    switch (key.toUpperCase()) {
      case "FREQ":
        options.freq = value.toUpperCase();
        break;
      case "INTERVAL":
        options.interval = parseInt(value) || 1;
        break;
      case "UNTIL":
        options.until = parseICSDate(value).date;
        break;
      case "COUNT":
        options.count = parseInt(value);
        break;
      case "BYDAY":
        options.byday = value.split(",");
        break;
      case "BYMONTH":
        options.bymonth = value.split(",").map((v) => parseInt(v));
        break;
      case "BYMONTHDAY":
        options.bymonthday = value.split(",").map((v) => parseInt(v));
        break;
      case "WKST":
        options.wkst = value;
        break;
    }
  }

  return options;
}

const dayMap: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

function getNextOccurrence(
  currentDate: Date,
  options: RRuleOptions,
  startDate: Date
): Date | null {
  const next = new Date(currentDate);

  switch (options.freq) {
    case "DAILY":
      next.setDate(next.getDate() + options.interval);
      break;
    case "WEEKLY":
      if (options.byday && options.byday.length > 0) {
        // Find next matching day
        let found = false;
        for (let i = 1; i <= 7 * options.interval; i++) {
          const testDate = new Date(currentDate);
          testDate.setDate(testDate.getDate() + i);
          const dayAbbr = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][
            testDate.getDay()
          ];
          if (options.byday.includes(dayAbbr)) {
            next.setTime(testDate.getTime());
            found = true;
            break;
          }
        }
        if (!found) {
          next.setDate(next.getDate() + 7 * options.interval);
        }
      } else {
        next.setDate(next.getDate() + 7 * options.interval);
      }
      break;
    case "MONTHLY":
      if (options.bymonthday && options.bymonthday.length > 0) {
        next.setMonth(next.getMonth() + options.interval);
        next.setDate(options.bymonthday[0]);
      } else if (options.byday && options.byday.length > 0) {
        // Handle BYDAY with ordinal (e.g., 2MO = second Monday)
        const byday = options.byday[0];
        const ordinalMatch = byday.match(/^(-?\d)?([A-Z]{2})$/);
        if (ordinalMatch) {
          const ordinal = ordinalMatch[1] ? parseInt(ordinalMatch[1]) : 1;
          const dayCode = ordinalMatch[2];
          const targetDay = dayMap[dayCode];

          next.setMonth(next.getMonth() + options.interval);
          next.setDate(1);

          if (ordinal > 0) {
            // Find nth occurrence
            let count = 0;
            while (count < ordinal) {
              if (next.getDay() === targetDay) count++;
              if (count < ordinal) next.setDate(next.getDate() + 1);
            }
          } else {
            // Find last occurrence
            next.setMonth(next.getMonth() + 1);
            next.setDate(0); // Last day of previous month
            while (next.getDay() !== targetDay) {
              next.setDate(next.getDate() - 1);
            }
          }
        }
      } else {
        next.setMonth(next.getMonth() + options.interval);
      }
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + options.interval);
      break;
  }

  return next;
}

export function expandRecurringEvents(
  rawEvents: RawEvent[],
  rangeStart: Date,
  rangeEnd: Date
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const raw of rawEvents) {
    const { date: startDate, isAllDay } = parseICSDate(raw.dtstart);
    const { date: endDate } = parseICSDate(raw.dtend);
    const duration = endDate.getTime() - startDate.getTime();

    if (!raw.rrule) {
      // Non-recurring event
      if (startDate >= rangeStart && startDate <= rangeEnd) {
        events.push({
          uid: raw.uid,
          summary: raw.summary,
          description: raw.description,
          location: raw.location,
          start: startDate,
          end: endDate,
          isAllDay,
        });
      }
    } else {
      // Recurring event
      const options = parseRRule(raw.rrule);
      let occurrenceCount = 0;
      let currentDate = new Date(startDate);

      // Limit iterations to prevent infinite loops
      const maxIterations = 1000;
      let iterations = 0;

      while (iterations < maxIterations) {
        iterations++;

        // Check if we've passed the range end or hit the UNTIL date
        if (options.until && currentDate > options.until) break;
        if (options.count && occurrenceCount >= options.count) break;
        if (currentDate > rangeEnd) break;

        // Add event if it's within our range
        if (currentDate >= rangeStart && currentDate <= rangeEnd) {
          const eventEnd = new Date(currentDate.getTime() + duration);
          events.push({
            uid: `${raw.uid}_${currentDate.getTime()}`,
            summary: raw.summary,
            description: raw.description,
            location: raw.location,
            start: new Date(currentDate),
            end: eventEnd,
            isAllDay,
            recurrence: raw.rrule,
          });
        }

        occurrenceCount++;

        // Get next occurrence
        const nextDate = getNextOccurrence(currentDate, options, startDate);
        if (!nextDate || nextDate.getTime() === currentDate.getTime()) break;
        currentDate = nextDate;
      }
    }
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}
