import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X, ChevronDown, User, Target, Heart } from 'lucide-react';
import { resolveTheme, type DashTheme } from '../../constants/themes';
import { addMonthsKeepingDay, formatDateInput, formatMonthLabel, startOfDay } from '../../utils/dateUtils';
import { calculateBMR } from '../../utils/healthEngine';
import { useDailyCalorieTarget, useUserStore } from '../../store/useUserStore';
import { useToastStore } from '../../store/useToastStore';
import { CycleCalendar } from './CycleCalendar';
import { PROFILE_COPY } from './profileCopy';
import { WeightChart } from './WeightChart';
import { WeightHistoryList } from './WeightHistoryList';
import { ACTIVITY_OPTIONS } from '../../views/Onboarding/onboardingHelpers';
import {
    buildDraftStats,
    buildGoalDraft,
    buildProfileSnapshot,
    createInitialDraft,
    getBmiLabel,
    getBmiTone,
    getInitialMonthOffset,
    getMinimumMonthOffset,
    getMonthOptions,
    getTargetDateFromOffset,
    parseDraftNumbers,
    validateProfileDraft,
    type ProfileDraftState,
} from './profileHelpers';

interface Props {
    open: boolean;
    onClose: () => void;
}

export function ProfileSheet({ open, onClose }: Props) {
    const stats = useUserStore((s) => s.stats);
    const goal = useUserStore((s) => s.goal);
    const language = useUserStore((s) => s.language);
    const waterTarget = useUserStore((s) => s.waterTarget);
    const weightLog = useUserStore((s) => s.weightLog);
    const setStats = useUserStore((s) => s.setStats);
    const setGoal = useUserStore((s) => s.setGoal);
    const setLanguage = useUserStore((s) => s.setLanguage);
    const setWaterTarget = useUserStore((s) => s.setWaterTarget);
    const clearAll = useUserStore((s) => s.clearAll);

    const [activeTab, setActiveTab] = useState<'profile' | 'weight'>('profile');

    if (!open) return null;
    const formKey = JSON.stringify({ stats, goal, waterTarget, language });
    return createPortal(
        <ProfileSheetContent
            key={formKey}
            stats={stats} goal={goal} language={language}
            waterTarget={waterTarget} weightLog={weightLog}
            activeTab={activeTab} setActiveTab={setActiveTab}
            setStats={setStats} setGoal={setGoal}
            setLanguage={setLanguage} setWaterTarget={setWaterTarget}
            clearAll={clearAll} onClose={onClose}
        />,
        document.body
    );
}

function AccordionSection({
    id, icon: Icon, title, subtitle, isOpen, onToggle, children, theme,
}: Readonly<{
    id: string; icon: React.ElementType; title: string; subtitle: string;
    isOpen: boolean; onToggle: () => void; children: React.ReactNode; theme: DashTheme;
}>) {
    return (
        <div className={`rounded-2xl border transition-all ${theme.cardBorder} ${theme.cardBg}`}>
            <button
                type="button"
                id={`accordion-${id}`}
                onClick={onToggle}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:opacity-80"
            >
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${theme.accentSoft} ${theme.accent}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${theme.title}`}>{title}</p>
                    <p className={`text-xs ${theme.subtitle}`}>{subtitle}</p>
                </div>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${theme.subtitle}`} />
            </button>
            {isOpen && (
                <div className={`border-t px-5 pb-5 pt-4 ${theme.cardBorder}`}>
                    {children}
                </div>
            )}
        </div>
    );
}

function FieldRow({ label, error, children, unit, htmlFor }: Readonly<{ label: string; error?: string; children: React.ReactNode; unit?: string; htmlFor?: string }>) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <label htmlFor={htmlFor} className="text-xs font-medium text-current opacity-70">{label}</label>
                {unit && <span className="text-[10px] opacity-50">{unit}</span>}
            </div>
            {children}
            {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
    );
}

