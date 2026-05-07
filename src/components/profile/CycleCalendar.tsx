import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import type { DashTheme } from '../../constants/themes';

interface Props {
    theme: DashTheme;
    lastPeriodDate: string; // 'YYYY-MM-DD'
    cycleLength: number;    // default 28
    periodLength: number;   // default 6
    language: 'tr' | 'en';
}

interface PhaseInfo {
    name: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    days: string; // e.g. "1-5"
}

function computePhaseForDay(
    dayOfCycle: number, // 1-based
    cycleLength: number,
    periodLength: number
): 'menstrual' | 'follicular' | 'ovulation' | 'luteal' {
    // Menstrual
    if (dayOfCycle <= periodLength) return 'menstrual';
    // Ovulasyon penceresi: ~gün 12-17 (28 günlük döngü için)
    const ovStart = Math.round(cycleLength / 2) - 2;
    const ovEnd = Math.round(cycleLength / 2) + 2;
    if (dayOfCycle >= ovStart && dayOfCycle <= ovEnd) return 'ovulation';
    // Foliküler: 6 → ovStart-1
    if (dayOfCycle < ovStart) return 'follicular';
    // Luteal: ovEnd+1 → cycleLength
    return 'luteal';
}

const PHASE_META = {
    menstrual: {
        tr: 'Adet', en: 'Menstrual',
        dot: 'bg-rose-500', bg: 'bg-rose-50', border: 'border-rose-200',
        text: 'text-rose-600', darkDot: 'bg-rose-400', darkBg: 'bg-rose-500/15', darkBorder: 'border-rose-500/30', darkText: 'text-rose-300',
    },
    follicular: {
        tr: 'Foliküler', en: 'Follicular',
        dot: 'bg-amber-400', bg: 'bg-amber-50', border: 'border-amber-200',
        text: 'text-amber-600', darkDot: 'bg-amber-400', darkBg: 'bg-amber-500/15', darkBorder: 'border-amber-500/30', darkText: 'text-amber-300',
    },
    ovulation: {
        tr: 'Ovulasyon', en: 'Ovulation',
        dot: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200',
        text: 'text-emerald-600', darkDot: 'bg-emerald-400', darkBg: 'bg-emerald-500/15', darkBorder: 'border-emerald-500/30', darkText: 'text-emerald-300',
    },
    luteal: {
        tr: 'Luteal', en: 'Luteal',
        dot: 'bg-violet-500', bg: 'bg-violet-50', border: 'border-violet-200',
        text: 'text-violet-600', darkDot: 'bg-violet-400', darkBg: 'bg-violet-500/15', darkBorder: 'border-violet-500/30', darkText: 'text-violet-300',
    },
} as const;

type PhaseName = keyof typeof PHASE_META;

