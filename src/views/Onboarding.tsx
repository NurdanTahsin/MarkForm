import '../index.css';

import { useEffect, useMemo, useState } from 'react';

import { useDailyCalorieTarget, useUserStore } from '../store/useUserStore';
import type { UserGoal, UserStats } from '../types';
import {
    calculateBMR,
    calculateIntakeFromDays,
    calculateMinDaysForSafety,
    calculateTDEE,
} from '../utils/healthEngine';

type WizardStep = 1 | 2 | 3;
type Gender = 'male' | 'female';
type ThemeKey = 'light' | 'dark' | 'earthy' | 'lavender';

type ActivityOption = {
    value: string;
    labelTr: string;
    labelEn: string;
    descriptionTr: string;
    descriptionEn: string;
};

type ThemePreset = {
    label: string;
    pageBg: string;
    cardBg: string;
    cardBorder: string;
    title: string;
    subtitle: string;
    inputBg: string;
    inputBorder: string;
    inputText: string;
    accentBtn: string;
    subtleSurface: string;
    energySurface: string;
    recommendationSurface: string;
    dividerText: string;
    ring: string;
    circle: string;
};

const ACTIVITY_OPTIONS: ActivityOption[] = [
    {
        value: 'sedentary',
        labelTr: 'Hareketsiz',
        labelEn: 'Sedentary',
        descriptionTr: 'Masa basi gunler, duzenli egzersiz yok denecek kadar az.',
        descriptionEn: 'Mostly desk work, little to no planned exercise.',
    },
    {
        value: 'lightlyActive',
        labelTr: 'Az Aktif',
        labelEn: 'Lightly Active',
        descriptionTr: 'Haftada 1-3 gun hafif tempolu hareket.',
        descriptionEn: 'Light movement around 1-3 days per week.',
    },
    {
        value: 'moderatelyActive',
        labelTr: 'Orta Aktif',
        labelEn: 'Moderately Active',
        descriptionTr: 'Haftada 3-5 gun orta tempoda aktif yasam.',
        descriptionEn: 'Moderate activity around 3-5 days weekly.',
    },
    {
        value: 'veryActive',
        labelTr: 'Cok Aktif',
        labelEn: 'Very Active',
        descriptionTr: 'Neredeyse her gun duzenli egzersiz.',
        descriptionEn: 'Consistent training most days of the week.',
    },
    {
        value: 'extraActive',
        labelTr: 'Asiri Aktif',
        labelEn: 'Extra Active',
        descriptionTr: 'Yuksek eforlu spor veya fiziksel olarak zorlayici gunler.',
        descriptionEn: 'High-volume training or physically demanding routine.',
    },
];


