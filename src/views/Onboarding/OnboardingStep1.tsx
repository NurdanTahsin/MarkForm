import type { DashTheme } from '../../constants/themes';
import { ACTIVITY_OPTIONS } from './onboardingHelpers';
import type { Gender } from './onboardingHelpers';
import { formatDateInput } from '../../utils/dateUtils';

interface Props {
    T: DashTheme;
    language: 'tr' | 'en';
    name: string; setName: (v: string) => void;
    age: string; setAge: (v: string) => void;
    height: string; setHeight: (v: string) => void;
    currentWeight: string; setCurrentWeight: (v: string) => void;
    gender: Gender; setGender: (v: Gender) => void;
    activityLevel: string; setActivityLevel: (v: string) => void;
    enableCycleTracking: boolean; setEnableCycleTracking: (v: boolean) => void;
    lastPeriodStartDate: string; setLastPeriodStartDate: (v: string) => void;
    averageCycleLength: string; setAverageCycleLength: (v: string) => void;
    today: Date;
}

export function OnboardingStep1({
    T, language,
    name, setName, age, setAge, height, setHeight, currentWeight, setCurrentWeight,
    gender, setGender, activityLevel, setActivityLevel,
    enableCycleTracking, setEnableCycleTracking, lastPeriodStartDate, setLastPeriodStartDate,
    averageCycleLength, setAverageCycleLength, today,
}: Readonly<Props>) {
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);
    const isFemale = gender === 'female';
    const cycleTrackingEnabled = gender === 'female' && enableCycleTracking;
    const inputCls = `w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${T.inputBg} ${T.inputBorder} ${T.inputText} ${T.ring}`;
    let cycleStatusLabel = t('Sadece kadınlar için', 'Female only');
    if (isFemale) {
        cycleStatusLabel = cycleTrackingEnabled ? t('Açık', 'On') : t('Kapalı', 'Off');
    }

    return (
        <div className="space-y-4">
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${T.subtitle}`}>
                {t('Adım 1: Temel Bilgiler', 'Step 1: Basic Info')}
            </h2>
            <p className={`text-sm ${T.subtitle}`}>
                {t(
                    'Seni daha iyi tanıyıp daha güvenli bir plan çıkarmamız için bu alanları birlikte dolduralım.',
                    'Let us fill these fields together for a safer plan.'
                )}
            </p>

            <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                    <span className={`text-sm font-medium ${T.title}`}>{t('Adın', 'Your Name')}</span>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder={t('İsim', 'Name')} />
                </label>

                <label className="block space-y-1.5">
                    <span className={`text-sm font-medium ${T.title}`}>{t('Yaş', 'Age')}</span>
                    <input type="number" min={1} value={age} onChange={(e) => setAge(e.target.value)} className={inputCls} placeholder="30" />
                </label>

                <label className="block space-y-1.5">
                    <span className={`text-sm font-medium ${T.title}`}>{t('Cinsiyet', 'Gender')}</span>
                    <select
                        value={gender}
                        onChange={(e) => {
                            const nextGender = e.target.value as Gender;
                            setGender(nextGender);
                            if (nextGender === 'male') setEnableCycleTracking(false);
                        }}
                        className={inputCls}
                    >
                        <option value="male">{t('Erkek', 'Male')}</option>
                        <option value="female">{t('Kadın', 'Female')}</option>
                    </select>
                </label>

                <div className="space-y-1.5">
                    <span className={`text-sm font-medium ${T.title}`}>{t('Döngü Takibi', 'Period Tracking')}</span>
                    <button
                        type="button"
                        disabled={!isFemale}
                        onClick={() => setEnableCycleTracking(!enableCycleTracking)}
                        className={[
                            `flex w-full items-center justify-between rounded-xl border px-4 py-3 transition ${T.inputBorder}`,
                            isFemale ? T.inputBg : 'cursor-not-allowed opacity-50',
                        ].join(' ')}
                    >
                        <span className={`flex items-center gap-2 text-sm font-semibold ${T.title}`}>
                            <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 2c2.5 3.6 7 8.8 7 12.4A7 7 0 0 1 5 14.4C5 10.8 9.5 5.6 12 2Z" />
                            </svg>
                            {t('Takibi Etkinleştir', 'Enable Tracking')}
                        </span>
                        <span className={`text-xs ${T.subtitle}`}>
                            {cycleStatusLabel}
                        </span>
                    </button>
                </div>

                {cycleTrackingEnabled && (
                    <>
                        <label className="space-y-1.5">
                            <span className={`text-sm ${T.title}`}>{t('Son Adet Başlangıç Tarihi', 'Last Period Start Date')}</span>
                            <input
                                type="date" value={lastPeriodStartDate} max={formatDateInput(today)}
                                onChange={(e) => setLastPeriodStartDate(e.target.value)} className={inputCls}
                            />
                        </label>
                        <label className="space-y-1.5">
                            <span className={`text-sm ${T.title}`}>{t('Ortalama Döngü Uzunluğu', 'Average Cycle Length')}</span>
                            <input
                                type="number" min={20} max={40} value={averageCycleLength}
                                onChange={(e) => setAverageCycleLength(e.target.value)} className={inputCls}
                            />
                        </label>
                    </>
                )}

                <label className="block space-y-1.5">
                    <span className={`text-sm font-medium ${T.title}`}>{t('Boy (cm)', 'Height (cm)')}</span>
                    <input type="number" min={1} value={height} onChange={(e) => setHeight(e.target.value)} className={inputCls} placeholder="165" />
                </label>

                <label className="block space-y-1.5">
                    <span className={`text-sm font-medium ${T.title}`}>{t('Kilo (kg)', 'Weight (kg)')}</span>
                    <input type="number" min={1} value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className={inputCls} placeholder="72" />
                </label>
            </div>

            {/* Aktivite düzeyi */}
            <div className="space-y-2">
                <span className={`text-sm font-medium ${T.title}`}>
                    {t('Aktivite Düzeyi (Egzersiz Sıklığı)', 'Activity Level (Exercise Frequency)')}
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
                                        ? `${T.cardBorder} ${T.ringProgress} ${T.recommendationSurface}`
                                        : `${T.inputBorder} ${T.inputBg}`,
                                ].join(' ')}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className={`font-semibold ${T.title}`}>{language === 'tr' ? option.labelTr : option.labelEn}</p>
                                    <p className={`text-xs ${T.subtitle}`}>{language === 'tr' ? option.descriptionTr : option.descriptionEn}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
