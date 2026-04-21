import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    Bike,
    BookOpen,
    ChevronDown,
    Coffee,
    Cookie,
    Drumstick,
    Droplets,
    Dumbbell,
    Flame,
    Footprints,
    GlassWater,
    Milk,
    Pencil,
    Pizza,
    Plus,
    Trash2,
    User,
    Wine,
    X,
    Zap,
} from 'lucide-react';
import { useDailyCalorieTarget, useUserStore } from '../store/useUserStore';
import type { FoodItem, FoodUnit } from '../types';

type MealKey = 'kahvalti' | 'ogle' | 'aksam' | 'atistirmalik';
type EntryMode = 'library' | 'manual';
type ActiveSection = 'food' | 'water' | 'exercise';

const CIRCUMFERENCE = 289;

const T = {
    pageBg: 'bg-gradient-to-br from-[#eef7f2] via-[#f7f4ec] to-[#fdf8f1]',
    cardBg: 'bg-white/85 backdrop-blur-sm',
    cardBorder: 'border-emerald-100',
    title: 'text-slate-800',
    subtitle: 'text-slate-600',
    accent: 'text-emerald-700',
    accentSoft: 'bg-emerald-50',
    mutedSurface: 'bg-slate-50',
} satisfies Record<string, string>;

const MEAL_META: Array<{ key: MealKey; label: string; icon: LucideIcon; textTone: string; selectedTone: string; hoverTone: string }> = [
    { key: 'kahvalti', label: 'Kahvalti', icon: Coffee, textTone: 'text-amber-700', selectedTone: 'bg-amber-500 border-amber-500 text-white', hoverTone: 'hover:bg-amber-50' },
    { key: 'ogle', label: 'Ogle', icon: Pizza, textTone: 'text-orange-700', selectedTone: 'bg-orange-500 border-orange-500 text-white', hoverTone: 'hover:bg-orange-50' },
    { key: 'aksam', label: 'Aksam', icon: Drumstick, textTone: 'text-rose-700', selectedTone: 'bg-rose-500 border-rose-500 text-white', hoverTone: 'hover:bg-rose-50' },
    { key: 'atistirmalik', label: 'Atistirmalik', icon: Cookie, textTone: 'text-violet-700', selectedTone: 'bg-violet-500 border-violet-500 text-white', hoverTone: 'hover:bg-violet-50' },
];

const WATER_OPTIONS: Array<{ value: number; label: string; icon: LucideIcon }> = [
    { value: 100, label: '100 ml', icon: Coffee },
    { value: 200, label: '200 ml', icon: GlassWater },
    { value: 400, label: '400 ml', icon: Wine },
    { value: 500, label: '500 ml', icon: Milk },
    { value: 1000, label: '1 lt', icon: Droplets },
];

const EXERCISE_OPTIONS: Array<{ key: string; label: string; icon: LucideIcon }> = [
    { key: 'walk', label: 'Yürüyüş', icon: Footprints },
    { key: 'run', label: 'Koşu', icon: Activity },
    { key: 'strength', label: 'Güç', icon: Dumbbell },
    { key: 'bike', label: 'Bisiklet', icon: Bike },
    { key: 'hiit', label: 'Kardiyo', icon: Zap },
    { key: 'manual', label: 'Manuel', icon: Plus },
];

const BUILTIN_FOODS: FoodItem[] = [
    { id: 'kofte', name: 'Kofte', kcal: 180, protein: 14, carb: 4, fat: 12, unit: 'porsiyon' },
    { id: 'tavuk', name: 'Tavuk', kcal: 165, protein: 31, carb: 0, fat: 4, unit: 'porsiyon' },
    { id: 'yogurt', name: 'Yogurt', kcal: 90, protein: 5, carb: 8, fat: 3, unit: 'porsiyon' },
    { id: 'yumurta', name: 'Yumurta', kcal: 70, protein: 6, carb: 0, fat: 5, unit: 'porsiyon' },
    { id: 'pilav', name: 'Pilav (100g)', kcal: 130, protein: 3, carb: 28, fat: 1, unit: 'gram' },
    { id: 'ekmek', name: 'Ekmek', kcal: 80, protein: 3, carb: 15, fat: 1, unit: 'porsiyon' },
];

function todayString(): string {
    return new Date().toISOString().split('T')[0];
}

function toNumber(v: string): number {
    const n = Number(v.trim());
    return Number.isFinite(n) ? n : 0;
}

function formatNutrition(item: FoodItem): string {
    const parts = [`${Math.round(item.kcal)} kcal`];
    if (item.protein > 0) parts.push(`p:${Math.round(item.protein)}g`);
    if (item.carb > 0) parts.push(`k:${Math.round(item.carb)}g`);
    if (item.fat > 0) parts.push(`y:${Math.round(item.fat)}g`);
    return parts.join(' · ');
}

