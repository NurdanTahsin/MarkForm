import type { DashTheme } from '../../constants/themes';
import type { UserStats } from '../../types';
import { addMonthsKeepingDay, formatMonthLabel } from '../../utils/dateUtils';

interface Props {
    T: DashTheme;
    language: 'tr' | 'en';
    bmr: number | null;
    draftStats: UserStats | null;
    idealWeight: number | null;
    idealPlanInfo: { safeMonthOffset: number; intake: number } | null;
    effectiveTargetWeight: string;
    targetWeightTouched: boolean;
    setTargetWeightTouched: (v: boolean) => void;
    setTargetWeight: (v: string) => void;
    effectiveSelectedMonthOffset: number;
    monthOptions: number[];
    setSelectedMonthOffset: (v: number) => void;
    selectedTargetDateIso: string;
    preview: { requiredDailyCalories: number; warning?: string | null } | null;
    canSave: boolean;
    today: Date;
    onChooseRecommended: () => void;
    onChooseManual: () => void;
}

export function OnboardingStep3({
    T, language, bmr, draftStats, idealWeight, idealPlanInfo,
    effectiveTargetWeight, setTargetWeightTouched, setTargetWeight,
    effectiveSelectedMonthOffset, monthOptions, setSelectedMonthOffset,
    preview, canSave, today, onChooseRecommended, onChooseManual,
}: Props) {
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);
    const inputCls = `w-full sm:max-w-80 rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${T.inputBg} ${T.inputBorder} ${T.inputText} ${T.ring}`;

    return (
        <div className="space-y-5">
            {/* Hızlı referans */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className={`rounded-xl border px-4 py-3 ${T.subtleSurface}`}>
                    <p className={`text-xs ${T.subtitle}`}>
                        {t('Minimum:', 'Minimum:')}{' '}
                        <span className={`font-semibold ${T.title}`}>{bmr ? `${bmr.toFixed(0)} kcal` : '--'}</span>
                    </p>
                </div>
                <div className={`rounded-xl border px-4 py-3 ${T.subtleSurface}`}>
                    <p className={`text-xs ${T.subtitle}`}>
                        {t('Sabit Kalmak İçin:', 'To Stay Stable:')}{' '}
                        <span className={`font-semibold ${T.title}`}>{draftStats ? `${draftStats.TDEE.toFixed(0)} kcal` : '--'}</span>
                    </p>
                </div>
            </div>

            <h2 className={`text-sm font-semibold uppercase tracking-wide ${T.subtitle}`}>
                {t('Adım 3: Hedefini Belirle', 'Step 3: Set Your Goal')}
            </h2>

            <div className="space-y-4">
                {/* Önerilen plan */}
                <div className={`rounded-2xl border p-4 ${T.recommendationSurface}`}>
                    <p className={`text-base font-bold tracking-wide ${T.accent}`}>{t('Önerilen Plan', 'Recommended Plan')}</p>
                    {idealPlanInfo ? (
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_0.9fr]">
                            <div className={`self-center space-y-3 text-lg leading-relaxed ${T.subtitle}`}>
                                <p className="pl-5">
                                    {t('İdeal Kilo:', 'Ideal Weight:')}{' '}
                                    <span className={`text-[1.15rem] font-bold ${T.accent}`}>{idealWeight?.toFixed(1)} kg</span>
                                </p>
                                <p className="pl-5">
                                    {t('Önerilen Süre:', 'Suggested Duration:')}{' '}
                                    <span className={`text-[1.15rem] font-bold ${T.accent}`}>{idealPlanInfo.safeMonthOffset} ay</span>
                                </p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className={`rounded-xl border p-5 text-center ${T.energySurface}`}>
                                    <p className={`text-sm ${T.subtitle}`}>{t('Günlük Kalori', 'Daily Calories')}</p>
                                    <p className={`mt-1 text-4xl font-extrabold ${T.accent}`}>{idealPlanInfo.intake.toFixed(0)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={onChooseRecommended}
                                    disabled={idealWeight === null}
                                    className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-300 ${T.accentBtn}`}
                                >
                                    {t('Önerilen Planı Kullan', 'Use Recommended Plan')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className={`mt-3 text-sm ${T.subtitle}`}>
                            {t('Önceki adımı tamamladığında öneriyi göreceksin.', 'You will see recommendation after Step 1.')}
                        </p>
                    )}
                </div>

                {/* Manuel plan */}
                <div className={`rounded-2xl border p-4 ${T.cardBg} ${T.cardBorder}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${T.subtitle}`}>
                        {t('Kendi Planını Oluştur', 'Build Your Own Plan')}
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_0.9fr]">
                        <div className="space-y-3">
                            <label className="block space-y-1.5">
                                <span className={`text-sm font-medium ${T.title}`}>{t('Hedef Kilo (kg)', 'Target Weight (kg)')}</span>
                                <input
                                    type="number" min={1} value={effectiveTargetWeight}
                                    onChange={(e) => { setTargetWeightTouched(true); setTargetWeight(e.target.value); }}
                                    className={inputCls}
                                />
                            </label>
                            <label className="block space-y-1.5">
                                <span className={`text-sm font-medium ${T.title}`}>{t('Hedef Ay', 'Target Month')}</span>
                                <select
                                    value={effectiveSelectedMonthOffset}
                                    onChange={(e) => setSelectedMonthOffset(Number(e.target.value))}
                                    className={inputCls}
                                >
                                    {monthOptions.map((offset) => (
                                        <option key={offset} value={offset}>
                                            {language === 'tr'
                                                ? `${offset} ay sonra - ${formatMonthLabel(addMonthsKeepingDay(today, offset))}`
                                                : `In ${offset} months - ${formatMonthLabel(addMonthsKeepingDay(today, offset))}`}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className={`rounded-xl border p-5 text-center ${T.energySurface}`}>
                                <p className={`text-sm ${T.subtitle}`}>{t('Günlük Kalori', 'Daily Calories')}</p>
                                <p className={`mt-1 text-4xl font-extrabold ${T.accent}`}>
                                    {preview ? preview.requiredDailyCalories.toFixed(0) : '--'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onChooseManual}
                                disabled={!canSave}
                                className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-300 ${T.accentBtn}`}
                            >
                                {t('Kendi Planını Seç', 'Choose Your Plan')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {preview?.warning && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {preview.warning}
                </div>
            )}
        </div>
    );
}
