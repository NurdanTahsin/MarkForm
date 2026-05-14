import { useState } from 'react';
import { ChevronDown, Droplets, Flame, Pencil, Trash2, X } from 'lucide-react';
import { useActiveTheme, useUserStore } from '../../../store/useUserStore';
import { useToastStore } from '../../../store/useToastStore';
import { formatWater, mealLabel, toNumber } from '../../../constants/dashboardConstants';
import type { Past30LogEntry } from './historyHelpers';
import { formatDayLabel, formatWeekday } from './historyHelpers';

interface Props {
    entry: Past30LogEntry;
    targetProtein: number;
    targetCarb: number;
    targetFat: number;
}

export function DayCard({ entry, targetProtein, targetCarb, targetFat }: Readonly<Props>) {
    const T = useActiveTheme();
    const language = useUserStore((s) => s.language);
    const removeWaterEntry = useUserStore((s) => s.removeWaterEntry);
    const updateWaterEntry = useUserStore((s) => s.updateWaterEntry);
    const removeFoodFromMeal = useUserStore((s) => s.removeFoodFromMeal);
    const addToast = useToastStore((s) => s.addToast);
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);

    const { log, totals, waterEntries, waterAmount, mealsByKey, dateObj, isWorkoutDone, workoutDuration, workoutName, hasData } = entry;

    const [isExpanded, setIsExpanded] = useState(false);
    const [editingWaterKey, setEditingWaterKey] = useState<string | null>(null);
    const [editingWaterValue, setEditingWaterValue] = useState('');
    const keyPrefix = `${log.date}:`;
    const summaryTone = hasData
        ? [T.accentSoft, T.accent, T.cardBorder].join(' ')
        : [T.mutedSurface, T.subtitle, T.cardBorder].join(' ');

    return (
        <article className={`rounded-4xl border p-5 shadow-sm ${T.cardBorder} ${T.cardBg}`}>
            <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                className="flex w-full items-start justify-between gap-4 text-left"
            >
                <div>
                    <h3 className={`text-2xl font-bold ${T.title}`}>{formatDayLabel(dateObj, language)}</h3>
                    <p className={`mt-1 text-sm ${T.subtitle}`}>{formatWeekday(dateObj, language)}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${summaryTone}`}>
                        {hasData ? `${Math.round(totals.kcal)} kcal` : t('Veri yok', 'No data')}
                    </span>
                    <ChevronDown className={`h-5 w-5 transition ${T.subtitle} ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isExpanded && (
                <div className="mt-5 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className={`rounded-2xl border p-3 ${T.cardBorder} ${T.dropdownBg}`}>
                            <p className={`text-[11px] uppercase tracking-wide ${T.subtitle}`}>{t('Kalori', 'Calories')}</p>
                            <p className={`mt-1 text-base font-bold ${T.title}`}>{Math.round(totals.kcal)} kcal</p>
                        </div>
                        <div className={`rounded-2xl border p-3 ${T.cardBorder} ${T.dropdownBg}`}>
                            <p className={`text-[11px] uppercase tracking-wide ${T.subtitle}`}>{t('Su', 'Water')}</p>
                            <p className={`mt-1 text-base font-bold ${T.title}`}>{formatWater(waterAmount, language)}</p>
                        </div>
                        <div className={`rounded-2xl border p-3 ${T.cardBorder} ${T.dropdownBg}`}>
                            <p className={`text-[11px] uppercase tracking-wide ${T.subtitle}`}>{t('Egzersiz', 'Exercise')}</p>
                            <p className={`mt-1 text-base font-bold ${T.title}`}>
                                {isWorkoutDone ? t('Yapıldı', 'Done') : t('Yok', 'None')}
                            </p>
                            {isWorkoutDone && workoutDuration > 0 ? <p className={`text-[11px] ${T.subtitle}`}>{workoutDuration} {t('dk', 'min')}</p> : null}
                            {isWorkoutDone && workoutName ? <p className={`text-[11px] ${T.subtitle}`}>{workoutName}</p> : null}
                        </div>
                        <div className={`rounded-2xl border p-3 ${T.cardBorder} ${T.dropdownBg}`}>
                            <p className={`text-[11px] uppercase tracking-wide ${T.subtitle}`}>{t('Öğün', 'Meals')}</p>
                            <p className={`mt-1 text-base font-bold ${T.title}`}>{mealsByKey.length}</p>
                            <p className={`text-[11px] ${T.subtitle}`}>{totals.count} {t('besin', 'foods')}</p>
                        </div>
                    </div>

                    {/* Makro detayı */}
                    <div className={`rounded-2xl border p-4 ${T.cardBorder} ${T.mutedSurface}`}>
                        <div className="mb-3 flex items-center gap-2">
                            <Flame className={`h-4 w-4 ${T.accent}`} />
                            <p className={`text-sm font-semibold ${T.title}`}>{t('Makro Detayı', 'Macro Detail')}</p>
                        </div>
                        <div className="space-y-2.5">
                            {[
                                { label: t('Protein', 'Protein'), value: totals.protein, target: targetProtein, className: 'macro-fill-emerald' },
                                { label: t('Yağ', 'Fat'), value: totals.fat, target: targetFat, className: 'macro-fill-amber' },
                                { label: t('Karb', 'Carb'), value: totals.carb, target: targetCarb, className: 'macro-fill-sky' },
                            ].map((macro) => (
                                <div key={macro.label}>
                                    <div className="mb-1 flex items-end justify-between">
                                        <span className={`text-xs ${T.subtitle}`}>{macro.label}</span>
                                        <span className={`text-xs font-medium ${T.title}`}>
                                            {Math.round(macro.value)}/{Math.max(1, macro.target)}g
                                        </span>
                                    </div>
                                    <progress
                                        className={`macro-bar macro-track-light ${macro.className}`}
                                        value={Math.max(0, Math.min(macro.value, Math.max(1, macro.target)))}
                                        max={Math.max(1, macro.target)}
                                        aria-label={`${macro.label} progress`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Öğün listeleri */}
                    {mealsByKey.length > 0 ? (
                        mealsByKey.map(({ meal, items }) => {
                            const mealKcal = items.reduce((sum, item) => sum + item.kcal, 0);
                            return (
                                <div key={meal.key} className={`rounded-2xl border ${T.cardBorder} overflow-hidden`}>
                                    <div className={`flex items-center justify-between px-4 py-3 ${T.mutedSurface}`}>
                                        <div className="flex items-center gap-2">
                                            <meal.icon className={`h-4 w-4 ${meal.textTone}`} strokeWidth={2} />
                                            <span className={`text-sm font-semibold ${T.title}`}>{mealLabel(meal.key, language)}</span>
                                        </div>
                                        <span className={`text-xs ${T.subtitle}`}>{items.length} {t('besin', 'foods')} · {Math.round(mealKcal)} kcal</span>
                                    </div>
                                    <ul className={`divide-y ${T.cardBorder}`}>
                                        {items.map((item) => (
                                            <li key={item.id} className={`flex items-center justify-between gap-3 px-4 py-3 ${T.dropdownBg}`}>
                                                <div className="min-w-0">
                                                    <p className={`truncate text-sm font-semibold ${T.title}`}>{item.name}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    aria-label={t('Besini sil', 'Delete food')}
                                                    onClick={() => {
                                                        removeFoodFromMeal(log.date, meal.storeLabel, item.id);
                                                        addToast(t('Besin silindi.', 'Food deleted.'));
                                                    }}
                                                    className="grid h-8 w-8 place-items-center rounded-full text-rose-500 transition hover:bg-rose-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })
                    ) : (
                        <div className={`rounded-2xl border px-4 py-6 text-center ${T.cardBorder} ${T.mutedSurface}`}>
                            <p className={`text-sm italic ${T.subtitle}`}>{t('Bu gün için besin verisi yok.', 'No food data for this day.')}</p>
                        </div>
                    )}

                    {/* Su detayı */}
                    <div className={`rounded-2xl border ${T.cardBorder} overflow-hidden`}>
                        <div className={`flex items-center justify-between px-4 py-3 ${T.mutedSurface}`}>
                            <div className="flex items-center gap-2">
                                <Droplets className={`h-4 w-4 ${T.accent}`} strokeWidth={2} />
                                <span className={`text-sm font-semibold ${T.title}`}>{t('Su Detayı', 'Water Detail')}</span>
                            </div>
                            <span className={`text-xs ${T.subtitle}`}>{formatWater(waterAmount, language)}</span>
                        </div>
                        {waterEntries.length > 0 ? (
                            <ul className={`divide-y ${T.cardBorder}`}>
                                {waterEntries.map((entry) => {
                                    const waterKey = `${keyPrefix}${entry.id}`;
                                    const isEditing = editingWaterKey === waterKey;
                                    return (
                                        <li key={entry.id} className={`flex items-center justify-between gap-3 px-4 py-3 ${T.dropdownBg}`}>
                                            {isEditing ? (
                                                <div className="flex flex-1 items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={editingWaterValue}
                                                        onChange={(event) => setEditingWaterValue(event.target.value)}
                                                        title={t('Su miktarı', 'Water amount')}
                                                        placeholder="ml"
                                                        className={`w-24 rounded-xl border px-3 py-2 text-sm outline-none ${T.inputBg} ${T.inputBorder} ${T.inputText}`}
                                                        autoFocus
                                                    />
                                                    <span className={`text-xs ${T.subtitle}`}>ml</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const amount = toNumber(editingWaterValue);
                                                            if (amount > 0) {
                                                                updateWaterEntry(log.date, entry.id, amount);
                                                                addToast(t('Su güncellendi.', 'Water updated.'));
                                                            }
                                                            setEditingWaterKey(null);
                                                            setEditingWaterValue('');
                                                        }}
                                                        className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${T.accentBtn}`}
                                                    >
                                                        {t('Kaydet', 'Save')}
                                                    </button>
                                                    <button type="button" aria-label={t('İptal', 'Cancel')} onClick={() => setEditingWaterKey(null)} className={T.subtitle}>
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className={`text-sm font-semibold ${T.title}`}>{formatWater(entry.amount, language)}</p>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            aria-label={t('Düzenle', 'Edit')}
                                                            onClick={() => { setEditingWaterKey(waterKey); setEditingWaterValue(String(entry.amount)); }}
                                                            className={`grid h-8 w-8 place-items-center rounded-full transition ${T.subtitle}`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            aria-label={t('Sil', 'Delete')}
                                                            onClick={() => {
                                                                removeWaterEntry(log.date, entry.id);
                                                                addToast(t('Su kaydı silindi.', 'Water entry deleted.'));
                                                            }}
                                                            className="grid h-8 w-8 place-items-center rounded-full text-rose-400 transition hover:bg-rose-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className={`px-4 py-6 text-center ${T.dropdownBg}`}>
                                <p className={`text-sm italic ${T.subtitle}`}>{t('Bu gün için su verisi yok.', 'No water data for this day.')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </article>
    );
}
