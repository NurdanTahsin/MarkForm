import { useMemo, useState } from 'react';
import { useDailyCalorieTarget, useUserStore } from '../../store/useUserStore';
import { THEME_PRESETS } from '../../constants/themes';
import {
    addDays,
    addMonthsKeepingDay,
    calculateSafeMonthOffset,
    formatDateInput,
    startOfDay,
} from '../../utils/dateUtils';
import {
    calculateBMR,
    calculateIntakeFromDays,
    calculateMinDaysForSafety,
} from '../../utils/healthEngine';
import { buildDraftStats, buildDraftGoal, toNumber } from './onboardingHelpers';
import type { WizardStep, Gender } from './onboardingHelpers';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingStep1 } from './OnboardingStep1';
import { OnboardingStep2 } from './OnboardingStep2';
import { OnboardingStep3 } from './OnboardingStep3';

export default function Onboarding() {
    const setStats = useUserStore((state) => state.setStats);
    const setGoal = useUserStore((state) => state.setGoal);
    const language = useUserStore((state) => state.language);
    const theme = useUserStore((state) => state.theme);

    const [step, setStep] = useState<WizardStep>(1);

    // Step 1 state
    const [name, setName] = useState('Nurdan');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [currentWeight, setCurrentWeight] = useState('');
    const [gender, setGender] = useState<Gender>('male');
    const [activityLevel, setActivityLevel] = useState('sedentary');
    const [enableCycleTracking, setEnableCycleTracking] = useState(false);
    const [lastPeriodStartDate, setLastPeriodStartDate] = useState('');
    const [averageCycleLength, setAverageCycleLength] = useState('28');

    // Step 3 state
    const [targetWeight, setTargetWeight] = useState('');
    const [targetWeightTouched, setTargetWeightTouched] = useState(false);
    const [selectedMonthOffset, setSelectedMonthOffset] = useState(1);

    const today = useMemo(() => startOfDay(new Date()), []);
    const activeTheme = THEME_PRESETS[theme] ?? THEME_PRESETS.light;

    const draftStats = useMemo(
        () => buildDraftStats({ name, age, height, currentWeight, gender, activityLevel }),
        [name, age, height, currentWeight, gender, activityLevel]
    );

    const bmr = useMemo(() => (draftStats ? calculateBMR(draftStats) : null), [draftStats]);

    const idealWeight = useMemo(() => {
        if (!draftStats) return null;
        const h = draftStats.height / 100;
        return Number((22 * h * h).toFixed(1));
    }, [draftStats]);

    const idealPlanInfo = useMemo(() => {
        if (!draftStats || idealWeight === null) return null;
        try {
            const minSafeDays = calculateMinDaysForSafety(draftStats, { targetWeight: idealWeight, targetDate: formatDateInput(today), weeklySportQuota: 0 });
            const earliestSafeDate = addDays(today, minSafeDays);
            const safeMonthOffset = calculateSafeMonthOffset(today, earliestSafeDate);
            const targetDate = addMonthsKeepingDay(today, safeMonthOffset);
            const intake = calculateIntakeFromDays(
                draftStats,
                { targetWeight: idealWeight, targetDate: formatDateInput(targetDate), weeklySportQuota: 0 },
                Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
            );
            return { earliestSafeDate, safeMonthOffset, intake };
        } catch {
            return null;
        }
    }, [draftStats, idealWeight, today]);

    const suggestedTargetWeight = useMemo(() => {
        const current = toNumber(currentWeight);
        if (!Number.isFinite(current) || current <= 2) return '';
        return Math.max(1, current - 2).toFixed(1);
    }, [currentWeight]);

    const effectiveTargetWeight = targetWeightTouched ? targetWeight : suggestedTargetWeight;

    const manualSafeMonthOffset = useMemo(() => {
        if (!draftStats) return 1;
        const manualTargetWeight = toNumber(effectiveTargetWeight);
        if (!Number.isFinite(manualTargetWeight) || manualTargetWeight <= 0) return idealPlanInfo?.safeMonthOffset ?? 1;
        try {
            const minSafeDays = calculateMinDaysForSafety(draftStats, { targetWeight: manualTargetWeight, targetDate: formatDateInput(today), weeklySportQuota: 0 });
            const earliestSafeDate = addDays(today, minSafeDays);
            return calculateSafeMonthOffset(today, earliestSafeDate);
        } catch {
            return idealPlanInfo?.safeMonthOffset ?? 1;
        }
    }, [draftStats, effectiveTargetWeight, today, idealPlanInfo]);

    const effectiveSelectedMonthOffset = Math.max(selectedMonthOffset, manualSafeMonthOffset);
    const monthOptions = useMemo(() => Array.from({ length: 6 }, (_, i) => manualSafeMonthOffset + i), [manualSafeMonthOffset]);
    const selectedTargetDate = useMemo(() => addMonthsKeepingDay(today, effectiveSelectedMonthOffset), [today, effectiveSelectedMonthOffset]);
    const selectedTargetDateIso = useMemo(() => formatDateInput(selectedTargetDate), [selectedTargetDate]);
    const draftGoal = useMemo(() => buildDraftGoal({ targetWeight: effectiveTargetWeight, targetDate: selectedTargetDateIso }), [effectiveTargetWeight, selectedTargetDateIso]);
    const preview = useDailyCalorieTarget(draftStats, draftGoal);

    const canContinue = draftStats !== null;
    const canSave = draftStats !== null && draftGoal !== null;
    const progressWidthClass = step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full';

    const buildStatsPayload = () => {
        if (!draftStats) return null;
        const cycleTrackingEnabled = gender === 'female' && enableCycleTracking;
        const cycleLength = Number(averageCycleLength);
        return {
            ...draftStats,
            cycleTrackingEnabled,
            lastPeriodStartDate: cycleTrackingEnabled && lastPeriodStartDate.length > 0 ? lastPeriodStartDate : undefined,
            averageCycleLength: cycleTrackingEnabled && Number.isFinite(cycleLength) && cycleLength > 0 ? cycleLength : undefined,
        };
    };

    const chooseRecommendedPlan = () => {
        if (!draftStats || idealWeight === null || !idealPlanInfo) return;
        const statsPayload = buildStatsPayload();
        if (!statsPayload) return;
        setTargetWeightTouched(true);
        setTargetWeight(idealWeight.toFixed(1));
        setSelectedMonthOffset(idealPlanInfo.safeMonthOffset);
        setStats(statsPayload);
        setGoal({ targetWeight: idealWeight, targetDate: formatDateInput(addMonthsKeepingDay(today, idealPlanInfo.safeMonthOffset)), weeklySportQuota: 0 });
    };

    const chooseManualPlan = () => {
        if (!draftGoal) return;
        const statsPayload = buildStatsPayload();
        if (!statsPayload) return;
        setStats(statsPayload);
        setGoal(draftGoal);
    };

    return (
        <main className={`min-h-screen p-4 sm:p-6 ${activeTheme.pageBg}`}>
            <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-3xl items-center justify-center sm:min-h-[calc(100vh-3rem)]">
                <section className={`w-full rounded-4xl border p-8 shadow-2xl ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
                    {/* İlerleme çubuğu */}
                    <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full transition-all duration-300 ${activeTheme.circle} ${progressWidthClass}`} />
                    </div>

                    <OnboardingHeader
                        language={language}
                        theme={theme}
                        step={step}
                        activeTheme={activeTheme}
                    />

                    {step === 1 && (
                        <OnboardingStep1
                            T={activeTheme} language={language}
                            name={name} setName={setName}
                            age={age} setAge={setAge}
                            height={height} setHeight={setHeight}
                            currentWeight={currentWeight} setCurrentWeight={setCurrentWeight}
                            gender={gender} setGender={setGender}
                            activityLevel={activityLevel} setActivityLevel={setActivityLevel}
                            enableCycleTracking={enableCycleTracking} setEnableCycleTracking={setEnableCycleTracking}
                            lastPeriodStartDate={lastPeriodStartDate} setLastPeriodStartDate={setLastPeriodStartDate}
                            averageCycleLength={averageCycleLength} setAverageCycleLength={setAverageCycleLength}
                            today={today}
                        />
                    )}

                    {step === 2 && (
                        <OnboardingStep2
                            T={activeTheme} language={language}
                            bmr={bmr} draftStats={draftStats}
                            idealPlanInfo={idealPlanInfo} idealWeight={idealWeight}
                        />
                    )}

                    {step === 3 && (
                        <OnboardingStep3
                            T={activeTheme} language={language}
                            bmr={bmr} draftStats={draftStats}
                            idealWeight={idealWeight} idealPlanInfo={idealPlanInfo}
                            effectiveTargetWeight={effectiveTargetWeight}
                            targetWeightTouched={targetWeightTouched}
                            setTargetWeightTouched={setTargetWeightTouched}
                            setTargetWeight={setTargetWeight}
                            effectiveSelectedMonthOffset={effectiveSelectedMonthOffset}
                            monthOptions={monthOptions}
                            setSelectedMonthOffset={setSelectedMonthOffset}
                            selectedTargetDateIso={selectedTargetDateIso}
                            preview={preview}
                            canSave={canSave}
                            today={today}
                            onChooseRecommended={chooseRecommendedPlan}
                            onChooseManual={chooseManualPlan}
                        />
                    )}

                    {/* Nav butonları */}
                    <div className="mt-6 flex items-center justify-between">
                        <button
                            type="button"
                            disabled={step === 1}
                            onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev))}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${activeTheme.inputBorder} ${activeTheme.title} ${activeTheme.mutedSurface}`}
                        >
                            {language === 'tr' ? 'Geri' : 'Back'}
                        </button>

                        {step < 3 ? (
                            <button
                                type="button"
                                disabled={!canContinue}
                                onClick={() => setStep((prev) => (prev < 3 ? ((prev + 1) as WizardStep) : prev))}
                                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-300 ${activeTheme.accentBtn}`}
                            >
                                {language === 'tr' ? 'İleri' : 'Next'}
                            </button>
                        ) : (
                            <div />
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
