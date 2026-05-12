import { useActiveTheme, useUserStore } from '../../../store/useUserStore';
import { useTranslate } from '../../../hooks/useTranslate';
import { formatWater } from '../../../constants/dashboardConstants';
import { HistoryDayCard } from './HistoryDayCard';
import type { Past30LogEntry } from './historyHelpers';

interface Props {
    past30Logs: Past30LogEntry[];
    targetKcal: number;
}

function CalorieBarChart({
    logs,
    targetKcal,
}: {
    logs: Past30LogEntry[];
    targetKcal: number;
}) {
    const isDark = false; // Fresh Earthy theme is a light theme
    const ordered = [...logs].reverse(); // oldest → newest (left → right)

    const activeLogs = ordered.filter((e) => e.hasData);
    if (activeLogs.length === 0) {
        return (
            <div className={`h-24 flex items-center justify-center rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Henüz veri yok</span>
            </div>
        );
    }

    // Min-max range: pad by ±200 kcal so small diffs are visible
    const values = activeLogs.map((e) => e.totals.kcal);
    const dataMin = Math.max(0, Math.min(...values) - 300);
    const dataMax = Math.max(...values) + 300;
    const range = dataMax - dataMin || 1;

    const targetPct = Math.min(100, Math.max(0, ((targetKcal - dataMin) / range) * 100));

    return (
        <div className="relative">
            {/* Target line */}
            <div
                className={`absolute left-0 right-0 border-t border-dashed ${isDark ? 'border-indigo-500/50' : 'border-indigo-400/60'} z-10`}
                style={{ bottom: `${targetPct}%`, height: 0 }}
            />

            {/* Bars */}
            <div className="flex items-end gap-[2px] h-24">
                {ordered.map((entry) => {
                    if (!entry.hasData) {
                        return (
                            <div key={entry.log.date} className="flex-1 min-w-0 h-full flex items-end">
                                <div className={`w-full rounded-t-[2px] ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} style={{ height: '3px' }} />
                            </div>
                        );
                    }
                    const pct = Math.min(100, Math.max(4, ((entry.totals.kcal - dataMin) / range) * 100));
                    const onTarget = entry.totals.kcal >= targetKcal * 0.85;
                    return (
                        <div
                            key={entry.log.date}
                            className="flex-1 min-w-0 h-full flex items-end"
                            title={`${entry.log.date}: ${Math.round(entry.totals.kcal)} kcal`}
                        >
                            <div
                                className={`w-full rounded-t-[2px] transition-all ${onTarget ? 'bg-indigo-500' : 'bg-indigo-300'}`}
                                style={{ height: `${pct}%` }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-1">
                <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>30 gün önce</span>
                <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Bugün</span>
            </div>
        </div>
    );
}

export function Past30Tab({ past30Logs, targetKcal }: Props) {
    const T = useActiveTheme();
    const t = useTranslate();
    const language = useUserStore((s) => s.language);
    const goal = useUserStore((s) => s.goal);
    const isDark = false; // Fresh Earthy theme is a light theme

    const summary = (() => {
        const activeLogs = past30Logs.filter((e) => e.hasData);
        const activeDays = activeLogs.length;
        const totalKcal = activeLogs.reduce((s, e) => s + e.totals.kcal, 0);
        const totalProtein = activeLogs.reduce((s, e) => s + e.totals.protein, 0);
        const totalCarb = activeLogs.reduce((s, e) => s + e.totals.carb, 0);
        const totalFat = activeLogs.reduce((s, e) => s + e.totals.fat, 0);
        const totalWater = past30Logs.reduce((s, e) => s + e.waterAmount, 0);
        const exerciseSessions = past30Logs.filter((e) => e.isWorkoutDone).length;
        const exerciseMinutes = past30Logs.reduce((s, e) => s + (e.isWorkoutDone ? e.workoutDuration : 0), 0);
        const monthlyExerciseTarget = Math.max(1, (goal?.weeklySportQuota ?? 0) * 4);
        const avgKcal = activeDays > 0 ? Math.round(totalKcal / activeDays) : 0;

        return {
            activeDays,
            avgKcal,
            avgWater: Math.round(totalWater / 30),
            avgProtein: activeDays > 0 ? Math.round(totalProtein / activeDays) : 0,
            avgCarb: activeDays > 0 ? Math.round(totalCarb / activeDays) : 0,
            avgFat: activeDays > 0 ? Math.round(totalFat / activeDays) : 0,
            exerciseSessions,
            exerciseMinutes,
            monthlyExerciseTarget,
        };
    })();

    return (
        <>
            {/* ── Monthly Summary Card ── */}
            <div className={`rounded-2xl border p-4 ${T.cardBorder} ${T.cardBg}`}>
                <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs font-semibold uppercase tracking-widest ${T.subtitle}`}>
                        {t('Aylık Özet', 'Monthly Overview')}
                    </p>
                    <span className={`text-xs font-bold ${T.title}`}>
                        {t('Ort. Kalori:', 'Avg Calories:')} <span className={T.accent}>{summary.avgKcal} kcal</span>
                    </span>
                </div>

                <CalorieBarChart
                    logs={past30Logs}
                    targetKcal={targetKcal}
                />

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-3">
                    {/* Active days */}
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-slate-50'} border ${T.cardBorder}`}>
                        <p className={`text-[10px] font-semibold uppercase tracking-wide ${T.subtitle}`}>{t('Aktif Gün', 'Active Days')}</p>
                        <p className={`text-2xl font-bold mt-1.5 ${T.title}`}>{summary.activeDays}<span className={`text-sm font-normal ${T.subtitle}`}>/30</span></p>
                    </div>
                    {/* Avg Water */}
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'} border ${isDark ? 'border-blue-500/20' : 'border-blue-100'}`}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">{t('Ort. Su', 'Avg Water')}</p>
                        <p className={`text-2xl font-bold mt-1.5 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{formatWater(summary.avgWater, language)}</p>
                    </div>
                    {/* Exercise */}
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'} border ${isDark ? 'border-indigo-500/20' : 'border-indigo-100'}`}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">{t('Egzersiz', 'Exercise')}</p>
                        <p className={`text-2xl font-bold mt-1.5 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                            {summary.exerciseSessions}<span className={`text-sm font-normal ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>/{summary.monthlyExerciseTarget}</span>
                        </p>
                        <p className={`text-[11px] mt-1 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>{summary.exerciseMinutes} {t('dk toplam', 'min total')}</p>
                    </div>
                    {/* Avg Macros */}
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'} border ${isDark ? 'border-emerald-500/20' : 'border-emerald-100'}`}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">{t('Ort. Makro', 'Avg Macros')}</p>
                        <div className="mt-2 space-y-1">
                            <p className={`text-xs font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>P: {summary.avgProtein}g</p>
                            <p className={`text-xs font-bold ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>K: {summary.avgCarb}g</p>
                            <p className={`text-xs font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>Y: {summary.avgFat}g</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Daily Cards ── */}
            {past30Logs.length === 0 ? (
                <div className={`rounded-2xl border px-5 py-12 text-center ${T.cardBorder} ${T.mutedSurface}`}>
                    <p className={`text-base font-semibold ${T.title}`}>
                        {t('Son 30 gün için kayıt yok.', 'No entries in the last 30 days.')}
                    </p>
                </div>
            ) : (
                <div className="space-y-1.5">
                    {past30Logs.map((entry) => (
                        <HistoryDayCard
                            key={entry.log.date}
                            entry={entry}
                            targetKcal={targetKcal}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
