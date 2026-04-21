import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    ChevronDown,
    Coffee,
    Cookie,
    Drumstick,
    Droplets,
    Dumbbell,
    History,
    Pizza,
    User,
} from 'lucide-react';

type DashboardTheme = 'sageSoul' | 'lavenderDusk';
type MealKey = 'kahvalti' | 'ogle' | 'aksam' | 'atistirmalik';
type EntryMode = 'library' | 'manual';

type FoodEntry = {
    id: string;
    name: string;
    kcal: number;
    protein: number;
    carb: number;
    fat: number;
};

type LibraryFood = {
    id: string;
    name: string;
    kcal: number;
    protein: number;
    carb: number;
    fat: number;
};

type AmountOption = {
    value: string;
    label: string;
    multiplier: number;
};

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
        mutedSurface: string;
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
        mutedSurface: 'bg-slate-50',
    },
    lavenderDusk: {
        pageBg: 'bg-gradient-to-br from-[#f5f0ff] via-[#f8f2fb] to-[#fff4f6]',
        cardBg: 'bg-white/90 backdrop-blur-sm',
        cardBorder: 'border-violet-100',
        title: 'text-slate-800',
        subtitle: 'text-slate-600',
        accent: 'text-violet-700',
        accentSoft: 'bg-violet-50',
        mutedSurface: 'bg-slate-50',
    },
};

const MEAL_META: Array<{
    key: MealKey;
    label: string;
    icon: LucideIcon;
    textTone: string;
    selectedTone: string;
    hoverTone: string;
}> = [
        {
            key: 'kahvalti',
            label: 'Kahvalti',
            icon: Coffee,
            textTone: 'text-amber-700',
            selectedTone: 'bg-amber-500 border-amber-500 text-white',
            hoverTone: 'hover:bg-amber-100',
        },
        {
            key: 'ogle',
            label: 'Ogle',
            icon: Pizza,
            textTone: 'text-orange-700',
            selectedTone: 'bg-orange-500 border-orange-500 text-white',
            hoverTone: 'hover:bg-orange-100',
        },
        {
            key: 'aksam',
            label: 'Aksam',
            icon: Drumstick,
            textTone: 'text-rose-700',
            selectedTone: 'bg-rose-500 border-rose-500 text-white',
            hoverTone: 'hover:bg-rose-100',
        },
        {
            key: 'atistirmalik',
            label: 'Atistirmalik',
            icon: Cookie,
            textTone: 'text-violet-700',
            selectedTone: 'bg-violet-500 border-violet-500 text-white',
            hoverTone: 'hover:bg-violet-100',
        },
    ];

const AMOUNT_OPTIONS: AmountOption[] = [
    { value: '1-porsiyon', label: '1 porsiyon', multiplier: 1 },
    { value: '2-porsiyon', label: '2 porsiyon', multiplier: 2 },
    { value: '100-gram', label: '100 gram', multiplier: 1 },
    { value: '150-gram', label: '150 gram', multiplier: 1.5 },
];

const INITIAL_LIBRARY: LibraryFood[] = [
    { id: 'kofte', name: 'Kofte', kcal: 180, protein: 14, carb: 4, fat: 12 },
    { id: 'tavuk', name: 'Tavuk', kcal: 165, protein: 31, carb: 0, fat: 4 },
    { id: 'yogurt', name: 'Yogurt', kcal: 90, protein: 5, carb: 8, fat: 3 },
];

const INITIAL_TODAY_MEALS: Record<MealKey, FoodEntry[]> = {
    kahvalti: [{ id: 'seed-1', name: 'Yulaf', kcal: 240, protein: 9, carb: 38, fat: 6 }],
    ogle: [
        { id: 'seed-2', name: 'Pilav', kcal: 320, protein: 6, carb: 64, fat: 3 },
        { id: 'seed-3', name: 'Tavuk', kcal: 220, protein: 35, carb: 0, fat: 6 },
    ],
    aksam: [],
    atistirmalik: [],
};

function toNumber(value: string): number {
    const num = Number(value.trim());
    return Number.isFinite(num) ? num : 0;
}

function formatNutritionLine(item: FoodEntry): string {
    const parts: string[] = [`${Math.round(item.kcal)} kcal`];

    if (item.protein > 0) {
        parts.push(`p: ${Math.round(item.protein)}g`);
    }

    if (item.carb > 0) {
        parts.push(`k: ${Math.round(item.carb)}g`);
    }

    if (item.fat > 0) {
        parts.push(`y: ${Math.round(item.fat)}g`);
    }

    return parts.join(' | ');
}