const THEME_PRESETS: Record<ThemeKey, ThemePreset> = {
    light: {
        label: 'Light',
        pageBg: 'bg-gradient-to-b from-slate-50 via-emerald-50/40 to-slate-50',
        cardBg: 'bg-white',
        cardBorder: 'border-slate-200',
        title: 'text-slate-800',
        subtitle: 'text-slate-600',
        inputBg: 'bg-white',
        inputBorder: 'border-slate-200',
        inputText: 'text-slate-800',
        accentBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        subtleSurface: 'bg-slate-50 border-slate-200',
        energySurface: 'bg-emerald-50/70 border-emerald-200',
        recommendationSurface: 'bg-emerald-50 border-emerald-200',
        dividerText: 'text-slate-500',
        ring: 'focus:ring-emerald-500',
        circle: 'bg-emerald-500',
    },
    dark: {
        label: 'Dark',
        pageBg: 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900',
        cardBg: 'bg-slate-900',
        cardBorder: 'border-slate-600',
        title: 'text-slate-100',
        subtitle: 'text-slate-300',
        inputBg: 'bg-slate-800/80',
        inputBorder: 'border-slate-500',
        inputText: 'text-slate-100',
        accentBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        subtleSurface: 'bg-slate-800/80 border-slate-700',
        energySurface: 'bg-slate-800 border-slate-600',
        recommendationSurface: 'bg-emerald-900/20 border-emerald-700',
        dividerText: 'text-slate-400',
        ring: 'focus:ring-emerald-500',
        circle: 'bg-slate-500',
    },
    earthy: {
        label: 'Earthy',
        pageBg: 'bg-gradient-to-b from-stone-100 via-lime-50 to-amber-50',
        cardBg: 'bg-[#fffdf8]',
        cardBorder: 'border-amber-200',
        title: 'text-stone-800',
        subtitle: 'text-stone-600',
        inputBg: 'bg-white',
        inputBorder: 'border-amber-200',
        inputText: 'text-stone-800',
        accentBtn: 'bg-emerald-700 hover:bg-emerald-800 text-white',
        subtleSurface: 'bg-amber-50/70 border-amber-200',
        energySurface: 'bg-lime-50 border-lime-200',
        recommendationSurface: 'bg-emerald-50 border-emerald-200',
        dividerText: 'text-stone-500',
        ring: 'focus:ring-emerald-600',
        circle: 'bg-lime-600',
    },
    lavender: {
        label: 'Lavender',
        pageBg: 'bg-gradient-to-b from-violet-50 via-purple-50 to-rose-50',
        cardBg: 'bg-white',
        cardBorder: 'border-purple-200',
        title: 'text-slate-800',
        subtitle: 'text-slate-600',
        inputBg: 'bg-white',
        inputBorder: 'border-purple-200',
        inputText: 'text-slate-800',
        accentBtn: 'bg-purple-600 hover:bg-purple-700 text-white',
        subtleSurface: 'bg-purple-50/70 border-purple-200',
        energySurface: 'bg-rose-50 border-rose-200',
        recommendationSurface: 'bg-emerald-50 border-emerald-200',
        dividerText: 'text-slate-500',
        ring: 'focus:ring-purple-500',
        circle: 'bg-purple-400',
    },
};

function toNumber(value: string): number {
    return Number(value.trim());
}

function formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatMonthLabel(date: Date): string {
    return date.toLocaleDateString('tr-TR', {
        month: 'long',
        year: 'numeric',
    });
}

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(baseDate: Date, days: number): Date {
    const next = startOfDay(baseDate);
    next.setDate(next.getDate() + days);
    return next;
}

function daysInMonth(year: number, monthIndex: number): number {
    return new Date(year, monthIndex + 1, 0).getDate();
}

function addMonthsKeepingDay(baseDate: Date, monthOffset: number): Date {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();

    const rawMonth = month + monthOffset;
    const targetYear = year + Math.floor(rawMonth / 12);
    const targetMonth = ((rawMonth % 12) + 12) % 12;
    const maxDay = daysInMonth(targetYear, targetMonth);
    const targetDay = Math.min(day, maxDay);

    return new Date(targetYear, targetMonth, targetDay);
}

function calculateSafeMonthOffset(today: Date, earliestSafeDate: Date): number {
    for (let i = 1; i <= 36; i += 1) {
        const candidate = addMonthsKeepingDay(today, i);
        if (startOfDay(candidate).getTime() >= startOfDay(earliestSafeDate).getTime()) {
            return i;
        }
    }

    return 36;
}

function buildDraftStats(input: {
    name: string;
    age: string;
    height: string;
    currentWeight: string;
    gender: Gender;
    activityLevel: string;
}): UserStats | null {
    const name = input.name.trim();
    const age = toNumber(input.age);
    const height = toNumber(input.height);
    const currentWeight = toNumber(input.currentWeight);

    if (!Number.isFinite(age) || age <= 0) {
        return null;
    }

    if (!Number.isFinite(height) || height <= 0) {
        return null;
    }

    if (!Number.isFinite(currentWeight) || currentWeight <= 0) {
        return null;
    }

    const stats: UserStats = {
        name: name.length > 0 ? name : undefined,
        age,
        height,
        currentWeight,
        gender: input.gender,
        activityLevel: input.activityLevel,
        TDEE: 0,
    };

    stats.TDEE = calculateTDEE(stats);
    return stats;
}