interface ProfileSheetContentProps {
    stats: ReturnType<typeof useUserStore.getState>['stats'];
    goal: ReturnType<typeof useUserStore.getState>['goal'];
    language: 'tr' | 'en';
    waterTarget: number;
    weightLog: ReturnType<typeof useUserStore.getState>['weightLog'];
    activeTab: 'profile' | 'weight';
    setActiveTab: React.Dispatch<React.SetStateAction<'profile' | 'weight'>>;
    setStats: ReturnType<typeof useUserStore.getState>['setStats'];
    setGoal: ReturnType<typeof useUserStore.getState>['setGoal'];
    setLanguage: ReturnType<typeof useUserStore.getState>['setLanguage'];
    setWaterTarget: ReturnType<typeof useUserStore.getState>['setWaterTarget'];
    clearAll: ReturnType<typeof useUserStore.getState>['clearAll'];
    onClose: () => void;
}

function ProfileSheetContent({ stats, goal, language, waterTarget, weightLog, activeTab, setActiveTab, setStats, setGoal, setLanguage, setWaterTarget, clearAll, onClose }: Readonly<ProfileSheetContentProps>) {
    const addToast = useToastStore((s) => s.addToast);
    const today = useMemo(() => startOfDay(new Date()), []);
    const initialDraft = useMemo(
        () => createInitialDraft({ stats, goal, email: '', language, waterTarget }),
        [goal, language, stats, waterTarget]
    );
    const [draft, setDraft] = useState<ProfileDraftState>(initialDraft);
    const [selectedMonthOffset, setSelectedMonthOffset] = useState(() => getInitialMonthOffset(goal?.targetDate, today));
    const [chartTimeRange, setChartTimeRange] = useState<'month' | 'all'>('month');
    const [openSection, setOpenSection] = useState<string | null>(null);
    const [isActivityDropdownOpen, setIsActivityDropdownOpen] = useState(false);

    const previewTheme = resolveTheme();
    const idPrefix = 'profile-sheet';
    const fieldId = (name: string) => `${idPrefix}-${name}`;
    const copy = PROFILE_COPY[draft.language as 'tr' | 'en'];
    const inputBase = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${previewTheme.inputBg} ${previewTheme.inputBorder} ${previewTheme.inputText} ${previewTheme.ring} focus:ring-1`;

    const parsedDraft = useMemo(() => parseDraftNumbers(draft), [draft]);
    const validationErrors = useMemo(() => validateProfileDraft(draft, parsedDraft, copy), [copy, draft, parsedDraft]);
    const canSave = Object.keys(validationErrors).length === 0;
    const baseStats = useMemo(() => buildDraftStats(stats, draft, parsedDraft), [draft, parsedDraft, stats]);
    const bmi = baseStats ? baseStats.currentWeight / Math.pow(baseStats.height / 100, 2) : null;
    const bmiTone = getBmiTone(bmi, previewTheme);
    const bmiLabel = getBmiLabel(bmi, copy);
    const bmrValue = baseStats ? Math.round(calculateBMR(baseStats)).toString() : '--';
    const minMonthOffset = useMemo(() => getMinimumMonthOffset(baseStats, parsedDraft.targetWeight, today), [baseStats, parsedDraft.targetWeight, today]);
    const effectiveSelectedMonthOffset = Math.max(selectedMonthOffset, minMonthOffset);
    const goalTargetDate = getTargetDateFromOffset(today, effectiveSelectedMonthOffset);
    const goalDraft = useMemo(
        () => buildGoalDraft(parsedDraft.targetWeight, goalTargetDate, parsedDraft.weeklySportQuota),
        [goalTargetDate, parsedDraft.targetWeight, parsedDraft.weeklySportQuota]
    );
    const caloriePreview = useDailyCalorieTarget(baseStats, goalDraft);
    const monthOptions = useMemo(() => getMonthOptions(minMonthOffset, effectiveSelectedMonthOffset), [effectiveSelectedMonthOffset, minMonthOffset]);
    const initialSnapshot = useMemo(() => buildProfileSnapshot({ draft: initialDraft, targetDate: goal?.targetDate ?? '' }), [goal?.targetDate, initialDraft]);
    const currentSnapshot = useMemo(() => buildProfileSnapshot({ draft, targetDate: goalTargetDate }), [draft, goalTargetDate]);
    const isDirty = currentSnapshot !== initialSnapshot;
    const displayedTdee = baseStats ? Math.round(baseStats.TDEE).toString() : '--';

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
    }, [onClose]);

    const update = <K extends keyof ProfileDraftState>(key: K, value: ProfileDraftState[K]) =>
        setDraft((c) => ({ ...c, [key]: value }));

    const toggleSection = (id: string) => setOpenSection((c) => (c === id ? null : id));

    const handleSave = () => {
        if (!stats || !canSave || !baseStats || !goalDraft) return;
        setStats(baseStats);
        setGoal(goalDraft);
        setWaterTarget(parsedDraft.waterTarget);
        setLanguage(draft.language);
        addToast(draft.language === 'tr' ? 'Profil başarıyla güncellendi.' : 'Profile successfully updated.', 'success');
        onClose();
    };

    const handleReset = () => {
        if (globalThis.confirm(copy.resetConfirm)) { clearAll(); onClose(); }
    };

    const validationTitle = canSave ? '' : Object.values(validationErrors).join('\n');

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <button type="button" aria-label={copy.close} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <aside className={`relative flex h-full w-full max-w-lg flex-col shadow-2xl ${previewTheme.pageBg} animate-in slide-in-from-right duration-300`}>

                {/* Header */}
                <div className={`flex shrink-0 items-center justify-between border-b px-5 py-4 ${previewTheme.cardBorder} ${previewTheme.cardBg}`}>
                    <div>
                        <h2 className={`text-lg font-bold ${previewTheme.title}`}>Profil</h2>
                        {stats?.name && <p className={`text-xs ${previewTheme.subtitle}`}>{stats.name}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!canSave || !isDirty}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-40 ${previewTheme.accentBtn}`}
                            title={validationTitle}
                        >
                            {copy.save}
                        </button>
                        <button type="button" onClick={onClose} aria-label={copy.close} className={`grid h-9 w-9 place-items-center rounded-full border transition ${previewTheme.cardBorder} ${previewTheme.mutedSurface} hover:opacity-80`}>
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className={`flex shrink-0 border-b ${previewTheme.cardBorder} ${previewTheme.cardBg}`}>
                    {(['profile', 'weight'] as const).map((tab) => {
                        const tabTone = activeTab === tab
                            ? `${previewTheme.accent} border-b-2 border-current`
                            : previewTheme.subtitle;
                        return (
                            <button
                                key={tab}
                                className={`flex-1 py-3 text-sm font-semibold transition ${tabTone}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'profile' ? copy.tabProfile : copy.tabWeight}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#828A7E]/30 hover:[&::-webkit-scrollbar-thumb]:bg-[#828A7E]/50">
                    {activeTab === 'profile' && (
                        <>
                            {/* Stats Bar */}
                            <div className={`grid grid-cols-3 gap-2 rounded-2xl border p-3 ${previewTheme.cardBorder} ${previewTheme.cardBg}`}>
                                {[
                                    { label: 'BMI', value: bmi ? bmi.toFixed(1) : '--', sub: bmiLabel, cls: bmiTone.text },
                                    { label: 'TDEE', value: displayedTdee, sub: 'kcal/gün', cls: previewTheme.title },
                                    { label: 'BMR', value: bmrValue, sub: 'bazal', cls: previewTheme.title },
                                ].map((s) => (
                                    <div key={s.label} className={`rounded-xl p-3 text-center ${previewTheme.mutedSurface}`}>
                                        <p className={`text-[10px] font-semibold uppercase tracking-wide ${previewTheme.subtitle}`}>{s.label}</p>
                                        <p className={`text-xl font-bold mt-1 ${s.cls}`}>{s.value}</p>
                                        <p className={`text-[10px] mt-0.5 ${previewTheme.subtitle}`}>{s.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Kişisel Bilgiler Accordion */}
                            <AccordionSection
                                id="personal" icon={User}
                                title={copy.sectionPersonal}
                                subtitle={copy.sectionPersonalDesc}
                                isOpen={openSection === 'personal'}
                                onToggle={() => toggleSection('personal')}
                                theme={previewTheme}
                            >
                                <div className="space-y-4">
                                    {/* Ad + Cinsiyet */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <FieldRow label={copy.name} htmlFor={fieldId('name')}>
                                            <input
                                                type="text"
                                                id={fieldId('name')}
                                                value={draft.name}
                                                onChange={(e) => update('name', e.target.value)}
                                                className={inputBase}
                                                placeholder="Adın"
                                            />
                                        </FieldRow>
                                        <FieldRow label={copy.gender} htmlFor={fieldId('gender')}>
                                            <select
                                                id={fieldId('gender')}
                                                value={draft.gender}
                                                onChange={(e) => {
                                                    const g = e.target.value as 'male' | 'female';
                                                    update('gender', g);
                                                    if (g === 'male') update('cycleEnabled', false);
                                                }}
                                                className={inputBase}
                                            >
                                                <option value="male">{copy.genderMale}</option>
                                                <option value="female">{copy.genderFemale}</option>
                                            </select>
                                        </FieldRow>
                                    </div>

                                    {/* Kilo + Boy + Yaş */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <FieldRow label={copy.weight} unit="kg" error={validationErrors.weight} htmlFor={fieldId('weight')}>
                                            <input id={fieldId('weight')} type="number" min="1" value={draft.weight} onChange={(e) => update('weight', e.target.value)} className={inputBase} />
                                        </FieldRow>
                                        <FieldRow label={copy.height} unit="cm" error={validationErrors.height} htmlFor={fieldId('height')}>
                                            <input id={fieldId('height')} type="number" min="1" value={draft.height} onChange={(e) => update('height', e.target.value)} className={inputBase} />
                                        </FieldRow>
                                        <FieldRow label={copy.age} error={validationErrors.age} htmlFor={fieldId('age')}>
                                            <input id={fieldId('age')} type="number" min="1" value={draft.age} onChange={(e) => update('age', e.target.value)} className={inputBase} />
                                        </FieldRow>
                                    </div>

                                    {/* Aktivite Seviyesi */}
                                    <FieldRow label={copy.activityLevel}>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsActivityDropdownOpen(!isActivityDropdownOpen)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition ${previewTheme.inputBg} ${previewTheme.inputBorder} focus:ring-1 ${previewTheme.ring}`}
                                            >
                                                <span className={`text-sm font-semibold ${previewTheme.inputText}`}>
                                                    {draft.language === 'tr'
                                                        ? ACTIVITY_OPTIONS.find(o => o.value === draft.activityLevel)?.labelTr
                                                        : ACTIVITY_OPTIONS.find(o => o.value === draft.activityLevel)?.labelEn}
                                                </span>
                                                <div className="flex items-center gap-2 max-w-[60%]">
                                                    <span className={`text-[11px] truncate text-right ${previewTheme.subtitle}`}>
                                                        {draft.language === 'tr'
                                                            ? ACTIVITY_OPTIONS.find(o => o.value === draft.activityLevel)?.descriptionTr
                                                            : ACTIVITY_OPTIONS.find(o => o.value === draft.activityLevel)?.descriptionEn}
                                                    </span>
                                                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isActivityDropdownOpen ? 'rotate-180' : ''} ${previewTheme.subtitle}`} />
                                                </div>
                                            </button>

                                            {isActivityDropdownOpen && (
                                                <div className={`absolute z-10 w-full mt-1.5 rounded-xl border shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${previewTheme.cardBorder} ${previewTheme.dropdownBg}`}>
                                                    <div className="max-h-60 overflow-y-auto divide-y divide-current/5">
                                                        {ACTIVITY_OPTIONS.map((opt) => (
                                                            <button
                                                                key={opt.value}
                                                                type="button"
                                                                onClick={() => {
                                                                    update('activityLevel', opt.value);
                                                                    setIsActivityDropdownOpen(false);
                                                                }}
                                                                className={`w-full flex items-center justify-between px-4 py-3 text-left transition hover:bg-black/5 dark:hover:bg-white/5 ${draft.activityLevel === opt.value ? 'bg-black/5 dark:bg-white/5' : ''}`}
                                                            >
                                                                <span className={`text-sm font-semibold ${previewTheme.inputText}`}>
                                                                    {draft.language === 'tr' ? opt.labelTr : opt.labelEn}
                                                                </span>
                                                                <span className={`text-[11px] max-w-[60%] truncate text-right ${previewTheme.subtitle}`}>
                                                                    {draft.language === 'tr' ? opt.descriptionTr : opt.descriptionEn}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </FieldRow>
                                </div>
                            </AccordionSection>

                            {/* Hedef & Plan Accordion */}
                            <AccordionSection
                                id="goal" icon={Target}
                                title={copy.sectionGoal}
                                subtitle={copy.sectionGoalDesc}
                                isOpen={openSection === 'goal'}
                                onToggle={() => toggleSection('goal')}
                                theme={previewTheme}
                            >
                                <div className="space-y-4">
                                    {caloriePreview && (
                                        <div className={`rounded-xl px-3 py-2 text-sm font-semibold text-center ${previewTheme.accentSoft} ${previewTheme.accent}`}>
                                            Günlük Hedef: {Math.round(caloriePreview.requiredDailyCalories)} kcal
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <FieldRow label={copy.targetWeight} unit="kg" error={validationErrors.targetWeight} htmlFor={fieldId('targetWeight')}>
                                            <input id={fieldId('targetWeight')} type="number" min="1" value={draft.targetWeight} onChange={(e) => update('targetWeight', e.target.value)} className={inputBase} />
                                        </FieldRow>
                                        <FieldRow label={copy.duration} htmlFor={fieldId('duration')}>
                                            <select
                                                id={fieldId('duration')}
                                                value={effectiveSelectedMonthOffset}
                                                onChange={(e) => setSelectedMonthOffset(Number(e.target.value))}
                                                className={inputBase}
                                            >
                                                {monthOptions.map((offset) => (
                                                    <option key={offset} value={offset}>
                                                        {offset} {copy.monthUnit} — {formatMonthLabel(addMonthsKeepingDay(today, offset))}
                                                    </option>
                                                ))}
                                            </select>
                                        </FieldRow>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FieldRow label={copy.sportDays} unit={copy.dayUnit} error={validationErrors.weeklySportQuota} htmlFor={fieldId('weeklySportQuota')}>
                                            <input id={fieldId('weeklySportQuota')} type="number" min="0" max="7" value={draft.weeklySportQuota} onChange={(e) => update('weeklySportQuota', e.target.value)} className={inputBase} />
                                        </FieldRow>
                                        <FieldRow label={copy.dailyWater} unit={copy.waterUnit} error={validationErrors.waterTarget} htmlFor={fieldId('waterTarget')}>
                                            <input id={fieldId('waterTarget')} type="number" min="100" step="100" value={draft.waterTarget} onChange={(e) => update('waterTarget', e.target.value)} className={inputBase} />
                                        </FieldRow>
                                    </div>
                                </div>
                            </AccordionSection>

                            {/* Adet Takvimi Accordion */}
                            {draft.gender === 'female' && (
                                <AccordionSection
                                    id="cycle" icon={Heart}
                                    title={copy.cycleTracking}
                                    subtitle={copy.cycleTrackingDescription}
                                    isOpen={openSection === 'cycle'}
                                    onToggle={() => toggleSection('cycle')}
                                    theme={previewTheme}
                                >
                                    <div className="space-y-4">
                                        <div className={`rounded-xl border p-3 ${previewTheme.cardBorder} ${previewTheme.mutedSurface}`}>
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm font-semibold ${previewTheme.title}`}>{copy.cycleTracking}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => update('cycleEnabled', !draft.cycleEnabled)}
                                                    aria-label={copy.cycleTracking}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${draft.cycleEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${draft.cycleEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                            </div>
                                            {draft.cycleEnabled && (
                                                <div className="mt-3 space-y-3">
                                                    <FieldRow label={copy.lastPeriodDate} error={validationErrors.lastPeriodDate} htmlFor={fieldId('lastPeriodDate')}>
                                                        <input
                                                            type="date"
                                                            id={fieldId('lastPeriodDate')}
                                                            max={formatDateInput(today)}
                                                            value={draft.lastPeriodDate}
                                                            onChange={(e) => update('lastPeriodDate', e.target.value)}
                                                            className={inputBase}
                                                        />
                                                    </FieldRow>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <FieldRow label={copy.cycleLength} unit={draft.language === 'tr' ? 'gün' : 'days'} error={validationErrors.cycleLength} htmlFor={fieldId('cycleLength')}>
                                                            <input
                                                                type="number"
                                                                id={fieldId('cycleLength')}
                                                                min="20"
                                                                max="40"
                                                                placeholder="28"
                                                                value={draft.cycleLength}
                                                                onChange={(e) => update('cycleLength', e.target.value)}
                                                                className={inputBase}
                                                            />
                                                        </FieldRow>
                                                        <FieldRow label={copy.periodLength} unit={draft.language === 'tr' ? 'gün' : 'days'} error={validationErrors.periodLength} htmlFor={fieldId('periodLength')}>
                                                            <input
                                                                type="number"
                                                                id={fieldId('periodLength')}
                                                                min="1"
                                                                max="15"
                                                                placeholder="6"
                                                                value={draft.periodLength}
                                                                onChange={(e) => update('periodLength', e.target.value)}
                                                                className={inputBase}
                                                            />
                                                        </FieldRow>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {draft.cycleEnabled && draft.lastPeriodDate && (
                                            <CycleCalendar
                                                theme={previewTheme}
                                                lastPeriodDate={draft.lastPeriodDate}
                                                cycleLength={Number(draft.cycleLength) || 28}
                                                periodLength={Number(draft.periodLength) || 6}
                                                language={draft.language as 'tr' | 'en'}
                                            />
                                        )}
                                    </div>
                                </AccordionSection>
                            )}

                            {/* Tehlikeli Alan */}
                            <div className={`rounded-2xl border p-4 ${previewTheme.dangerSurface} ${previewTheme.dangerBorder}`}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className={`text-sm font-semibold ${previewTheme.dangerText}`}>{copy.dangerTitle}</p>
                                        <p className={`text-xs mt-0.5 ${previewTheme.dangerText} opacity-70`}>{copy.dangerDescription}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${previewTheme.dangerBorder} ${previewTheme.dropdownBg} ${previewTheme.dangerText}`}
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        {copy.reset}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'weight' && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-end gap-2">
                                {(['month', 'all'] as const).map((r) => {
                                    const rangeTone = chartTimeRange === r
                                        ? previewTheme.accentBtn
                                        : `${previewTheme.mutedSurface} ${previewTheme.title}`;
                                    return (
                                        <button
                                            key={r}
                                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${previewTheme.cardBorder} ${rangeTone}`}
                                            onClick={() => setChartTimeRange(r)}
                                        >
                                            {r === 'month' ? copy.chartLastMonth : copy.chartAll}
                                        </button>
                                    );
                                })}
                            </div>
                            <WeightChart theme={previewTheme} data={weightLog} timeRange={chartTimeRange} language={draft.language} copy={copy} />
                            <WeightHistoryList />
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}
