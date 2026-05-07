export function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(baseDate: Date, days: number): Date {
    const next = startOfDay(baseDate);
    next.setDate(next.getDate() + days);
    return next;
}

function daysInMonth(year: number, monthIndex: number): number {
    return new Date(year, monthIndex + 1, 0).getDate();
}

export function addMonthsKeepingDay(baseDate: Date, monthOffset: number): Date {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();
    const targetYear = year + Math.floor((month + monthOffset) / 12);
    const targetMonth = (month + monthOffset) % 12;
    const maxDay = daysInMonth(targetYear, targetMonth);
    return new Date(targetYear, targetMonth, Math.min(day, maxDay));
}

export function formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function formatMonthLabel(date: Date): string {
    return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
}

export function calculateSafeMonthOffset(today: Date, earliestSafeDate: Date): number {
    for (let i = 1; i <= 36; i += 1) {
        const candidate = addMonthsKeepingDay(today, i);
        if (startOfDay(candidate).getTime() >= startOfDay(earliestSafeDate).getTime()) {
            return i;
        }
    }
    return 36;
}

/** Parses an ISO date string (YYYY-MM-DD) into a local midnight Date — avoids UTC offset issues. */
export function toDateOnly(isoDate: string): Date {
    const [year, month, day] = isoDate.split('-').map((v) => Number(v));
    return new Date(year, month - 1, day);
}

/** Serialises a Date back to YYYY-MM-DD without UTC shifts. */
export function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** Returns a new Date shifted by `offsetDays` relative to `base`. */
export function shiftDate(base: Date, offsetDays: number): Date {
    const next = new Date(base);
    next.setDate(next.getDate() + offsetDays);
    return next;
}