function buildDraftGoal(input: { targetWeight: string; targetDate: string }): UserGoal | null {
    const targetWeight = toNumber(input.targetWeight);

    if (!Number.isFinite(targetWeight) || targetWeight <= 0 || input.targetDate.length === 0) {
        return null;
    }

    return {
        targetWeight,
        targetDate: input.targetDate,
        weeklySportQuota: 0,
    };
}

export default function Onboarding() {
    const setStats = useUserStore((state) => state.setStats);
    const setGoal = useUserStore((state) => state.setGoal);
    const language = useUserStore((state) => state.language);
    const setLanguage = useUserStore((state) => state.setLanguage);

    const [step, setStep] = useState<WizardStep>(1);

    const [name, setName] = useState('Nurdan');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [currentWeight, setCurrentWeight] = useState('');
    const [gender, setGender] = useState<Gender>('male');
    const [activityLevel, setActivityLevel] = useState('sedentary');
    const [targetWeight, setTargetWeight] = useState('');
    const [targetWeightTouched, setTargetWeightTouched] = useState(false);
    const [selectedMonthOffset, setSelectedMonthOffset] = useState(1);

    const [theme, setTheme] = useState<ThemeKey>('light');
    const [enableCycleTracking, setEnableCycleTracking] = useState(false);
    const [lastPeriodStartDate, setLastPeriodStartDate] = useState('');
    const [averageCycleLength, setAverageCycleLength] = useState('28');

    useEffect(() => {
        if (gender === 'male') {
            setEnableCycleTracking(false);
        }
    }, [gender]);

    useEffect(() => {
        if (targetWeightTouched) {
            return;
        }

        const current = toNumber(currentWeight);
        if (!Number.isFinite(current) || current <= 2) {
            return;
        }

        const suggested = Math.max(1, current - 2);
        setTargetWeight(suggested.toFixed(1));
    }, [currentWeight, targetWeightTouched]);

    const draftStats = useMemo(
        () => buildDraftStats({ name, age, height, currentWeight, gender, activityLevel }),
        [name, age, height, currentWeight, gender, activityLevel]
    );

    const today = useMemo(() => startOfDay(new Date()), []);
    const activeTheme = THEME_PRESETS[theme];
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);

    const bmr = useMemo(() => {
        if (!draftStats) {
            return null;
        }
        return calculateBMR(draftStats);
    }, [draftStats]);

    const idealWeight = useMemo(() => {
        if (!draftStats) {
            return null;
        }

        const heightInMeters = draftStats.height / 100;
        return Number((22 * heightInMeters * heightInMeters).toFixed(1));
    }, [draftStats]);

    const idealPlanInfo = useMemo(() => {
        if (!draftStats || idealWeight === null) {
            return null;
        }

        try {
            const minSafeDays = calculateMinDaysForSafety(draftStats, {
                targetWeight: idealWeight,
                targetDate: formatDateInput(today),
                weeklySportQuota: 0,
            });
            const earliestSafeDate = addDays(today, minSafeDays);
            const safeMonthOffset = calculateSafeMonthOffset(today, earliestSafeDate);
            const targetDate = addMonthsKeepingDay(today, safeMonthOffset);
            const intake = calculateIntakeFromDays(
                draftStats,
                {
                    targetWeight: idealWeight,
                    targetDate: formatDateInput(targetDate),
                    weeklySportQuota: 0,
                },
                Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
            );

            return {
                earliestSafeDate,
                safeMonthOffset,
                intake,
            };
        } catch {
            return null;
        }
    }, [draftStats, idealWeight, today]);

    const manualSafeMonthOffset = useMemo(() => {
        if (!draftStats) {
            return 1;
        }

        const manualTargetWeight = toNumber(targetWeight);
        if (!Number.isFinite(manualTargetWeight) || manualTargetWeight <= 0) {
            return idealPlanInfo?.safeMonthOffset ?? 1;
        }

        try {
            const minSafeDays = calculateMinDaysForSafety(draftStats, {
                targetWeight: manualTargetWeight,
                targetDate: formatDateInput(today),
                weeklySportQuota: 0,
            });
            const earliestSafeDate = addDays(today, minSafeDays);
            return calculateSafeMonthOffset(today, earliestSafeDate);
        } catch {
            return idealPlanInfo?.safeMonthOffset ?? 1;
        }
    }, [draftStats, targetWeight, today, idealPlanInfo]);

    useEffect(() => {
        setSelectedMonthOffset(manualSafeMonthOffset);
    }, [manualSafeMonthOffset]);

    const monthOptions = useMemo(() => {
        return Array.from({ length: 6 }, (_, i) => manualSafeMonthOffset + i);
    }, [manualSafeMonthOffset]);

    const selectedTargetDate = useMemo(() => {
        return addMonthsKeepingDay(today, selectedMonthOffset);
    }, [today, selectedMonthOffset]);

    const selectedTargetDateIso = useMemo(() => {
        return formatDateInput(selectedTargetDate);
    }, [selectedTargetDate]);

    const draftGoal = useMemo(
        () => buildDraftGoal({ targetWeight, targetDate: selectedTargetDateIso }),
        [targetWeight, selectedTargetDateIso]
    );

    const preview = useDailyCalorieTarget(draftStats, draftGoal);

    const canContinueStep1 = draftStats !== null;
    const canContinueStep2 = draftStats !== null;
    const canSave = draftStats !== null && draftGoal !== null;

    const progressWidthClass = step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full';

    const buildStatsPayload = () => {
        if (!draftStats) {
            return null;
        }

        const cycleLength = Number(averageCycleLength);
        return {
            ...draftStats,
            cycleTrackingEnabled: enableCycleTracking,
            lastPeriodStartDate:
                enableCycleTracking && lastPeriodStartDate.length > 0 ? lastPeriodStartDate : undefined,
            averageCycleLength:
                enableCycleTracking && Number.isFinite(cycleLength) && cycleLength > 0
                    ? cycleLength
                    : undefined,
        };
    };

    const chooseRecommendedPlan = () => {
        if (!draftStats || idealWeight === null || !idealPlanInfo) {
            return;
        }

        const recommendedTargetDate = addMonthsKeepingDay(today, idealPlanInfo.safeMonthOffset);
        const statsPayload = buildStatsPayload();
        if (!statsPayload) {
            return;
        }

        setTargetWeightTouched(true);
        setTargetWeight(idealWeight.toFixed(1));
        setSelectedMonthOffset(idealPlanInfo.safeMonthOffset);

        setStats(statsPayload);
        setGoal({
            targetWeight: idealWeight,
            targetDate: formatDateInput(recommendedTargetDate),
            weeklySportQuota: 0,
        });
    };

    const chooseManualPlan = () => {
        if (!draftGoal) {
            return;
        }

        const statsPayload = buildStatsPayload();
        if (!statsPayload) {
            return;
        }

        setStats(statsPayload);
        setGoal(draftGoal);
    };

    return (
        <main className={`min-h-screen p-4 sm:p-6 ${activeTheme.pageBg}`}>
            <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-3xl items-center justify-center sm:min-h-[calc(100vh-3rem)]">
                <section className={`w-full rounded-4xl border p-8 shadow-2xl ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
                    <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${activeTheme.circle} ${progressWidthClass}`}
                        />
                    </div>

                    <header className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">VitalsTrack</p>
                        <h1 className={`mt-2 text-2xl font-bold ${activeTheme.title}`}>
                            {t('Sana ozel dengeli bir plan hazirlayalim', 'Let us build your balanced plan')}
                        </h1>
                        <p className={`mt-1 text-sm ${activeTheme.subtitle}`}>{t(`Adim ${step} / 3`, `Step ${step} of 3`)}</p>

                        <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 p-1">
                            <button
                                type="button"
                                onClick={() => setLanguage('tr')}
                                className={[
                                    'rounded-lg px-3 py-1 text-xs font-semibold transition',
                                    language === 'tr' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100',
                                ].join(' ')}
                            >
                                Turkce
                            </button>
                            <button
                                type="button"
                                onClick={() => setLanguage('en')}
                                className={[
                                    'rounded-lg px-3 py-1 text-xs font-semibold transition',
                                    language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100',
                                ].join(' ')}
                            >
                                English
                            </button>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                            <span className={`text-xs ${activeTheme.subtitle}`}>{t('Tema Onizleme:', 'Theme Preview:')}</span>
                            {(Object.keys(THEME_PRESETS) as ThemeKey[]).map((key) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setTheme(key)}
                                    title={THEME_PRESETS[key].label}
                                    className={[
                                        'h-6 w-6 rounded-full border-2 transition',
                                        THEME_PRESETS[key].circle,
                                        theme === key ? 'scale-110 border-white ring-2 ring-slate-400' : 'border-white/70',
                                    ].join(' ')}
                                />
                            ))}
                        </div>
                    </header>

                    {step === 1 && (
                        <div className="space-y-4">
                            <h2 className={`text-sm font-semibold uppercase tracking-wide ${activeTheme.subtitle}`}>
                                {t('Adim 1: Temel Bilgiler', 'Step 1: Basic Info')}
                            </h2>
                            <p className={`text-sm ${activeTheme.subtitle}`}>
                                {t(
                                    'Seni daha iyi taniyip daha guvenli bir plan cikarmamiz icin bu alanlari birlikte dolduralim.',
                                    'Let us fill these fields together for a safer plan.'
                                )}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="block space-y-1.5">
                                    <span className={`text-sm font-medium ${activeTheme.title}`}>{t('Adin', 'Your Name')}</span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${activeTheme.inputBg} ${activeTheme.inputBorder} ${activeTheme.inputText} ${activeTheme.ring}`}
                                        placeholder="Nurdan"
                                    />
                                </label>

                                <label className="block space-y-1.5">
                                    <span className={`text-sm font-medium ${activeTheme.title}`}>{t('Yas', 'Age')}</span>
                                    <input
                                        type="number"
                                        min={1}
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${activeTheme.inputBg} ${activeTheme.inputBorder} ${activeTheme.inputText} ${activeTheme.ring}`}
                                        placeholder="30"
                                    />
                                </label>

                                <label className="block space-y-1.5">
                                    <span className={`text-sm font-medium ${activeTheme.title}`}>{t('Cinsiyet', 'Gender')}</span>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value as Gender)}
                                        className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${activeTheme.inputBg} ${activeTheme.inputBorder} ${activeTheme.inputText} ${activeTheme.ring}`}
                                    >
                                        <option value="male">{t('Erkek', 'Male')}</option>
                                        <option value="female">{t('Kadin', 'Female')}</option>
                                    </select>
                                </label>

                                <div className="space-y-1.5">
                                    <span className={`text-sm font-medium ${activeTheme.title}`}>
                                        {t('Dongu Takibi', 'Period Tracking')}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={gender !== 'female'}
                                        onClick={() => setEnableCycleTracking((prev) => !prev)}
                                        className={[
                                            `flex w-full items-center justify-between rounded-xl border px-4 py-3 transition ${activeTheme.inputBorder}`,
                                            gender !== 'female'
                                                ? 'cursor-not-allowed opacity-50'
                                                : `${activeTheme.inputBg} hover:border-slate-300`,
                                        ].join(' ')}
                                    >
                                        <span className={`flex items-center gap-2 text-sm font-semibold ${activeTheme.title}`}>
                                            <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M12 2c2.5 3.6 7 8.8 7 12.4A7 7 0 0 1 5 14.4C5 10.8 9.5 5.6 12 2Z" />
                                            </svg>
                                            {t('Takibi Etkinlestir', 'Enable Tracking')}
                                        </span>
                                        <span className={`text-xs ${activeTheme.subtitle}`}>
                                            {gender !== 'female'
                                                ? 'Female only'
                                                : enableCycleTracking
                                                    ? t('Acik', 'On')
                                                    : t('Kapali', 'Off')}
                                        </span>
                                    </button>
                                </div>

                                {enableCycleTracking && gender === 'female' && (
                                    <>
                                        <label className="space-y-1.5">
                                            <span className={`text-sm ${activeTheme.title}`}>
                                                {t('Son Adet Baslangic Tarihi', 'Last Period Start Date')}
                                            </span>
                                            <input
                                                type="date"
                                                value={lastPeriodStartDate}
                                                max={formatDateInput(today)}
                                                onChange={(e) => setLastPeriodStartDate(e.target.value)}
                                                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${activeTheme.inputBg} ${activeTheme.inputBorder} ${activeTheme.inputText} ${activeTheme.ring}`}
                                            />
                                        </label>

                                        <label className="space-y-1.5">
                                            <span className={`text-sm ${activeTheme.title}`}>
                                                {t('Ortalama Dongu Uzunlugu', 'Average Cycle Length')}
                                            </span>
                                            <input
                                                type="number"
                                                min={20}
                                                max={40}
                                                value={averageCycleLength}
                                                onChange={(e) => setAverageCycleLength(e.target.value)}
                                                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${activeTheme.inputBg} ${activeTheme.inputBorder} ${activeTheme.inputText} ${activeTheme.ring}`}
                                            />
                                        </label>
                                    </>
                                )}

                                <label className="block space-y-1.5">
                                    <span className={`text-sm font-medium ${activeTheme.title}`}>{t('Boy (cm)', 'Height (cm)')}</span>
                                    <input
                                        type="number"
                                        min={1}
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${activeTheme.inputBg} ${activeTheme.inputBorder} ${activeTheme.inputText} ${activeTheme.ring}`}
                                        placeholder="165"
                                    />
                                </label>

                                <label className="block space-y-1.5">
                                    <span className={`text-sm font-medium ${activeTheme.title}`}>{t('Kilo (kg)', 'Weight (kg)')}</span>
                                    <input
                                        type="number"
                                        min={1}
                                        value={currentWeight}
                                        onChange={(e) => setCurrentWeight(e.target.value)}
                                        className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${activeTheme.inputBg} ${activeTheme.inputBorder} ${activeTheme.inputText} ${activeTheme.ring}`}
                                        placeholder="72"
                                    />
                                </label>
                            </div>

                            <div className="space-y-2">
                                <span className={`text-sm font-medium ${activeTheme.title}`}>
                                    {t('Aktivite Duzeyi (Egzersiz Sikligi)', 'Activity Level (Exercise Frequency)')}
                                </span>
                                <div className="space-y-2">
                                    {ACTIVITY_OPTIONS.map((option) => {
                                        const selected = option.value === activityLevel;
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setActivityLevel(option.value)}
                                                className={[
                                                    'w-full rounded-xl border px-4 py-3 text-left transition',
                                                    selected
                                                        ? `border-emerald-500 ring-2 ring-emerald-500 ${activeTheme.recommendationSurface}`
                                                        : `${activeTheme.inputBorder} ${activeTheme.inputBg}`,
                                                ].join(' ')}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className={`font-semibold ${activeTheme.title}`}>
                                                        {language === 'tr' ? option.labelTr : option.labelEn}
                                                    </p>
                                                    <p className={`text-xs ${activeTheme.subtitle}`}>
                                                        {language === 'tr' ? option.descriptionTr : option.descriptionEn}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5">
                            <h2 className={`text-sm font-semibold uppercase tracking-wide ${activeTheme.subtitle}`}>
                                {t('Adim 2: Metabolizma Raporu', 'Step 2: Metabolism Report')}
                            </h2>
                            <p className={`text-sm ${activeTheme.subtitle}`}>
                                {t(
                                    'Burasi bedeninin pusulasi. Rakamlar seni yargilamak icin degil, daha saglikli bir yol cizmek icin var.',
                                    'These numbers are your compass for a safer plan.'
                                )}
                            </p>

                            <div className={`rounded-2xl border p-5 ${activeTheme.recommendationSurface}`}>
                                <p className={`text-xs uppercase tracking-wide ${activeTheme.subtitle}`}>{t('Rapor', 'Report')}</p>

                                <div className="mt-4 space-y-4">
                                    <div className={`rounded-xl border p-4 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
                                        <p className={`text-xs ${activeTheme.subtitle}`}>BMR</p>
                                        <p className={`mt-1 text-2xl font-bold ${activeTheme.title}`}>{bmr ? `${bmr.toFixed(0)} kcal` : '--'}</p>
                                        <p className={`mt-2 text-sm ${activeTheme.subtitle}`}>
                                            {t(
                                                'Tam dinlenmede bile bedeninin calismasi icin gerekli taban enerji. Bu esigin altina inmek hizlandirmaz, sadece bedeni zorlar.',
                                                'Your base energy need at complete rest. Going under this makes things harder, not better.'
                                            )}
                                        </p>
                                        <div className="mt-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2">
                                            <p className="text-sm font-semibold text-rose-800">
                                                {t(
                                                    'Bazal metabolizmanin altina dusmek metabolizmani yavaslatir.',
                                                    'Going below BMR can slow your metabolism.'
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`rounded-xl border p-4 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
                                        <p className={`text-xs ${activeTheme.subtitle}`}>TDEE</p>
                                        <p className={`mt-1 text-2xl font-bold ${activeTheme.title}`}>
                                            {draftStats ? `${draftStats.TDEE.toFixed(0)} kcal` : '--'}
                                        </p>
                                        <p className={`mt-2 text-sm ${activeTheme.subtitle}`}>
                                            {t(
                                                'Gun boyu hareketlerinle birlikte toplam ihtiyacin. Bu civarda kaldiginda kilo genelde sabitlenir; antrenmanla yag-kas dagilimi yine degisebilir.',
                                                'Your total daily need with activity. Around this level, weight tends to stay stable while body composition can still improve.'
                                            )}
                                        </p>
                                    </div>

                                    <div className={`rounded-xl border p-4 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
                                        <p className={`text-xs ${activeTheme.subtitle}`}>{t('Ideal Kalori + Ideal Kilo', 'Ideal Calories + Ideal Weight')}</p>
                                        <p className={`mt-1 text-2xl font-bold ${activeTheme.title}`}>
                                            {idealPlanInfo ? `${idealPlanInfo.intake.toFixed(0)} kcal` : '--'}
                                            {' / '}
                                            {idealWeight !== null ? `${idealWeight.toFixed(1)} kg` : '--'}
                                        </p>
                                        <p className={`mt-2 text-sm ${activeTheme.subtitle}`}>
                                            {t(
                                                'Hedefledigimiz degisimi yakalamak icin haftalik ortalamada bu kalori cizgisini takip etmeni oneririz.',
                                                'To reach the desired change, aim around this calorie line in your weekly average.'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className={`rounded-xl border px-4 py-3 ${activeTheme.subtleSurface}`}>
                                    <p className={`text-xs ${activeTheme.subtitle}`}>
                                        {t('Minimum:', 'Minimum:')}{' '}
                                        <span className={`font-semibold ${activeTheme.title}`}>
                                            {bmr ? `${bmr.toFixed(0)} kcal` : '--'}
                                        </span>
                                    </p>
                                </div>
                                <div className={`rounded-xl border px-4 py-3 ${activeTheme.subtleSurface}`}>
                                    <p className={`text-xs ${activeTheme.subtitle}`}>
                                        {t('Sabit Kalmak Icin:', 'To Stay Stable:')}{' '}
                                        <span className={`font-semibold ${activeTheme.title}`}>
                                            {draftStats ? `${draftStats.TDEE.toFixed(0)} kcal` : '--'}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <h2 className={`text-sm font-semibold uppercase tracking-wide ${activeTheme.subtitle}`}>
                                {t('Adim 3: Hedefini Belirle', 'Step 3: Set Your Goal')}
                            </h2>

                            <div className="space-y-4">
                                <div className={`rounded-2xl border p-4 ${activeTheme.recommendationSurface}`}>
                                    <p className="text-base font-bold tracking-wide text-emerald-700">
                                        {t('Onerilen Plan', 'Recommended Plan')}
                                    </p>
                                    {idealPlanInfo ? (
                                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_0.9fr]">
                                            <div className={`self-center space-y-3 text-lg leading-relaxed ${activeTheme.subtitle}`}>
                                                <p className="pl-5">
                                                    {t('Ideal Kilo:', 'Ideal Weight:')}{' '}
                                                    <span className="text-[1.15rem] font-bold text-emerald-700">
                                                        {idealWeight?.toFixed(1)} kg
                                                    </span>
                                                </p>
                                                <p className="pl-5">
                                                    {t('Onerilen Sure:', 'Suggested Duration:')}{' '}
                                                    <span className="text-[1.15rem] font-bold text-emerald-700">
                                                        {idealPlanInfo.safeMonthOffset} ay
                                                    </span>
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <div className={`rounded-xl border p-5 text-center ${activeTheme.energySurface}`}>
                                                    <p className={`text-sm ${activeTheme.subtitle}`}>{t('Gunluk Kalori', 'Daily Calories')}</p>
                                                    <p className="mt-1 text-4xl font-extrabold text-emerald-600">
                                                        {idealPlanInfo.intake.toFixed(0)}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={chooseRecommendedPlan}
                                                    disabled={idealWeight === null}
                                                    className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-300 ${activeTheme.accentBtn}`}
                                                >
                                                    {t('Onerilen Plani Kullan', 'Use Recommended Plan')}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className={`mt-3 text-sm ${activeTheme.subtitle}`}>
                                            {t('Onceki adimi tamamladiginda oneriyi goreceksin.', 'You will see recommendation after Step 1.')}
                                        </p>
                                    )}
                                </div>

                                <div className={`rounded-2xl border p-4 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}>
                                    <p className={`text-xs font-semibold uppercase tracking-wide ${activeTheme.subtitle}`}>
                                        {t('Kendi Planini Olustur', 'Build Your Own Plan')}
                                    </p>

                                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_0.9fr]">
                                        <div className="space-y-3">
                                            <label className="block space-y-1.5">
                                                <span className={`text-sm font-medium ${activeTheme.title}`}>{t('Hedef Kilo (kg)', 'Target Weight (kg)')}</span>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={targetWeight}
                                                    onChange={(e) => {
                                                        setTargetWeightTouched(true);
                                                        setTargetWeight(e.target.value);
                                                    }}
                                                    className={`w-full sm:max-w-80 rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${activeTheme.inputBg} ${activeTheme.inputBorder} ${activeTheme.inputText} ${activeTheme.ring}`}
                                                />
                                            </label>

                                            <label className="block space-y-1.5">
                                                <span className={`text-sm font-medium ${activeTheme.title}`}>{t('Hedef Ay', 'Target Month')}</span>
                                                <select
                                                    value={selectedMonthOffset}
                                                    onChange={(e) => setSelectedMonthOffset(Number(e.target.value))}
                                                    className={`w-full sm:max-w-80 rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${activeTheme.inputBg} ${activeTheme.inputBorder} ${activeTheme.inputText} ${activeTheme.ring}`}
                                                >
                                                    {monthOptions.map((offset) => (
                                                        <option key={offset} value={offset}>
                                                            {`${offset} ay sonra - ${formatMonthLabel(addMonthsKeepingDay(today, offset))}`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className={`rounded-xl border p-5 text-center ${activeTheme.energySurface}`}>
                                                <p className={`text-sm ${activeTheme.subtitle}`}>{t('Gunluk Kalori', 'Daily Calories')}</p>
                                                <p className="mt-1 text-4xl font-extrabold text-emerald-600">
                                                    {preview ? preview.requiredDailyCalories.toFixed(0) : '--'}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={chooseManualPlan}
                                                disabled={!canSave}
                                                className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-300 ${activeTheme.accentBtn}`}
                                            >
                                                {t('Kendi Planini Sec', 'Choose Your Plan')}
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
                    )}

                    <div className="mt-6 flex items-center justify-between">
                        <button
                            type="button"
                            disabled={step === 1}
                            onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev))}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${activeTheme.inputBorder} ${activeTheme.title} hover:bg-slate-100`}
                        >
                            {t('Geri', 'Back')}
                        </button>

                        {step < 3 ? (
                            <button
                                type="button"
                                disabled={(step === 1 && !canContinueStep1) || (step === 2 && !canContinueStep2)}
                                onClick={() => setStep((prev) => (prev < 3 ? ((prev + 1) as WizardStep) : prev))}
                                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-300 ${activeTheme.accentBtn}`}
                            >
                                {t('Ileri', 'Next')}
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