export function CycleCalendar({ theme: T, lastPeriodDate, cycleLength, periodLength, language }: Props) {
    const [open, setOpen] = useState(false);
    const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
    const isDark = T.title === 'text-slate-50';
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);

    const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

    // Parse last period start
    const periodStart = useMemo(() => {
        if (!lastPeriodDate) return null;
        const d = new Date(lastPeriodDate + 'T00:00:00');
        if (isNaN(d.getTime())) return null;
        return d;
    }, [lastPeriodDate]);

    // Get phase for a given date
    const getPhase = (date: Date): PhaseName | null => {
        if (!periodStart) return null;
        const diffMs = date.getTime() - periodStart.getTime();
        const diffDays = Math.floor(diffMs / 86400000);
        // Handle multiple cycles forward/back
        const cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength + 1; // 1-based
        return computePhaseForDay(cycleDay, cycleLength, periodLength);
    };

    // Build calendar for displayed month
    const { year, month, days } = useMemo(() => {
        const ref = new Date(today);
        ref.setDate(1);
        ref.setMonth(ref.getMonth() + monthOffset);
        const y = ref.getFullYear();
        const m = ref.getMonth();
        const firstDow = new Date(y, m, 1).getDay(); // 0=Sun
        // Shift so Monday=0
        const startPad = (firstDow + 6) % 7;
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        return { year: y, month: m, days: { startPad, count: daysInMonth } };
    }, [monthOffset, today]);

    const monthName = useMemo(() => {
        return new Date(year, month, 1).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', year: 'numeric' });
    }, [year, month, language]);

    const weekdays = language === 'tr'
        ? ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']
        : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    const legend: { key: PhaseName; label: string }[] = [
        { key: 'menstrual', label: t('Adet', 'Menstrual') },
        { key: 'follicular', label: t('Foliküler', 'Follicular') },
        { key: 'ovulation', label: t('Ovulasyon', 'Ovulation') },
        { key: 'luteal', label: t('Luteal', 'Luteal') },
    ];

    return (
        <div className={`rounded-2xl border overflow-hidden ${T.cardBorder} ${T.cardBg}`}>
            {/* Toggle header */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 ${T.mutedSurface}`}
            >
                <span className={`text-sm font-semibold ${T.title}`}>
                    🌸 {t('Adet Takvimi', 'Cycle Calendar')}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${T.subtitle} ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="px-4 pb-4 pt-2 space-y-3">
                    {/* Legend */}
                    <div className="flex flex-wrap gap-2">
                        {legend.map(({ key, label }) => {
                            const m = PHASE_META[key];
                            return (
                                <span key={key}
                                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${isDark ? `${m.darkBg} ${m.darkBorder} ${m.darkText}` : `${m.bg} ${m.border} ${m.text}`}`}>
                                    <span className={`h-2 w-2 rounded-full ${isDark ? m.darkDot : m.dot}`} />
                                    {label}
                                </span>
                            );
                        })}
                    </div>

                    {/* Month nav */}
                    <div className="flex items-center justify-between">
                        <button type="button" onClick={() => setMonthOffset((o) => o - 1)}
                            className={`grid h-7 w-7 place-items-center rounded-full ${T.mutedSurface} ${T.subtitle}`}>
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className={`text-xs font-semibold capitalize ${T.title}`}>{monthName}</span>
                        <button type="button" onClick={() => setMonthOffset((o) => o + 1)}
                            className={`grid h-7 w-7 place-items-center rounded-full ${T.mutedSurface} ${T.subtitle}`}>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {weekdays.map((d) => (
                            <div key={d} className={`text-center text-[10px] font-semibold py-1 ${T.subtitle}`}>{d}</div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {/* Empty cells for padding */}
                        {Array.from({ length: days.startPad }).map((_, i) => (
                            <div key={`pad-${i}`} />
                        ))}
                        {/* Day cells */}
                        {Array.from({ length: days.count }).map((_, i) => {
                            const dayNum = i + 1;
                            const date = new Date(year, month, dayNum);
                            const phase = getPhase(date);
                            const isToday = date.toDateString() === today.toDateString();
                            const meta = phase ? PHASE_META[phase] : null;

                            return (
                                <div key={dayNum}
                                    className={[
                                        'flex flex-col items-center justify-center rounded-lg py-1 text-[11px] font-semibold min-h-[32px] relative',
                                        meta
                                            ? isDark
                                                ? `${meta.darkBg} ${meta.darkText} ${phase !== 'menstrual' ? 'opacity-80' : ''}`
                                                : `${meta.bg} ${meta.text} ${phase !== 'menstrual' ? 'bg-opacity-50' : ''}`
                                            : isDark ? 'text-slate-400' : 'text-slate-500',
                                        isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : '',
                                    ].join(' ')}
                                >
                                    {dayNum}
                                    {meta && phase === 'menstrual' && (
                                        <span className={`absolute bottom-0.5 h-1 w-1 rounded-full ${isDark ? meta.darkDot : meta.dot}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {!periodStart && (
                        <p className={`text-xs text-center italic ${T.subtitle}`}>
                            {t('Son adet tarihini gir', 'Enter your last period date')}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
