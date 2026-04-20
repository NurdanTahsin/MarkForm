import { useMemo } from 'react';

import { useDailyCalorieTarget, useUserStore } from '../store/useUserStore';

type DashboardTheme = 'sageSoul' | 'lavenderDusk';

const DASHBOARD_THEMES: Record<
    DashboardTheme,
    {
        pageBg: string;
        cardBg: string;
        cardBorder: string;
        title: string;
        subtitle: string;
        accent: string;
        accentSoft: string;
        danger: string;
    }
> = {
    sageSoul: {
        pageBg: 'bg-gradient-to-br from-[#eef7f2] via-[#f7f4ec] to-[#fdf8f1]',
        cardBg: 'bg-white/85 backdrop-blur-sm',
        cardBorder: 'border-emerald-100',
        title: 'text-slate-800',
        subtitle: 'text-slate-600',
        accent: 'text-emerald-700',
        accentSoft: 'bg-emerald-50',
        danger: 'text-rose-500',
    },
    lavenderDusk: {
        pageBg: 'bg-gradient-to-br from-[#f5f0ff] via-[#f8f2fb] to-[#fff4f6]',
        cardBg: 'bg-white/90 backdrop-blur-sm',
        cardBorder: 'border-violet-100',
        title: 'text-slate-800',
        subtitle: 'text-slate-600',
        accent: 'text-violet-700',
        accentSoft: 'bg-violet-50',
        danger: 'text-rose-500',
    },
};

function getDayDifference(targetDateIso: string): number {
    const target = new Date(targetDateIso);
    if (Number.isNaN(target.getTime())) {
        return 0;
    }

    const now = new Date();
    const dayMs = 1000 * 60 * 60 * 24;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();

    return Math.max(0, Math.ceil((targetStart - today) / dayMs));
}

export default function Dashboard() {
    const stats = useUserStore((state) => state.stats);
    const goal = useUserStore((state) => state.goal);
    const logs = useUserStore((state) => state.logs);
    const clearAll = useUserStore((state) => state.clearAll);
    const target = useDailyCalorieTarget();

    const theme = DASHBOARD_THEMES.sageSoul;

    const userName = stats?.name?.trim() || 'kullanıcı';
    const dailyTarget = target?.intake ?? stats?.TDEE ?? 0;

    const todayIso = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    const currentCalories = useMemo(() => {
        return logs
            .filter((log) => log.date === todayIso)
            .reduce((sum, log) => sum + log.calories, 0);
    }, [logs, todayIso]);

    const progress = useMemo(() => {
        if (dailyTarget <= 0) {
            return 0;
        }
        return Math.min(100, Math.round((currentCalories / dailyTarget) * 100));
    }, [currentCalories, dailyTarget]);

    const remainingDays = goal ? getDayDifference(goal.targetDate) : 0;

    const cycleDay = useMemo(() => {
        if (!stats?.cycleTrackingEnabled || !stats.lastPeriodStartDate || !stats.averageCycleLength) {
            return null;
        }

        const start = new Date(stats.lastPeriodStartDate);
        if (Number.isNaN(start.getTime()) || stats.averageCycleLength <= 0) {
            return null;
        }

        const now = new Date();
        const dayMs = 1000 * 60 * 60 * 24;
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
        const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const passedDays = Math.max(0, Math.floor((nowDay - startDay) / dayMs));

        return (passedDays % stats.averageCycleLength) + 1;
    }, [stats]);

    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (progress / 100) * circumference;

    return (
        <main className={`min-h-screen p-4 sm:p-6 ${theme.pageBg}`}>
            <div className="mx-auto w-full max-w-5xl space-y-5">
                <header className={`rounded-3xl border p-5 sm:p-7 ${theme.cardBg} ${theme.cardBorder} shadow-sm`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className={`text-sm ${theme.subtitle}`}>Bugun formun nasil?</p>
                            <h1 className={`mt-1 text-2xl font-semibold sm:text-3xl ${theme.title}`}>Hos geldin {userName}</h1>
                        </div>
                        <button
                            type="button"
                            onClick={clearAll}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                            Verileri sil (gecici)
                        </button>
                    </div>
                </header>

                <section className="grid gap-5 lg:grid-cols-[minmax(280px,340px)_1fr]">
                    <article
                        className={`rounded-3xl border p-5 sm:p-6 ${theme.cardBg} ${theme.cardBorder} shadow-sm`}
                        aria-label="Daily calorie progress"
                    >
                        <h2 className={`text-sm font-semibold uppercase tracking-wide ${theme.subtitle}`}>
                            Gunluk Ilerleme
                        </h2>

                        <div className="mt-4 flex items-center justify-center">
                            <div className="relative h-44 w-44">
                                <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                                    <circle cx="80" cy="80" r={radius} fill="none" strokeWidth="12" className="stroke-slate-200" />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r={radius}
                                        fill="none"
                                        strokeWidth="12"
                                        className="stroke-emerald-600"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={dashOffset}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <p className={`text-3xl font-bold ${theme.accent}`}>{progress}%</p>
                                    <p className={`mt-1 text-xs ${theme.subtitle}`}>Tamamlandi</p>
                                </div>
                            </div>
                        </div>

                        <p className={`mt-4 text-center text-sm ${theme.subtitle}`}>
                            <span className={`font-semibold ${theme.title}`}>{Math.round(currentCalories)} kcal</span> /{' '}
                            <span className={`font-semibold ${theme.title}`}>{Math.round(dailyTarget)} kcal</span>
                        </p>
                    </article>

                    <article className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <div className={`rounded-2xl border p-4 ${theme.cardBg} ${theme.cardBorder} shadow-sm`}>
                            <p className={`text-xs uppercase tracking-wide ${theme.subtitle}`}>Mevcut Kilo</p>
                            <p className={`mt-2 text-2xl font-semibold ${theme.title}`}>
                                {stats?.currentWeight?.toFixed(1) ?? '--'} kg
                            </p>
                        </div>

                        <div className={`rounded-2xl border p-4 ${theme.cardBg} ${theme.cardBorder} shadow-sm`}>
                            <p className={`text-xs uppercase tracking-wide ${theme.subtitle}`}>Hedef Kilo</p>
                            <p className={`mt-2 text-2xl font-semibold ${theme.title}`}>
                                {goal?.targetWeight?.toFixed(1) ?? '--'} kg
                            </p>
                        </div>

                        <div className={`rounded-2xl border p-4 ${theme.cardBg} ${theme.cardBorder} shadow-sm sm:col-span-2 xl:col-span-1`}>
                            <p className={`text-xs uppercase tracking-wide ${theme.subtitle}`}>Kalan Gun</p>
                            <p className={`mt-2 text-2xl font-semibold ${theme.title}`}>{remainingDays}</p>
                        </div>

                        {cycleDay !== null && (
                            <div
                                className={`rounded-2xl border p-4 ${theme.accentSoft} ${theme.cardBorder} shadow-sm sm:col-span-2 xl:col-span-3`}
                            >
                                <p className={`text-xs uppercase tracking-wide ${theme.subtitle}`}>Dongu Durumu</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <svg className={`h-4 w-4 ${theme.danger}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M12 2c2.5 3.6 7 8.8 7 12.4A7 7 0 0 1 5 14.4C5 10.8 9.5 5.6 12 2Z" />
                                    </svg>
                                    <p className={`text-sm font-medium ${theme.title}`}>Bugun dongunun {cycleDay}. gunu</p>
                                </div>
                            </div>
                        )}
                    </article>
                </section>
            </div>
        </main>
    );
}