function formatWater(ml: number): string {
    if (ml <= 0) return '0 lt';
    if (ml < 1000) return `${ml} ml`;
    return `${(ml / 1000).toFixed(1)} lt`;
}

function barPct(current: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
}

const inputCls = `w-full rounded-xl border px-3 py-2.5 text-sm border-emerald-100 text-slate-800 bg-slate-50 outline-none focus:border-emerald-400`;

export default function Dashboard() {
    // ── Store ─────────────────────────────────────────────────────────────
    const logs = useUserStore((s) => s.logs);
    const personalFoods = useUserStore((s) => s.personalFoods);
    const storeAddFood = useUserStore((s) => s.addFoodToMeal);
    const addFoodToLibrary = useUserStore((s) => s.addFoodToLibrary);
    const deleteFromLibrary = useUserStore((s) => s.deleteFromLibrary);
    const addLog = useUserStore((s) => s.addLog);
    const updateLog = useUserStore((s) => s.updateLog);
    const addWaterEntry = useUserStore((s) => s.addWaterEntry);
    const removeWaterEntry = useUserStore((s) => s.removeWaterEntry);
    const updateWaterEntry = useUserStore((s) => s.updateWaterEntry);
    const clearAll = useUserStore((s) => s.clearAll);

    const calorieTarget = useDailyCalorieTarget();
    const targetKcal = Math.round(calorieTarget?.intake ?? 2000);
    const targetProtein = Math.round((targetKcal * 0.3) / 4);
    const targetCarb = Math.round((targetKcal * 0.4) / 4);
    const targetFat = Math.round((targetKcal * 0.3) / 9);

    const today = todayString();
    const todayLog = useMemo(() => logs.find((l) => l.date === today), [logs, today]);

    const todayTotals = useMemo(() => {
        const items = todayLog?.categories.flatMap((c) => c.items) ?? [];
        return {
            kcal: items.reduce((s, i) => s + i.kcal, 0),
            protein: items.reduce((s, i) => s + i.protein, 0),
            carb: items.reduce((s, i) => s + i.carb, 0),
            fat: items.reduce((s, i) => s + i.fat, 0),
        };
    }, [todayLog]);

    const todayMeals = useMemo<Record<MealKey, FoodItem[]>>(() => {
        const base: Record<MealKey, FoodItem[]> = { kahvalti: [], ogle: [], aksam: [], atistirmalik: [] };
        if (!todayLog) return base;
        for (const meal of MEAL_META) {
            const cat = todayLog.categories.find((c) => c.name === meal.label);
            base[meal.key] = cat?.items ?? [];
        }
        return base;
    }, [todayLog]);

    const libraryFoods = useMemo(() => {
        const builtinIds = new Set(BUILTIN_FOODS.map((f) => f.id));
        return [...BUILTIN_FOODS, ...personalFoods.filter((f) => !builtinIds.has(f.id))];
    }, [personalFoods]);

    const ringOffset = useMemo(() => {
        const pct = targetKcal > 0 ? Math.min(1, todayTotals.kcal / targetKcal) : 0;
        return Math.round(CIRCUMFERENCE * (1 - pct));
    }, [todayTotals.kcal, targetKcal]);

    const waterIntake = todayLog?.waterIntake ?? 0;
    const waterEntries = todayLog?.waterEntries ?? [];

    // ── UI State ──────────────────────────────────────────────────────────
    const [activeSection, setActiveSection] = useState<ActiveSection>('food');
    const [entryMode, setEntryMode] = useState<EntryMode>('library');
    const [selectedMeal, setSelectedMeal] = useState<MealKey>('kahvalti');

    // Food library entry
    const [selectedFoodId, setSelectedFoodId] = useState('');
    const [amountInput, setAmountInput] = useState('');
    const [showFoodPicker, setShowFoodPicker] = useState(false);

    // Manual food entry
    const [manualName, setManualName] = useState('');
    const [manualKcal, setManualKcal] = useState('');
    const [manualProtein, setManualProtein] = useState('');
    const [manualCarb, setManualCarb] = useState('');
    const [manualFat, setManualFat] = useState('');

    // Water
    const [selectedWaterPreset, setSelectedWaterPreset] = useState<number | null>(null);
    const [showWaterManual, setShowWaterManual] = useState(false);
    const [waterManualInput, setWaterManualInput] = useState('');

    // Exercise
    const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
    const [exManualName, setExManualName] = useState('');
    const [exManualDuration, setExManualDuration] = useState('');
    const [exManualCalories, setExManualCalories] = useState('');

    // Daily log expand
    const [openMeal, setOpenMeal] = useState<MealKey | null>(null);
    const [openWater, setOpenWater] = useState(false);
    const [editingWaterId, setEditingWaterId] = useState<string | null>(null);
    const [editingWaterValue, setEditingWaterValue] = useState('');

    // Food library panel
    const [showLibrary, setShowLibrary] = useState(false);
    const [libName, setLibName] = useState('');
    const [libUnit, setLibUnit] = useState<FoodUnit>('porsiyon');
    const [libKcal, setLibKcal] = useState('');
    const [libProtein, setLibProtein] = useState('');
    const [libCarb, setLibCarb] = useState('');
    const [libFat, setLibFat] = useState('');

    // ── Derived ───────────────────────────────────────────────────────────
    const selectedFood = useMemo(
        () => libraryFoods.find((f) => f.id === selectedFoodId) ?? null,
        [libraryFoods, selectedFoodId]
    );

    // Preview: porsiyon base=1, gram base=100
    const preview = useMemo(() => {
        if (!selectedFood) return null;
        const amount = toNumber(amountInput);
        if (amount <= 0) return null;
        const factor = selectedFood.unit === 'gram' ? amount / 100 : amount;
        return {
            kcal: Math.round(selectedFood.kcal * factor),
            protein: Math.round(selectedFood.protein * factor),
            carb: Math.round(selectedFood.carb * factor),
            fat: Math.round(selectedFood.fat * factor),
        };
    }, [selectedFood, amountInput]);

    const totalMealCount = Object.values(todayMeals).filter((i) => i.length > 0).length;
    const getMealLabel = (key: MealKey) => MEAL_META.find((m) => m.key === key)!.label;

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleAddFromLibrary = () => {
        if (!selectedFood || !preview) return;
        const amountLabel = selectedFood.unit === 'gram'
            ? `${amountInput}g`
            : `${amountInput} porsiyon`;
        storeAddFood(today, getMealLabel(selectedMeal), {
            id: `${selectedFood.id}-${Date.now()}`,
            name: `${selectedFood.name} (${amountLabel})`,
            kcal: preview.kcal,
            protein: preview.protein,
            carb: preview.carb,
            fat: preview.fat,
            unit: selectedFood.unit,
        });
        // Reset amount to default, keep food selected for easy repeat
        setAmountInput(selectedFood.unit === 'gram' ? '20' : '1');
    };

    const handleManualAdd = (saveToLib: boolean) => {
        const name = manualName.trim();
        const kcal = toNumber(manualKcal);
        if (!name || kcal <= 0) return;
        const food: FoodItem = {
            id: `manual-${Date.now()}`, name, kcal,
            protein: toNumber(manualProtein),
            carb: toNumber(manualCarb),
            fat: toNumber(manualFat),
            unit: 'porsiyon',
        };
        storeAddFood(today, getMealLabel(selectedMeal), food);
        if (saveToLib) {
            addFoodToLibrary({ ...food, id: `lib-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}` });
        }
        setManualName(''); setManualKcal(''); setManualProtein(''); setManualCarb(''); setManualFat('');
    };

    const ensureTodayLog = (updates: Partial<{ waterIntake: number; workoutDone: boolean }>) => {
        if (todayLog) updateLog(today, updates);
        else addLog({ date: today, categories: [], workoutDone: false, waterIntake: 0, waterEntries: [], ...updates });
    };

    const handleAddWater = () => {
        let amount = 0;
        if (showWaterManual) {
            amount = toNumber(waterManualInput);
            if (amount <= 0) return;
            setWaterManualInput('');
        } else if (selectedWaterPreset !== null) {
            amount = selectedWaterPreset;
        } else {
            return;
        }
        addWaterEntry(today, amount);
        setSelectedWaterPreset(null);
        setShowWaterManual(false);
    };

    const handleSetExercise = (key: string) => {
        setSelectedExercise(key);
        if (key !== 'manual') ensureTodayLog({ workoutDone: true });
    };

    const handleExerciseManual = () => {
        if (!exManualName.trim()) return;
        ensureTodayLog({ workoutDone: true });
        setExManualName(''); setExManualDuration(''); setExManualCalories('');
    };

    const handleSaveToLibrary = () => {
        const name = libName.trim();
        const kcal = toNumber(libKcal);
        if (!name || kcal <= 0) return;
        addFoodToLibrary({
            id: `lib-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            name, kcal, unit: libUnit,
            protein: toNumber(libProtein),
            carb: toNumber(libCarb),
            fat: toNumber(libFat),
        });
        setLibName(''); setLibKcal(''); setLibProtein(''); setLibCarb(''); setLibFat('');
    };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <>
            <main className={`min-h-screen p-4 sm:p-6 lg:p-8 ${T.pageBg}`}>
                <div className="mx-auto w-full max-w-6xl space-y-6">

                    {/* Header */}
                    <header className={`rounded-3xl border px-5 py-4 sm:px-6 sm:py-5 ${T.cardBg} ${T.cardBorder} shadow-sm`}>
                        <div className="flex items-center justify-between">
                            <h1 className={`text-2xl font-bold sm:text-3xl ${T.title}`}>MarkForm</h1>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    aria-label="Verileri Sil"
                                    onClick={() => { if (window.confirm('Tüm veriler silinsin mi?')) clearAll(); }}
                                    className="grid h-10 w-10 place-items-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                                >
                                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                                </button>
                                <button type="button" aria-label="Profil" className={`grid h-10 w-10 place-items-center rounded-full border ${T.cardBorder} ${T.mutedSurface} ${T.title}`}>
                                    <User className="h-5 w-5" strokeWidth={1.9} />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Daily Summary */}
                    <section className={`rounded-3xl border ${T.cardBg} ${T.cardBorder} shadow-sm`}>
                        <div className="flex divide-x divide-slate-200">
                            {/* Left — calorie ring + macros */}
                            <div className="flex-[1.7] p-5 sm:p-6">
                                <p className={`text-xs font-semibold uppercase tracking-wide ${T.subtitle}`}>Gunluk Ozet</p>
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36">
                                        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                                            <circle cx="60" cy="60" r="46" fill="none" strokeWidth="10" className="stroke-slate-200" />
                                            <circle cx="60" cy="60" r="46" fill="none" strokeWidth="10" strokeLinecap="round" className="stroke-emerald-600" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={ringOffset} />
                                        </svg>
                                        <div className="absolute inset-0 grid place-items-center text-center">
                                            <div>
                                                <p className={`text-xl font-bold sm:text-2xl ${T.title}`}>{Math.round(todayTotals.kcal)}</p>
                                                <p className={`text-xs ${T.subtitle}`}>/{targetKcal} kcal</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 self-center space-y-3">
                                        {[
                                            { label: 'Protein', current: todayTotals.protein, target: targetProtein, color: 'bg-emerald-500' },
                                            { label: 'Yag', current: todayTotals.fat, target: targetFat, color: 'bg-amber-500' },
                                            { label: 'Karb', current: todayTotals.carb, target: targetCarb, color: 'bg-sky-500' },
                                        ].map(({ label, current, target, color }) => (
                                            <div key={label}>
                                                <div className="mb-1 flex items-center justify-between text-xs">
                                                    <span className={T.subtitle}>{label}</span>
                                                    <span className={T.title}>{Math.round(current)}/{target}g</span>
                                                </div>
                                                <svg viewBox="0 0 100 8" className="h-2 w-full" aria-hidden="true">
                                                    <rect x="0" y="0" width="100" height="8" rx="4" className="fill-slate-200" />
                                                    <rect x="0" y="0" width={barPct(current, target)} height="8" rx="4" className={`transition-all ${color.replace('bg-', 'fill-')}`} />
                                                </svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Flame pill — centered */}
                                <div className="mt-4 flex justify-center">
                                    <p className={`inline-flex items-center gap-1.5 rounded-full px-5 py-1.5 text-sm font-semibold ${T.accent} ${T.accentSoft}`}>
                                        <Flame className="h-4 w-4" strokeWidth={2} />
                                        {Math.max(0, targetKcal - Math.round(todayTotals.kcal))} kcal kalan
                                    </p>
                                </div>
                            </div>

                            {/* Right — water + exercise */}
                            <div className="flex flex-1 flex-col divide-y divide-slate-200">
                                {/* Water */}
                                <div className="flex flex-1 items-center p-4 sm:p-5">
                                    <div className="flex-1">
                                        <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${T.subtitle}`}>SU</p>
                                        <p className={`mt-2 text-lg font-bold ${T.title}`}>{formatWater(waterIntake)}</p>
                                        <p className={`text-xs ${T.subtitle}`}>/ 2 lt hedef</p>
                                    </div>
                                    <div className="flex flex-1 items-center justify-center">
                                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50">
                                            <Droplets className="h-5 w-5 text-blue-500" strokeWidth={1.9} />
                                        </div>
                                    </div>
                                </div>
                                {/* Exercise */}
                                <div className="flex flex-1 items-center p-4 sm:p-5">
                                    <div className="flex-1">
                                        <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${T.subtitle}`}>EGZERSIZ</p>
                                        <p className={`mt-2 text-sm font-semibold ${T.title}`}>
                                            {todayLog?.workoutDone
                                                ? (selectedExercise && selectedExercise !== 'manual'
                                                    ? EXERCISE_OPTIONS.find((e) => e.key === selectedExercise)?.label ?? 'Yapildi'
                                                    : selectedExercise === 'manual' && exManualName
                                                        ? exManualName
                                                        : 'Yapildi')
                                                : 'Yapilmadi'}
                                        </p>
                                    </div>
                                    <div className="flex flex-1 items-center justify-center">
                                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100">
                                            <Dumbbell className="h-5 w-5 text-slate-500" strokeWidth={1.9} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Action Card */}
                    <section className={`rounded-3xl border p-5 sm:p-6 ${T.cardBg} ${T.cardBorder} shadow-sm`}>
                        {/* Section tabs */}
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            {([
                                { key: 'food', label: 'Yemek Ekle' },
                                { key: 'water', label: 'Su Ekle' },
                                { key: 'exercise', label: 'Egzersiz Ekle' },
                            ] as { key: ActiveSection; label: string }[]).map(({ key, label }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveSection(key)}
                                    className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${activeSection === key ? 'bg-emerald-600 text-white' : `border ${T.cardBorder} ${T.title} hover:bg-slate-50`}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* ── FOOD ─────────────────────────────────────── */}
                        {activeSection === 'food' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                    <div className="flex gap-5">
                                        {(['library', 'manual'] as EntryMode[]).map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setEntryMode(mode)}
                                                className={`pb-1 text-sm font-semibold transition ${entryMode === mode ? 'border-b-2 border-emerald-600 text-emerald-700' : T.subtitle}`}
                                            >
                                                {mode === 'library' ? 'Kayitli Besin' : 'Manuel Giris'}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowLibrary(true)}
                                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${T.cardBorder} ${T.accent} ${T.accentSoft}`}
                                    >
                                        <BookOpen className="h-3.5 w-3.5" />
                                        Yemek Listesi
                                    </button>
                                </div>

                                {/* Meal selector */}
                                <div className="grid grid-cols-4 gap-2">
                                    {MEAL_META.map((meal) => {
                                        const isActive = meal.key === selectedMeal;
                                        const Icon = meal.icon;
                                        return (
                                            <button
                                                key={meal.key}
                                                type="button"
                                                onClick={() => setSelectedMeal(meal.key)}
                                                className={`rounded-2xl border px-2 py-2.5 text-sm font-semibold transition ${isActive ? meal.selectedTone : `border-slate-200 bg-white ${meal.textTone} ${meal.hoverTone}`}`}
                                            >
                                                <span className="flex flex-col items-center gap-1">
                                                    <Icon className="h-4 w-4" strokeWidth={2} />
                                                    <span className="text-[12px]">{meal.label}</span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {entryMode === 'library' ? (
                                    <div className="space-y-3">
                                        {/* Two column: food picker (left) + amount (right) */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Food picker */}
                                            <div className="space-y-1">
                                                <p className={`text-xs font-medium ${T.subtitle}`}>Besin Sec</p>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onBlur={() => setTimeout(() => setShowFoodPicker(false), 150)}
                                                        onClick={() => setShowFoodPicker((p) => !p)}
                                                        className={`w-full flex items-center justify-between rounded-xl border px-3 py-3 text-sm transition ${T.cardBorder} ${T.mutedSurface} ${selectedFood ? T.title : T.subtitle}`}
                                                    >
                                                        <span className="truncate">{selectedFood ? selectedFood.name : 'Seciniz...'}</span>
                                                        <ChevronDown className={`ml-1 h-4 w-4 shrink-0 transition-transform ${showFoodPicker ? 'rotate-180' : ''}`} strokeWidth={2} />
                                                    </button>
                                                    {showFoodPicker && (
                                                        <div className={`absolute top-full left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-2xl border bg-white shadow-xl ${T.cardBorder}`}>
                                                            {libraryFoods.map((food) => (
                                                                <button
                                                                    key={food.id}
                                                                    type="button"
                                                                    onMouseDown={(e) => e.preventDefault()}
                                                                    onClick={() => {
                                                                        setSelectedFoodId(food.id);
                                                                        setAmountInput(food.unit === 'gram' ? '20' : '1');
                                                                        setShowFoodPicker(false);
                                                                    }}
                                                                    className={`w-full px-4 py-2.5 text-left text-sm transition ${selectedFoodId === food.id ? `${T.accentSoft} ${T.accent}` : `hover:bg-slate-50 ${T.title}`}`}
                                                                >
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <span className="font-medium">{food.name}</span>
                                                                        <span className={`shrink-0 text-xs ${T.subtitle}`}>
                                                                            {food.kcal} kcal/{food.unit === 'gram' ? '100g' : 'por.'}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Amount input */}
                                            <div className="space-y-1">
                                                <p className={`text-xs font-medium ${T.subtitle}`}>
                                                    {selectedFood?.unit === 'gram' ? 'Miktar (gram)' : 'Porsiyon'}
                                                </p>
                                                <input
                                                    type="number"
                                                    value={amountInput}
                                                    onChange={(e) => setAmountInput(e.target.value)}
                                                    min="0"
                                                    step={selectedFood?.unit === 'gram' ? '10' : '0.5'}
                                                    placeholder={selectedFood?.unit === 'gram' ? '20' : '1'}
                                                    disabled={!selectedFood}
                                                    className={`${inputCls} disabled:opacity-40`}
                                                />
                                            </div>
                                        </div>

                                        {/* Preview */}
                                        {preview && (
                                            <div className={`rounded-2xl border p-4 ${T.accentSoft} ${T.cardBorder}`}>
                                                <p className={`text-xs font-semibold uppercase tracking-wide ${T.subtitle}`}>Degerler</p>
                                                <div className={`mt-2 grid grid-cols-4 gap-2 text-sm ${T.title}`}>
                                                    <p>{preview.kcal} kcal</p>
                                                    <p>P: {preview.protein}g</p>
                                                    <p>K: {preview.carb}g</p>
                                                    <p>Y: {preview.fat}g</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleAddFromLibrary}
                                                    className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                                                >
                                                    Ekle
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <input type="text" value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="Besin adi" className={inputCls} />
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: 'Kalori', value: manualKcal, set: setManualKcal },
                                                { label: 'Protein (g)', value: manualProtein, set: setManualProtein },
                                                { label: 'Karbonhidrat (g)', value: manualCarb, set: setManualCarb },
                                                { label: 'Yag (g)', value: manualFat, set: setManualFat },
                                            ].map(({ label, value, set }) => (
                                                <label key={label} className="space-y-1">
                                                    <span className={`text-xs ${T.subtitle}`}>{label}</span>
                                                    <input type="number" value={value} onChange={(e) => set(e.target.value)} placeholder="0" className={inputCls} />
                                                </label>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button type="button" onClick={() => handleManualAdd(true)} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${T.cardBorder} ${T.title} hover:bg-slate-50 transition`}>
                                                Ekle + Kaydet
                                            </button>
                                            <button type="button" onClick={() => handleManualAdd(false)} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                                                Ekle
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── WATER ────────────────────────────────────── */}
                        {activeSection === 'water' && (
                            <div className="space-y-3">
                                <p className={`text-sm font-medium ${T.subtitle}`}>
                                    Bugün: <span className={`font-bold ${T.title}`}>{formatWater(waterIntake)}</span>
                                </p>
                                {/* 5 presets in grid */}
                                <div className="grid grid-cols-3 gap-2">
                                    {WATER_OPTIONS.map((opt) => {
                                        const Icon = opt.icon;
                                        const isSelected = selectedWaterPreset === opt.value && !showWaterManual;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => { setSelectedWaterPreset(opt.value); setShowWaterManual(false); }}
                                                className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 text-sm font-semibold transition ${isSelected
                                                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                                                    : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'}`}
                                            >
                                                <Icon className="h-5 w-5" strokeWidth={1.8} />
                                                <span className="text-xs">{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                    {/* Manuel button */}
                                    <button
                                        type="button"
                                        onClick={() => { setShowWaterManual((p) => !p); setSelectedWaterPreset(null); }}
                                        className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 text-sm font-semibold transition ${showWaterManual
                                            ? 'bg-blue-100 border-blue-400 text-blue-700'
                                            : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'}`}
                                    >
                                        <Plus className="h-5 w-5" strokeWidth={1.8} />
                                        <span className="text-xs">Manuel</span>
                                    </button>
                                </div>
                                {/* Manual input — only when clicked */}
                                {showWaterManual && (
                                    <input
                                        type="number"
                                        value={waterManualInput}
                                        onChange={(e) => setWaterManualInput(e.target.value)}
                                        placeholder="Miktar girin (ml)"
                                        className={inputCls}
                                        autoFocus
                                    />
                                )}
                                {/* Add button */}
                                <button
                                    type="button"
                                    onClick={handleAddWater}
                                    disabled={showWaterManual ? !waterManualInput : selectedWaterPreset === null}
                                    className="w-full rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Ekle
                                </button>
                            </div>
                        )}

                        {/* ── EXERCISE ─────────────────────────────────── */}
                        {activeSection === 'exercise' && (
                            <div className="space-y-3">
                                <p className={`text-sm font-medium ${T.subtitle}`}>
                                    Durum:{' '}
                                    <span className={`font-bold ${todayLog?.workoutDone ? 'text-emerald-700' : T.title}`}>
                                        {todayLog?.workoutDone ? 'Yapildi ✓' : 'Yapilmadi'}
                                    </span>
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {EXERCISE_OPTIONS.map((opt) => {
                                        const Icon = opt.icon;
                                        const isSelected = selectedExercise === opt.key;
                                        return (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                onClick={() => handleSetExercise(opt.key)}
                                                className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 text-sm font-semibold transition ${isSelected && todayLog?.workoutDone
                                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                                    : `${T.cardBorder} bg-white ${T.title} hover:bg-slate-50`}`}
                                            >
                                                <Icon className="h-5 w-5" strokeWidth={1.8} />
                                                <span className="text-xs">{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* Manuel form */}
                                {selectedExercise === 'manual' && (
                                    <div className={`space-y-2 rounded-2xl border p-3 ${T.cardBorder} ${T.mutedSurface}`}>
                                        <input
                                            type="text"
                                            value={exManualName}
                                            onChange={(e) => setExManualName(e.target.value)}
                                            placeholder="Egzersiz adi (zorunlu)"
                                            className={inputCls}
                                            autoFocus
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="number" value={exManualDuration} onChange={(e) => setExManualDuration(e.target.value)} placeholder="Sure (dakika)" className={inputCls} />
                                            <input type="number" value={exManualCalories} onChange={(e) => setExManualCalories(e.target.value)} placeholder="Kalori (kcal)" className={inputCls} />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleExerciseManual}
                                            disabled={!exManualName.trim()}
                                            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            Kaydet
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Today's Log */}
                    <section className={`rounded-3xl border p-5 sm:p-6 ${T.cardBg} ${T.cardBorder} shadow-sm`}>
                        <div className="mb-3 flex items-center gap-2">
                            <h2 className={`text-base font-semibold ${T.title}`}>Gunun Kayitlari</h2>
                            {totalMealCount > 0 && (
                                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-emerald-600 px-1 text-xs font-bold text-white">
                                    {totalMealCount}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            {/* Meal categories */}
                            {MEAL_META.filter((m) => todayMeals[m.key].length > 0).map((meal) => {
                                const items = todayMeals[meal.key];
                                const isOpen = openMeal === meal.key;
                                const Icon = meal.icon;
                                const mealKcal = items.reduce((s, i) => s + i.kcal, 0);
                                return (
                                    <div key={meal.key} className={`rounded-2xl border ${T.cardBorder} overflow-hidden`}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenMeal((p) => (p === meal.key ? null : meal.key))}
                                            className={`w-full px-4 py-3 text-left ${T.mutedSurface} hover:bg-slate-100 transition`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`h-4 w-4 ${meal.textTone}`} strokeWidth={2} />
                                                    <span className={`text-sm font-semibold ${T.title}`}>{meal.label}</span>
                                                    <span className={`text-xs ${T.subtitle}`}>{items.length} besin · {Math.round(mealKcal)} kcal</span>
                                                </div>
                                                <ChevronDown className={`h-4 w-4 transition-transform ${T.subtitle} ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                                            </div>
                                        </button>
                                        {isOpen && (
                                            <ul className="border-t border-slate-100 divide-y divide-slate-100">
                                                {items.map((item) => (
                                                    <li key={item.id} className="px-4 py-2.5 bg-white">
                                                        <p className={`text-sm font-semibold ${T.title}`}>{item.name}</p>
                                                        <p className={`text-xs mt-0.5 ${T.subtitle}`}>{formatNutrition(item)}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Water entries */}
                            {waterEntries.length > 0 && (
                                <div className={`rounded-2xl border ${T.cardBorder} overflow-hidden`}>
                                    <button
                                        type="button"
                                        onClick={() => setOpenWater((p) => !p)}
                                        className={`w-full px-4 py-3 text-left ${T.mutedSurface} hover:bg-slate-100 transition`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Droplets className="h-4 w-4 text-blue-500" strokeWidth={2} />
                                                <span className={`text-sm font-semibold ${T.title}`}>Su</span>
                                                <span className={`text-xs ${T.subtitle}`}>
                                                    {waterEntries.length} içim · {formatWater(waterIntake)}
                                                </span>
                                            </div>
                                            <ChevronDown className={`h-4 w-4 transition-transform ${T.subtitle} ${openWater ? 'rotate-180' : ''}`} strokeWidth={2} />
                                        </div>
                                    </button>
                                    {openWater && (
                                        <ul className="border-t border-slate-100 divide-y divide-slate-100">
                                            {waterEntries.map((entry) => (
                                                <li key={entry.id} className="flex items-center justify-between px-4 py-2.5 bg-white">
                                                    {editingWaterId === entry.id ? (
                                                        <div className="flex flex-1 items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={editingWaterValue}
                                                                onChange={(e) => setEditingWaterValue(e.target.value)}
                                                                title="Su miktari"
                                                                placeholder="ml"
                                                                className="w-24 rounded-lg border border-emerald-200 px-2 py-1 text-sm"
                                                                autoFocus
                                                            />
                                                            <span className={`text-xs ${T.subtitle}`}>ml</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const amt = toNumber(editingWaterValue);
                                                                    if (amt > 0) updateWaterEntry(today, entry.id, amt);
                                                                    setEditingWaterId(null);
                                                                }}
                                                                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                                                            >
                                                                Kaydet
                                                            </button>
                                                            <button type="button" aria-label="Iptal" onClick={() => setEditingWaterId(null)} className={T.subtitle}>
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className={`text-sm font-semibold ${T.title}`}>{formatWater(entry.amount)}</p>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    aria-label="Duzenle"
                                                                    onClick={() => { setEditingWaterId(entry.id); setEditingWaterValue(String(entry.amount)); }}
                                                                    className={`grid h-7 w-7 place-items-center rounded-full hover:bg-slate-100 ${T.subtitle}`}
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    aria-label="Sil"
                                                                    onClick={() => removeWaterEntry(today, entry.id)}
                                                                    className="grid h-7 w-7 place-items-center rounded-full hover:bg-rose-50 text-rose-400"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {totalMealCount === 0 && waterEntries.length === 0 && (
                                <p className={`rounded-xl border px-4 py-3 text-sm ${T.cardBorder} ${T.subtitle}`}>
                                    Bugun icin henuz kayit yok.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* ── FOOD LIBRARY MODAL ───────────────────────────────────────── */}
            {showLibrary && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowLibrary(false); }}
                >
                    <div className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
                        {/* Header */}
                        <div className={`sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4 bg-white ${T.cardBorder}`}>
                            <h2 className={`text-base font-bold ${T.title}`}>Yemek Listesi</h2>
                            <button type="button" aria-label="Kapat" onClick={() => setShowLibrary(false)} className={`grid h-9 w-9 place-items-center rounded-full border ${T.cardBorder} ${T.title}`}>
                                <X className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Add form */}
                            <div className={`rounded-2xl border p-4 space-y-3 ${T.cardBorder} ${T.accentSoft}`}>
                                <p className={`text-xs font-semibold uppercase tracking-wide ${T.subtitle}`}>Yeni Besin Ekle</p>
                                <input type="text" value={libName} onChange={(e) => setLibName(e.target.value)} placeholder="Besin adi" className={inputCls} />
                                {/* Unit toggle */}
                                <div className="flex gap-2">
                                    {(['porsiyon', 'gram'] as FoodUnit[]).map((u) => (
                                        <button
                                            key={u}
                                            type="button"
                                            onClick={() => setLibUnit(u)}
                                            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${libUnit === u ? 'bg-emerald-600 text-white' : `border border-slate-200 bg-white ${T.title}`}`}
                                        >
                                            {u === 'porsiyon' ? '1 Porsiyon başı' : '100 gram başı'}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: 'Kalori', value: libKcal, set: setLibKcal },
                                        { label: 'Protein (g)', value: libProtein, set: setLibProtein },
                                        { label: 'Karbonhidrat (g)', value: libCarb, set: setLibCarb },
                                        { label: 'Yag (g)', value: libFat, set: setLibFat },
                                    ].map(({ label, value, set }) => (
                                        <label key={label} className="space-y-1">
                                            <span className={`text-xs ${T.subtitle}`}>{label}</span>
                                            <input type="number" value={value} onChange={(e) => set(e.target.value)} placeholder="0" className={inputCls} />
                                        </label>
                                    ))}
                                </div>
                                <button type="button" onClick={handleSaveToLibrary} className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                                    Kaydet
                                </button>
                            </div>

                            {/* Food list */}
                            <div className="space-y-2">
                                <p className={`text-xs font-semibold uppercase tracking-wide ${T.subtitle}`}>Kayitli Besinler</p>
                                {libraryFoods.map((food) => {
                                    const isBuiltin = BUILTIN_FOODS.some((b) => b.id === food.id);
                                    return (
                                        <div key={food.id} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${T.cardBorder} bg-white`}>
                                            <div>
                                                <p className={`text-sm font-semibold ${T.title}`}>{food.name}</p>
                                                <p className={`text-xs mt-0.5 ${T.subtitle}`}>
                                                    {formatNutrition(food)} · {food.unit === 'gram' ? '100g başı' : 'porsiyon'}
                                                </p>
                                            </div>
                                            {!isBuiltin && (
                                                <button
                                                    type="button"
                                                    aria-label="Sil"
                                                    onClick={() => deleteFromLibrary(food.id)}
                                                    className="ml-3 grid h-8 w-8 shrink-0 place-items-center rounded-full text-rose-400 hover:bg-rose-50 transition"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
