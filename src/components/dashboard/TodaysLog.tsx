import { useMemo, useState } from 'react';
import { ChevronDown, Droplets, Pencil, Trash2, X } from 'lucide-react';
import { useActiveTheme, useUserStore } from '../../store/useUserStore';
import { useToastStore } from '../../store/useToastStore';
import { MEAL_META, mealLabel, todayString, toNumber, formatNutrition, formatWater } from '../../constants/dashboardConstants';
import type { MealKey } from '../../constants/dashboardConstants';
import type { FoodItem } from '../../types';

export function TodaysLog() {
    const T = useActiveTheme();
    const logs = useUserStore((s) => s.logs);
    const language = useUserStore((s) => s.language);
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);
    const removeWaterEntry = useUserStore((s) => s.removeWaterEntry);
    const updateWaterEntry = useUserStore((s) => s.updateWaterEntry);
    const addToast = useToastStore((s) => s.addToast);

    const today = todayString();
    const todayLog = useMemo(() => logs.find((l) => l.date === today), [logs, today]);

    const todayMeals = useMemo<Record<MealKey, FoodItem[]>>(() => {
        const base: Record<MealKey, FoodItem[]> = { kahvalti: [], ogle: [], aksam: [], atistirmalik: [] };
        if (!todayLog) return base;
        for (const meal of MEAL_META) {
            const cat = todayLog.categories.find((c) => c.name === meal.storeLabel);
            base[meal.key] = cat?.items ?? [];
        }
        return base;
    }, [todayLog]);

    const waterEntries = todayLog?.waterEntries ?? [];
    const waterIntake = todayLog?.waterIntake ?? 0;
    const totalMealCount = Object.values(todayMeals).filter((i) => i.length > 0).length;

    const [openMeal, setOpenMeal] = useState<MealKey | null>(null);
    const [openWater, setOpenWater] = useState(false);
    const [editingWaterId, setEditingWaterId] = useState<string | null>(null);
    const [editingWaterValue, setEditingWaterValue] = useState('');

    return (
        <section className={`rounded-3xl border p-5 sm:p-6 ${T.cardBg} ${T.cardBorder} shadow-sm`}>
            <div className="mb-3 flex items-center gap-2">
                <h2 className={`text-base font-semibold ${T.title}`}>{t('Günün Kayıtları', "Today's Log")}</h2>
                {totalMealCount > 0 && (
                    <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs font-bold text-white ${T.accentBtn}`}>
                        {totalMealCount}
                    </span>
                )}
            </div>

            <div className="space-y-2">
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
                                className={`w-full px-4 py-3 text-left ${T.mutedSurface} transition`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-4 w-4 ${meal.textTone}`} strokeWidth={2} />
                                        <span className={`text-sm font-semibold ${T.title}`}>{mealLabel(meal.key, language)}</span>
                                        <span className={`text-xs ${T.subtitle}`}>{items.length} {t('besin', 'foods')} · {Math.round(mealKcal)} kcal</span>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${T.subtitle} ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                                </div>
                            </button>
                            {isOpen && (
                                <ul className={`border-t divide-y ${T.cardBorder}`}>
                                    {items.map((item) => (
                                        <li key={item.id} className={`px-4 py-2.5 ${T.dropdownBg}`}>
                                            <p className={`text-sm font-semibold ${T.title}`}>{item.name}</p>
                                            <p className={`text-xs mt-0.5 ${T.subtitle}`}>{formatNutrition(item)}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}

                {waterEntries.length > 0 && (
                    <div className={`rounded-2xl border ${T.cardBorder} overflow-hidden`}>
                        <button
                            type="button"
                            onClick={() => setOpenWater((p) => !p)}
                            className={`w-full px-4 py-3 text-left ${T.mutedSurface} transition`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Droplets className={`h-4 w-4 ${T.accent}`} strokeWidth={2} />
                                    <span className={`text-sm font-semibold ${T.title}`}>{t('Su', 'Water')}</span>
                                    <span className={`text-xs ${T.subtitle}`}>
                                        {waterEntries.length} {t('içim', 'entries')} · {formatWater(waterIntake, language)}
                                    </span>
                                </div>
                                <ChevronDown className={`h-4 w-4 transition-transform ${T.subtitle} ${openWater ? 'rotate-180' : ''}`} strokeWidth={2} />
                            </div>
                        </button>
                        {openWater && (
                            <ul className={`border-t divide-y ${T.cardBorder}`}>
                                {waterEntries.map((entry) => (
                                    <li key={entry.id} className={`flex items-center justify-between px-4 py-2.5 ${T.dropdownBg}`}>
                                        {editingWaterId === entry.id ? (
                                            <div className="flex flex-1 items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={editingWaterValue}
                                                    onChange={(e) => setEditingWaterValue(e.target.value)}
                                                    title={t('Su miktarı', 'Water amount')}
                                                    placeholder="ml"
                                                    className={`w-24 rounded-lg border px-2 py-1 text-sm ${T.inputBg} ${T.inputBorder} ${T.inputText}`}
                                                    autoFocus
                                                />
                                                <span className={`text-xs ${T.subtitle}`}>ml</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const amt = toNumber(editingWaterValue);
                                                        if (amt > 0) {
                                                            updateWaterEntry(today, entry.id, amt);
                                                            addToast(t('Su miktarı güncellendi.', 'Water amount updated.'));
                                                        }
                                                        setEditingWaterId(null);
                                                    }}
                                                    className={`rounded-lg px-3 py-1 text-xs font-semibold text-white ${T.accentBtn}`}
                                                >
                                                    {t('Kaydet', 'Save')}
                                                </button>
                                                <button type="button" aria-label={t('İptal', 'Cancel')} onClick={() => setEditingWaterId(null)} className={T.subtitle}>
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <p className={`text-sm font-semibold ${T.title}`}>{formatWater(entry.amount)}</p>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        aria-label={t('Düzenle', 'Edit')}
                                                        onClick={() => { setEditingWaterId(entry.id); setEditingWaterValue(String(entry.amount)); }}
                                                        className={`grid h-7 w-7 place-items-center rounded-full ${T.subtitle}`}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label={t('Sil', 'Delete')}
                                                        onClick={() => {
                                                            removeWaterEntry(today, entry.id);
                                                            addToast(t('Kayıt silindi.', 'Entry deleted.'));
                                                        }}
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
                        {t('Bugün için henüz kayıt yok.', 'No entries yet for today.')}
                    </p>
                )}
            </div>
        </section>
    );
}
