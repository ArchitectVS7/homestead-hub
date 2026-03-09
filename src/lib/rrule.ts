/**
 * RRULE Parser for Task Recurrence
 * 
 * Parses iCal RRULE format strings and calculates next occurrence dates.
 * Supports common recurrence patterns: daily, weekly, monthly, yearly.
 * 
 * Example RRULE formats:
 * - FREQ=DAILY;INTERVAL=1 - Every day
 * - FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR - Every Mon, Wed, Fri
 * - FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=15 - 15th of every month
 * - FREQ=YEARLY;INTERVAL=1;BYMONTH=3 - Every March
 */

export interface ParsedRRule {
    freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    interval: number;
    byDay?: string[];      // MO, TU, WE, TH, FR, SA, SU
    byMonthDay?: number[]; // Day of month (1-31)
    byMonth?: number[];    // Month (1-12)
    count?: number;        // Total occurrences
    until?: Date;          // End date
}

/**
 * Parse RRULE string into structured object
 */
export function parseRRule(rrule: string): ParsedRRule | null {
    if (!rrule) return null;

    const result: ParsedRRule = {
        freq: "DAILY",
        interval: 1,
    };

    // Parse FREQ
    const freqMatch = rrule.match(/FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)/);
    if (freqMatch) {
        result.freq = freqMatch[1] as ParsedRRule["freq"];
    }

    // Parse INTERVAL
    const intervalMatch = rrule.match(/INTERVAL=(\d+)/);
    if (intervalMatch) {
        result.interval = parseInt(intervalMatch[1], 10);
    }

    // Parse BYDAY
    const byDayMatch = rrule.match(/BYDAY=([A-Z,]+)/);
    if (byDayMatch) {
        result.byDay = byDayMatch[1].split(",");
    }

    // Parse BYMONTHDAY
    const byMonthDayMatch = rrule.match(/BYMONTHDAY=(\d+)/);
    if (byMonthDayMatch) {
        result.byMonthDay = [parseInt(byMonthDayMatch[1], 10)];
    }

    // Parse BYMONTH
    const byMonthMatch = rrule.match(/BYMONTH=(\d+)/);
    if (byMonthMatch) {
        result.byMonth = [parseInt(byMonthMatch[1], 10)];
    }

    // Parse COUNT
    const countMatch = rrule.match(/COUNT=(\d+)/);
    if (countMatch) {
        result.count = parseInt(countMatch[1], 10);
    }

    // Parse UNTIL
    const untilMatch = rrule.match(/UNTIL=(\d{8}T\d{6}Z?)/);
    if (untilMatch) {
        result.until = new Date(untilMatch[1]);
    }

    return result;
}

/**
 * Calculate next occurrence date from RRULE
 */
export function getNextOccurrence(rrule: string, fromDate: Date = new Date()): Date | null {
    const parsed = parseRRule(rrule);
    if (!parsed) return null;

    const result = new Date(fromDate);

    switch (parsed.freq) {
        case "DAILY":
            result.setDate(result.getDate() + parsed.interval);
            break;

        case "WEEKLY":
            if (parsed.byDay && parsed.byDay.length > 0) {
                // Find next matching day of week
                const dayMap: Record<string, number> = {
                    MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6, SU: 0,
                };
                const currentDay = result.getDay();
                let daysToAdd = 7; // Default to next week

                for (const day of parsed.byDay) {
                    const targetDay = dayMap[day] ?? 0;
                    let diff = targetDay - currentDay;
                    if (diff <= 0) diff += 7;
                    if (diff < daysToAdd) daysToAdd = diff;
                }

                result.setDate(result.getDate() + daysToAdd);
            } else {
                // No specific days - add weeks
                result.setDate(result.getDate() + (7 * parsed.interval));
            }
            break;

        case "MONTHLY":
            if (parsed.byMonthDay && parsed.byMonthDay.length > 0) {
                const targetDay = parsed.byMonthDay[0];
                const currentMonth = result.getMonth();
                result.setDate(targetDay);
                // If we've passed this day already or date didn't change, move to next month
                if (result <= fromDate || result.getMonth() !== currentMonth) {
                    result.setMonth(result.getMonth() + parsed.interval);
                }
            } else {
                result.setMonth(result.getMonth() + parsed.interval);
            }
            break;

        case "YEARLY":
            if (parsed.byMonth && parsed.byMonth.length > 0) {
                result.setMonth(parsed.byMonth[0] - 1); // JS months are 0-indexed
                if (result <= fromDate) {
                    result.setFullYear(result.getFullYear() + parsed.interval);
                }
            } else {
                result.setFullYear(result.getFullYear() + parsed.interval);
            }
            break;
    }

    // Check UNTIL limit
    if (parsed.until && result > parsed.until) {
        return null;
    }

    return result;
}

/**
 * Get human-readable description of RRULE
 */
export function getRRuleDescription(rrule: string): string {
    const parsed = parseRRule(rrule);
    if (!parsed) return "No recurrence";

    const freqDescriptions: Record<string, string> = {
        DAILY: "day",
        WEEKLY: "week",
        MONTHLY: "month",
        YEARLY: "year",
    };

    let desc = `Every ${parsed.interval} ${freqDescriptions[parsed.freq]}`;

    if (parsed.byDay) {
        const dayNames: Record<string, string> = {
            MO: "Monday", TU: "Tuesday", WE: "Wednesday",
            TH: "Thursday", FR: "Friday", SA: "Saturday", SU: "Sunday",
        };
        desc += ` on ${parsed.byDay.map(d => dayNames[d] || d).join(", ")}`;
    }

    if (parsed.byMonthDay) {
        const ordinal = (n: number) => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        desc += ` on the ${ordinal(parsed.byMonthDay[0])}`;
    }

    if (parsed.byMonth) {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ];
        desc += ` in ${monthNames[parsed.byMonth[0] - 1]}`;
    }

    if (parsed.count) {
        desc += ` (${parsed.count} times)`;
    }

    if (parsed.until) {
        desc += ` (until ${parsed.until.toLocaleDateString()})`;
    }

    return desc;
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(nextDue: Date | null): boolean {
    if (!nextDue) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(nextDue);
    due.setHours(0, 0, 0, 0);
    return due < now;
}

/**
 * Check if a task is due today
 */
export function isTaskDueToday(nextDue: Date | null): boolean {
    if (!nextDue) return false;
    const now = new Date();
    const due = new Date(nextDue);
    return (
        due.getDate() === now.getDate() &&
        due.getMonth() === now.getMonth() &&
        due.getFullYear() === now.getFullYear()
    );
}

/**
 * Check if a task is due this week
 */
export function isTaskDueThisWeek(nextDue: Date | null): boolean {
    if (!nextDue) return false;
    const now = new Date();
    const due = new Date(nextDue);
    
    // Get start of week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get end of week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return due >= startOfWeek && due <= endOfWeek;
}