export default function Dashboard() {
    const theme = DASHBOARD_THEMES.sageSoul;

    const [entryMode, setEntryMode] = useState<EntryMode>('library');
    const [selectedMeal, setSelectedMeal] = useState<MealKey>('kahvalti');
    const [selectedFoodId, setSelectedFoodId] = useState('');
    const [selectedAmount, setSelectedAmount] = useState('');

    const [manualName, setManualName] = useState('');
    const [manualKcal, setManualKcal] = useState('');
    const [manualProtein, setManualProtein] = useState('');
    const [manualCarb, setManualCarb] = useState('');
    const [manualFat, setManualFat] = useState('');

    const [libraryFoods, setLibraryFoods] = useState<LibraryFood[]>(INITIAL_LIBRARY);
    const [todayMeals, setTodayMeals] = useState<Record<MealKey, FoodEntry[]>>(INITIAL_TODAY_MEALS);
    const [openMeal, setOpenMeal] = useState<MealKey | null>('kahvalti');

    const selectedFood = useMemo(
        () => libraryFoods.find((item) => item.id === selectedFoodId) ?? null,
        [libraryFoods, selectedFoodId]
    );

    const amountMultiplier = useMemo(() => {
        const found = AMOUNT_OPTIONS.find((option) => option.value === selectedAmount);
        return found?.multiplier ?? 0;
    }, [selectedAmount]);

    const previewFromLibrary = useMemo(() => {
        if (!selectedFood || amountMultiplier <= 0) {
            return null;
        }

        return {
            kcal: selectedFood.kcal * amountMultiplier,
            protein: selectedFood.protein * amountMultiplier,
            carb: selectedFood.carb * amountMultiplier,
            fat: selectedFood.fat * amountMultiplier,
        };
    }, [selectedFood, amountMultiplier]);

    const showValuesPreview = entryMode === 'library' && previewFromLibrary !== null;

    const totalMealCount = Object.values(todayMeals).filter((items) => items.length > 0).length;

    const addFoodItemToMeal = (mealKey: MealKey, item: FoodEntry) => {
        setTodayMeals((prev) => ({
            ...prev,
            [mealKey]: [...prev[mealKey], item],
        }));

        setOpenMeal(mealKey);
    };

    const handleAddFromLibrary = () => {
        if (!selectedFood || !previewFromLibrary) {
            return;
        }

        addFoodItemToMeal(selectedMeal, {
            id: `${selectedFood.id}-${Date.now()}`,
            name: selectedFood.name,
            kcal: previewFromLibrary.kcal,
            protein: previewFromLibrary.protein,
            carb: previewFromLibrary.carb,
            fat: previewFromLibrary.fat,
        });

        setSelectedAmount('');
    };

    const buildManualFood = (): FoodEntry | null => {
        const name = manualName.trim();
        const kcal = toNumber(manualKcal);
        const protein = toNumber(manualProtein);
        const carb = toNumber(manualCarb);
        const fat = toNumber(manualFat);

        if (name.length === 0 || kcal <= 0) {
            return null;
        }

        return {
            id: `manual-${Date.now()}`,
            name,
            kcal,
            protein,
            carb,
            fat,
        };
    };

    const handleManualAdd = (saveToLibrary: boolean) => {
        const manualFood = buildManualFood();

        if (!manualFood) {
            return;
        }

        addFoodItemToMeal(selectedMeal, manualFood);

        if (saveToLibrary) {
            setLibraryFoods((prev) => [
                ...prev,
                {
                    id: `${manualFood.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
                    name: manualFood.name,
                    kcal: manualFood.kcal,
                    protein: manualFood.protein,
                    carb: manualFood.carb,
                    fat: manualFood.fat,
                },
            ]);
        }

        setManualName('');
        setManualKcal('');
        setManualProtein('');
        setManualCarb('');
        setManualFat('');
    };

    return (
        <main className={`min-h-screen p-4 sm:p-6 lg:p-8 ${theme.pageBg}`}>
            <div className="mx-auto w-full max-w-6xl space-y-6">
                <header className={`rounded-3xl border px-5 py-4 sm:px-6 sm:py-5 ${theme.cardBg} ${theme.cardBorder} shadow-sm`}>
                    <div className="flex items-center justify-between">
                        <h1 className={`text-2xl font-bold sm:text-3xl ${theme.title}`}>MarkForm</h1>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                aria-label="History Future"
                                className={`grid h-10 w-10 place-items-center rounded-full border ${theme.cardBorder} ${theme.mutedSurface} ${theme.title}`}
                            >
                                <History className="h-5 w-5" strokeWidth={1.9} />
                            </button>
                            <button
                                type="button"
                                aria-label="Profile"
                                className={`grid h-10 w-10 place-items-center rounded-full border ${theme.cardBorder} ${theme.mutedSurface} ${theme.title}`}
                            >
                                <User className="h-5 w-5" strokeWidth={1.9} />
                            </button>
                        </div>
                    </div>
                </header>

                <section className={`rounded-3xl border ${theme.cardBg} ${theme.cardBorder} shadow-sm`}>
                    <div className="flex divide-x divide-slate-200">
                        <div className="flex-[1.45] p-5 sm:p-6">
                            <p className={`text-xs font-semibold uppercase tracking-wide ${theme.subtitle}`}>Gunluk Ozet</p>

                            <div className="mt-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36">
                                        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                                            <circle cx="60" cy="60" r="46" fill="none" strokeWidth="10" className="stroke-slate-200" />
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="46"
                                                fill="none"
                                                strokeWidth="10"
                                                strokeLinecap="round"
                                                className="stroke-emerald-600"
                                                strokeDasharray="289"
                                                strokeDashoffset="145"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 grid place-items-center text-center">
                                            <div>
                                                <p className={`text-xl font-bold sm:text-2xl ${theme.title}`}>500</p>
                                                <p className={`text-xs ${theme.subtitle}`}>/1000 kcal</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 self-center space-y-3">
                                        <div>
                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                <span className={theme.subtitle}>Protein</span>
                                                <span className={theme.title}>50/100</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-200">
                                                <div className="h-2 w-1/2 rounded-full bg-emerald-500" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                <span className={theme.subtitle}>Yag</span>
                                                <span className={theme.title}>30/100</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-200">
                                                <div className="h-2 w-[30%] rounded-full bg-amber-500" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                <span className={theme.subtitle}>Karb</span>
                                                <span className={theme.title}>70/150</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-200">
                                                <div className="h-2 w-[47%] rounded-full bg-sky-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-center">
                                    <p className={`rounded-full px-4 py-1.5 text-center text-sm font-semibold ${theme.accent} ${theme.accentSoft}`}>
                                        500 kcal kalan
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col divide-y divide-slate-200">
                            <div className="flex flex-1 items-center justify-between p-5 sm:p-6">
                                <div className="self-start">
                                    <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${theme.subtitle}`}>SU</p>
                                    <p className={`mt-3 text-xl font-bold ${theme.title}`}>
                                        <span>1 lt / </span>
                                        <span className={`text-base font-medium ${theme.subtitle}`}>2 lt</span>
                                    </p>
                                </div>
                                <div className={`grid h-11 w-11 place-items-center rounded-xl ${theme.accentSoft}`}>
                                    <Droplets className={`h-6 w-6 ${theme.accent}`} strokeWidth={1.9} />
                                </div>
                            </div>

                            <div className="flex flex-1 items-center justify-between p-5 sm:p-6">
                                <div className="self-start">
                                    <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${theme.subtitle}`}>EGZERSIZ</p>
                                    <p className={`mt-2 text-lg font-semibold ${theme.title}`}>1 sa yuruyus</p>
                                    <p className={`mt-0.5 text-xs font-medium ${theme.subtitle}`}>400 kcal</p>
                                </div>
                                <div className={`grid h-11 w-11 place-items-center rounded-xl ${theme.accentSoft}`}>
                                    <Dumbbell className={`h-6 w-6 ${theme.accent}`} strokeWidth={1.9} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={`rounded-3xl border p-7 sm:p-8 ${theme.cardBg} ${theme.cardBorder} shadow-sm`}>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            className="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                            Yemek Ekle
                        </button>
                        <button
                            type="button"
                            className={`rounded-full border px-4 py-2.5 text-sm font-semibold ${theme.cardBorder} ${theme.title}`}
                        >
                            Su Ekle
                        </button>
                        <button
                            type="button"
                            className={`rounded-full border px-4 py-2.5 text-sm font-semibold ${theme.cardBorder} ${theme.title}`}
                        >
                            Egzersiz Ekle
                        </button>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-6 text-base">
                                <button
                                    type="button"
                                    onClick={() => setEntryMode('library')}
                                    className={[
                                        'pb-1.5 text-base font-semibold',
                                        entryMode === 'library' ? `border-b-2 border-black ${theme.title}` : theme.subtitle,
                                    ].join(' ')}
                                >
                                    Kayitli Besin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEntryMode('manual')}
                                    className={[
                                        'pb-1.5 text-base font-semibold',
                                        entryMode === 'manual' ? `border-b-2 border-black ${theme.title}` : theme.subtitle,
                                    ].join(' ')}
                                >
                                    Manuel Giris
                                </button>
                            </div>
                            <button
                                type="button"
                                className={`rounded-full border px-4 py-2 text-sm font-semibold ${theme.cardBorder} ${theme.title} ${theme.accentSoft}`}
                            >
                                Yemek Listesi
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {MEAL_META.map((meal) => {
                                const isActive = meal.key === selectedMeal;
                                const CategoryIcon = meal.icon;
                                return (
                                    <button
                                        key={meal.key}
                                        type="button"
                                        onClick={() => setSelectedMeal(meal.key)}
                                        className={[
                                            'w-full rounded-2xl border px-2 py-2.5 text-sm font-semibold transition-colors',
                                            isActive
                                                ? meal.selectedTone
                                                : `border-slate-200 bg-white ${meal.textTone} ${meal.hoverTone}`,
                                        ].join(' ')}
                                    >
                                        <span className="inline-flex flex-col items-center justify-center gap-1">
                                            <CategoryIcon className="h-4 w-4" strokeWidth={2} />
                                            <span className="text-[13px]">{meal.label}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {entryMode === 'library' ? (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="space-y-1">
                                        <span className={`text-sm ${theme.subtitle}`}>Listeden Sec</span>
                                        <select
                                            value={selectedFoodId}
                                            onChange={(event) => setSelectedFoodId(event.target.value)}
                                            className={`w-full rounded-xl border px-3 py-3 text-base ${theme.cardBorder} ${theme.title} ${theme.mutedSurface}`}
                                        >
                                            <option value="">Seciniz</option>
                                            {libraryFoods.map((food) => (
                                                <option key={food.id} value={food.id}>
                                                    {food.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="space-y-1">
                                        <span className={`text-sm ${theme.subtitle}`}>Miktar Gir</span>
                                        <select
                                            value={selectedAmount}
                                            onChange={(event) => setSelectedAmount(event.target.value)}
                                            className={`w-full rounded-xl border px-3 py-3 text-base ${theme.cardBorder} ${theme.title} ${theme.mutedSurface}`}
                                        >
                                            <option value="">Seciniz</option>
                                            {AMOUNT_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                {showValuesPreview && previewFromLibrary && (
                                    <div className={`rounded-2xl border p-4 ${theme.accentSoft} ${theme.cardBorder}`}>
                                        <p className={`text-xs font-semibold uppercase tracking-wide ${theme.subtitle}`}>Degerler</p>
                                        <div className={`mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm sm:grid-cols-4 ${theme.title}`}>
                                            <p>{Math.round(previewFromLibrary.kcal)} kcal</p>
                                            <p>P: {Math.round(previewFromLibrary.protein)}g</p>
                                            <p>K: {Math.round(previewFromLibrary.carb)}g</p>
                                            <p>Y: {Math.round(previewFromLibrary.fat)}g</p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAddFromLibrary}
                                            className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                        >
                                            Ekle
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-3">
                                <label className="space-y-1">
                                    <span className={`text-sm ${theme.subtitle}`}>Besin Adi</span>
                                    <input
                                        type="text"
                                        value={manualName}
                                        onChange={(event) => setManualName(event.target.value)}
                                        placeholder="Orn: Ev yapimi omlet"
                                        className={`w-full rounded-xl border px-3 py-3 text-base ${theme.cardBorder} ${theme.title} ${theme.mutedSurface}`}
                                    />
                                </label>

                                <div className="grid grid-cols-2 gap-3">
                                    <label className="space-y-1">
                                        <span className={`text-xs ${theme.subtitle}`}>Kalori</span>
                                        <input
                                            type="number"
                                            value={manualKcal}
                                            onChange={(event) => setManualKcal(event.target.value)}
                                            placeholder="0"
                                            className={`w-full rounded-xl border px-2 py-2.5 text-sm ${theme.cardBorder} ${theme.title} ${theme.mutedSurface}`}
                                        />
                                    </label>
                                    <label className="space-y-1">
                                        <span className={`text-xs ${theme.subtitle}`}>P (g)</span>
                                        <input
                                            type="number"
                                            value={manualProtein}
                                            onChange={(event) => setManualProtein(event.target.value)}
                                            placeholder="0"
                                            className={`w-full rounded-xl border px-2 py-2.5 text-sm ${theme.cardBorder} ${theme.title} ${theme.mutedSurface}`}
                                        />
                                    </label>
                                    <label className="space-y-1">
                                        <span className={`text-xs ${theme.subtitle}`}>K (g)</span>
                                        <input
                                            type="number"
                                            value={manualCarb}
                                            onChange={(event) => setManualCarb(event.target.value)}
                                            placeholder="0"
                                            className={`w-full rounded-xl border px-2 py-2.5 text-sm ${theme.cardBorder} ${theme.title} ${theme.mutedSurface}`}
                                        />
                                    </label>
                                    <label className="space-y-1">
                                        <span className={`text-xs ${theme.subtitle}`}>Y (g)</span>
                                        <input
                                            type="number"
                                            value={manualFat}
                                            onChange={(event) => setManualFat(event.target.value)}
                                            placeholder="0"
                                            className={`w-full rounded-xl border px-2 py-2.5 text-sm ${theme.cardBorder} ${theme.title} ${theme.mutedSurface}`}
                                        />
                                    </label>
                                </div>

                                <div className="mx-auto grid w-full max-w-xl grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleManualAdd(true)}
                                        className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold ${theme.cardBorder} ${theme.title}`}
                                    >
                                        Ekle ve Listeye Kaydet
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleManualAdd(false)}
                                        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
                                    >
                                        Ekle
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className={`rounded-3xl border p-5 sm:p-6 ${theme.cardBg} ${theme.cardBorder} shadow-sm`}>
                    <div className="mb-3 flex items-center gap-2">
                        <h2 className={`text-base font-semibold ${theme.title}`}>Gunun Yemekleri</h2>
                        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-emerald-600 px-1 text-xs font-bold text-white">
                            {totalMealCount}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {MEAL_META.filter((meal) => todayMeals[meal.key].length > 0).map((meal) => {
                            const items = todayMeals[meal.key];
                            const isOpen = openMeal === meal.key;
                            const MealIcon = meal.icon;

                            return (
                                <div key={meal.key} className={`rounded-2xl border ${theme.cardBorder} ${theme.mutedSurface}`}>
                                    <button
                                        type="button"
                                        onClick={() => setOpenMeal((prev) => (prev === meal.key ? null : meal.key))}
                                        className="w-full px-3 py-3 text-left"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <MealIcon className={`h-4 w-4 ${meal.textTone}`} strokeWidth={2} />
                                                <p className={`text-sm font-semibold ${theme.title}`}>
                                                    {meal.label}
                                                </p>
                                            </div>
                                            <ChevronDown
                                                className={[
                                                    `h-4 w-4 transition-transform ${theme.subtitle}`,
                                                    isOpen ? 'rotate-180' : '',
                                                ].join(' ')}
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <p className={`mt-1 text-xs ${theme.subtitle}`}>{items.length} besin</p>
                                    </button>

                                    {isOpen && (
                                        <div className="border-t border-slate-200 px-3 py-2">
                                            {items.length === 0 ? (
                                                <p className={`text-xs ${theme.subtitle}`}>Bu kategoride henuz besin yok.</p>
                                            ) : (
                                                <ul className="space-y-2">
                                                    {items.map((item) => (
                                                        <li key={item.id} className={`rounded-xl border px-3 py-2 ${theme.cardBorder} bg-white/70`}>
                                                            <p className={`text-sm font-semibold ${theme.title}`}>{item.name}</p>
                                                            <p className={`mt-0.5 text-xs ${theme.subtitle}`}>{formatNutritionLine(item)}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {MEAL_META.every((meal) => todayMeals[meal.key].length === 0) && (
                            <p className={`rounded-xl border px-3 py-3 text-sm ${theme.cardBorder} ${theme.subtitle}`}>
                                Bugun icin henuz yemek girisi yok.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
