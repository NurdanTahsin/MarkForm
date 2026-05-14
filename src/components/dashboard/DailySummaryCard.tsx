import { useMemo } from 'react';
import { Droplets, Dumbbell, Flame } from 'lucide-react';
import { useActiveTheme, useDailyCalorieTarget, useUserStore } from '../../store/useUserStore';
import { todayString, formatWater } from '../../constants/dashboardConstants';
import { CalorieRing } from './CalorieRing';

export function DailySummaryCard() {
    const T = useActiveTheme();
    const logs = useUserStore((s) => s.logs);
    const waterTarget = useUserStore((s) => s.waterTarget);
    const stats = useUserStore((s) => s.stats);
    const language = useUserStore((s) => s.language);
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);
    const calorieTarget = useDailyCalorieTarget();
    const targetKcal = Math.round(calorieTarget?.intake ?? 2000);
    const targetProtein = Math.round((targetKcal * 0.3) / 4);
    const targetCarb = Math.round((targetKcal * 0.4) / 4);
    const targetFat = Math.round((targetKcal * 0.3) / 9);

    const today = todayString();
    const todayLog = useMemo(() => logs.find((l) => l.date === today), [logs, today]);

    const totals = useMemo(() => {
        const items = todayLog?.categories.flatMap((c) => c.items) ?? [];
        return {
            kcal: items.reduce((s, i) => s + i.kcal, 0),
            protein: items.reduce((s, i) => s + i.protein, 0),
            carb: items.reduce((s, i) => s + i.carb, 0),
            fat: items.reduce((s, i) => s + i.fat, 0),
        };
    }, [todayLog]);

    const waterIntake = todayLog?.waterIntake ?? 0;
    const workoutDone = todayLog?.workoutDone ?? false;
    const workoutName = todayLog?.workoutName;
    const workoutDuration = todayLog?.workoutDuration;

    const workoutCalories = useMemo(() => {
        if (!workoutDuration) return null;
        const weightKg = stats?.currentWeight ?? 70;
        return Math.round(3.5 * weightKg * workoutDuration / 60);
    }, [workoutDuration, stats?.currentWeight]);

    const macros = [
        { label: t('Protein', 'Protein'), current: totals.protein, target: targetProtein, barClass: 'macro-fill-emerald' },
        { label: t('Yağ', 'Fat'), current: totals.fat, target: targetFat, barClass: 'macro-fill-amber' },
        { label: t('Karb', 'Carb'), current: totals.carb, target: targetCarb, barClass: 'macro-fill-sky' },
    ];

    return (
        <section className={`rounded-3xl border ${T.cardBg} ${T.cardBorder} shadow-sm overflow-hidden`}>
            {/*
              Mobile: 2-col grid — left=ring+macros+kalan, right=su(top)+egzersiz(bottom)
              PC (lg+):  stacked — top=ring+macros+kalan full-width, bottom=su|egzersiz 2-col
            */}
            <div className="grid grid-cols-1 sm:grid-cols-[3fr_2fr] lg:block">

                {/* ── LEFT (mobile) / TOP (PC): ring + macros + kalan kalori ── */}
                <div className={`p-3 border-b sm:border-b-0 sm:border-r lg:border-r-0 lg:p-4 ${T.cardBorder}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${T.subtitle}`}>{t('Günlük Özet', 'Daily Summary')}</p>

                    {/* Mobile: ring stacked above macros. PC: ring left, macros right */}
                    <div className="mt-2 grid w-full justify-items-stretch gap-3 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
                        <div className="flex justify-center pl-5 sm:pl-0 lg:justify-start lg:pl-0">
                            <CalorieRing value={totals.kcal} max={targetKcal} />
                        </div>

                        <div className="-mt-5 mb-3 w-full min-w-0 space-y-2.5 lg:mt-0 lg:mb-0 lg:min-w-85">
                            {macros.map(({ label, current, target, barClass }) => (
                                <div key={label} className="w-full">
                                    {/* Metinleri tam sağa ve sola yaslamak için */}
                                    <div className="mb-1 flex items-end justify-between">
                                        <span className={`text-xs ${T.subtitle}`}>{label}</span>
                                        <span className={`text-xs font-medium ${T.title}`}>
                                            {Math.round(current)}/{target}g
                                        </span>
                                    </div>

                                    <progress
                                        className={`macro-bar macro-track-light ${barClass}`}
                                        value={Math.max(0, Math.min(current, target || 0))}
                                        max={Math.max(1, target)}
                                        aria-label={`${label} progress`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-1.5 flex justify-center">
                        <p className="inline-flex items-center gap-1.5 rounded-2xl border border-[#0EA5E9]/25 bg-[#0EA5E9]/10 px-3 py-1.5 text-sm font-bold text-[#0284C7]">
                            <Flame className="h-4 w-4 text-[#0EA5E9]" strokeWidth={2} />
                            {Math.max(0, targetKcal - Math.round(totals.kcal))} {t('kcal kalan', 'kcal left')}
                        </p>
                    </div>
                </div>

                {/* ── RIGHT (mobile) / BOTTOM (PC): su + egzersiz ── */}
                {/*
                  Mobile: flex-col (su on top, egzersiz below)
                  PC: grid-cols-2 side by side with divider
                */}
                <div className={`grid grid-rows-2 divide-y lg:grid-rows-none lg:grid-cols-2 lg:divide-y-0 lg:divide-x lg:border-t ${T.cardBorder}`}>

                    {/* Su */}
                    <div className="flex flex-col p-3 lg:p-4">
                        <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${T.subtitle}`}>{t('SU', 'WATER')}</p>
                        <div className="flex flex-1 items-center gap-3 mt-2">
                            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${T.accentSoft}`}>
                                <Droplets className={`h-6 w-6 ${T.accent}`} strokeWidth={1.9} />
                            </div>
                            <div>
                                <p className={`text-xl font-bold lg:text-2xl ${T.title}`}>{formatWater(waterIntake, language)}</p>
                                <p className={`text-xs ${T.subtitle}`}>/ {formatWater(waterTarget, language)} {t('hedef', 'target')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Egzersiz */}
                    <div className="flex flex-col p-3 lg:p-4">
                        <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${T.subtitle}`}>{t('EGZERSİZ', 'EXERCISE')}</p>
                        <div className="flex flex-1 items-center gap-3 mt-2">
                            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${T.mutedSurface}`}>
                                <Dumbbell className={`h-6 w-6 ${T.accent}`} strokeWidth={1.9} />
                            </div>
                            <div className="min-w-0">
                                {workoutDone && workoutName ? (
                                    <>
                                        <p className={`text-base font-bold lg:text-lg ${T.title} truncate`}>
                                            {workoutName}{workoutDuration ? ` ${workoutDuration}${t('dk', 'min')}` : ''}
                                        </p>
                                        {workoutCalories && (
                                            <p className={`text-xs ${T.subtitle}`}>~{workoutCalories} {t('kcal yakıldı', 'kcal burned')}</p>
                                        )}
                                    </>
                                ) : (
                                    <p className={`text-base font-bold lg:text-lg ${workoutDone ? T.accent : T.title}`}>
                                        {workoutDone ? t('Yapıldı ✓', 'Done ✓') : t('Yapılmadı', 'Not done')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
