import { useState } from 'react';
import {
    ChevronDown, Droplets, Dumbbell,
    Pencil, Plus, Trash2, X, Check
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useActiveTheme, useUserStore } from '../../../store/useUserStore';
import {
    formatNutrition, formatWater, mealLabel, toNumber
} from '../../../constants/dashboardConstants';
import type { Past30LogEntry } from './historyHelpers';
import { formatDayLabel, formatWeekday } from './historyHelpers';
import { AddEntryModal } from './AddEntryModal';
import { useToastStore } from '../../../store/useToastStore';
import { WaterSection } from '../ActionCard/WaterSection';
import { ExerciseSection } from '../ActionCard/ExerciseSection';

interface Props {
    entry: Past30LogEntry;
    targetKcal: number;
}

type OpenCategory = 'food' | 'water' | 'exercise' | null;
type EditModal = 'water' | 'exercise' | null;

/* ─────────────────────────────────────────────────────────
   Inline edit modal rendered via portal
───────────────────────────────────────────────────────── */
function EditModal({
    title,
    subtitle,
    onClose,
    children,
}: {
    title: string;
    subtitle: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    const T = useActiveTheme();
    return createPortal(
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl z-10 overflow-hidden ${T.cardBg} ${T.cardBorder}`}>
                <div className={`flex items-center justify-between px-5 py-4 border-b ${T.cardBorder}`}>
                    <div>
                        <h3 className={`text-sm font-bold ${T.title}`}>{title}</h3>
                        <p className={`text-xs mt-0.5 ${T.subtitle}`}>{subtitle}</p>
                    </div>
                    <button type="button" onClick={onClose}
                        className={`grid h-8 w-8 place-items-center rounded-full border ${T.cardBorder} ${T.mutedSurface} ${T.title}`}>
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ─────────────────────────────────────────────────────────
   Main Card
───────────────────────────────────────────────────────── */
export function HistoryDayCard({ entry, targetKcal }: Props) {
    const T = useActiveTheme();
    const language = useUserStore((s) => s.language);
    const removeFoodFromMeal = useUserStore((s) => s.removeFoodFromMeal);
    const removeLog = useUserStore((s) => s.removeLog);
    const removeWaterEntry = useUserStore((s) => s.removeWaterEntry);
    const updateWaterEntry = useUserStore((s) => s.updateWaterEntry);
    const updateLog = useUserStore((s) => s.updateLog);
    const addToast = useToastStore((s) => s.addToast);
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);

    const { log, totals, waterEntries, waterAmount, mealsByKey, dateObj, isWorkoutDone, workoutName, workoutDuration, hasData } = entry;

    const [isExpanded, setIsExpanded] = useState(false);
    const [openCategories, setOpenCategories] = useState<string[]>([]);
    const [openMealKeys, setOpenMealKeys] = useState<string[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editModal, setEditModal] = useState<EditModal>(null);

    // Water inline edit
    const [editingWaterId, setEditingWaterId] = useState<string | null>(null);
    const [editWaterValue, setEditWaterValue] = useState('');

    // Exercise inline edit
    const [editingExercise, setEditingExercise] = useState(false);
    const [editExName, setEditExName] = useState(workoutName ?? '');
    const [editExDuration, setEditExDuration] = useState(String(workoutDuration));

    const toggleCategory = (cat: OpenCategory) => {
        if (!cat) return;
        setOpenCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
    };

    const toggleMeal = (key: string) => {
        setOpenMealKeys((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
    };

    const handleDeleteLog = () => {
        if (!window.confirm(t('Bu günün kayıtlarını silmek istediğinize emin misiniz?', 'Are you sure you want to delete this day?'))) return;
        removeLog(log.date);
        addToast(t('Günlük kayıt silindi.', 'Daily record deleted.'), 'error');
    };

    const handleSaveExercise = () => {
        const dur = toNumber(editExDuration);
        if (!editExName.trim() || dur <= 0) return;
        updateLog(log.date, { workoutDone: true, workoutName: editExName.trim(), workoutDuration: dur });
        setEditingExercise(false);
        addToast(t('Egzersiz güncellendi.', 'Exercise updated.'));
    };

    const handleDeleteExercise = () => {
        if (!window.confirm(t('Bu egzersizi silmek istediğinize emin misiniz?', 'Are you sure you want to delete this exercise?'))) return;
        updateLog(log.date, { workoutDone: false, workoutName: undefined, workoutDuration: 0 });
        addToast(t('Egzersiz silindi.', 'Exercise deleted.'), 'error');
    };

    const kcalPct = Math.min(100, targetKcal > 0 ? Math.round((totals.kcal / targetKcal) * 100) : 0);
    const isDark = true; // Current earthy theme is a dark theme
    const dateLabel = formatDayLabel(dateObj, language);
    const weekday = formatWeekday(dateObj, language);

    // Colour helpers — horizontal, compact cards
    const chip = (bg: string, border: string) =>
        `flex items-center justify-center gap-1 rounded-full px-2 py-1.5 flex-1 min-w-0 ${bg} border ${border}`;

    return (
        <>
            <article className={`rounded-2xl border overflow-hidden ${T.cardBorder} ${T.cardBg}`}>

                {/* ── Header ── */}
                <div className={`flex items-center gap-2 px-4 py-3 ${T.mutedSurface}`}>
                    <button
                        type="button"
                        onClick={() => setIsExpanded((v) => !v)}
                        className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                    >
                        <span className={`text-sm font-bold ${T.title}`}>{dateLabel}</span>
                        <span className={`text-[11px] font-medium ${T.subtitle}`}>{weekday}</span>
                        <ChevronDown className={`h-3.5 w-3.5 ml-0.5 transition-transform duration-200 ${T.subtitle} ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button type="button" aria-label={t('Kayıt Ekle', 'Add Entry')}
                            onClick={() => setShowAddModal(true)}
                            className={`grid h-7 w-7 place-items-center rounded-full border ${T.cardBorder} ${T.mutedSurface} ${T.accent} transition`}>
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                        {hasData && (
                            <button type="button" aria-label={t('Günü Sil', 'Delete Day')}
                                onClick={handleDeleteLog}
                                className="grid h-7 w-7 place-items-center rounded-full bg-rose-500/10 text-rose-500 transition hover:bg-rose-500/20 hover:scale-105 active:scale-95">
                                <Trash2 className="h-3 w-3" />
                            </button>
                        )}
                        {hasData && (
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${isDark ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                                {Math.round(totals.kcal)} kcal
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Summary strip ── */}
                {hasData ? (
                    <div className={`px-4 py-2.5 border-t ${T.cardBorder}`}>
                        {/* Kcal bar */}
                        <div className={`h-1.5 rounded-full overflow-hidden mb-2.5 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                style={{ width: `${kcalPct}%` }} />
                        </div>

                        {/* Chips grid */}
                        <div className="flex gap-1.5 flex-wrap">
                            {/* Protein (Deep Grass Green) */}
                            <div className={chip('bg-[#4A6B31]/10', 'border-[#4A6B31]/20')}>
                                <span className={`text-[11px] font-bold text-[#4A6B31]`}>P: {Math.round(totals.protein)}g</span>
                            </div>
                            {/* Carb (Vibrant Orange) */}
                            <div className={chip('bg-[#F08A1D]/10', 'border-[#F08A1D]/20')}>
                                <span className={`text-[11px] font-bold text-[#F08A1D]`}>K: {Math.round(totals.carb)}g</span>
                            </div>
                            {/* Fat (Warning Red) */}
                            <div className={chip('bg-[#E63946]/10', 'border-[#E63946]/20')}>
                                <span className={`text-[11px] font-bold text-[#E63946]`}>Y: {Math.round(totals.fat)}g</span>
                            </div>
                            {/* Water (Grass Green) */}
                            {waterAmount > 0 && (
                                <div className={chip('bg-[#4A6B31]/10', 'border-[#4A6B31]/20')}>
                                    <Droplets className={`h-3 w-3 text-[#4A6B31]`} />
                                    <span className={`text-[11px] font-bold text-[#4A6B31]`}>{waterAmount >= 1000 ? `${(waterAmount / 1000).toFixed(1)}L` : `${waterAmount}ml`}</span>
                                </div>
                            )}
                            {/* Exercise (Vibrant Orange) */}
                            {isWorkoutDone && (
                                <div className={chip('bg-[#F08A1D]/10', 'border-[#F08A1D]/20')}>
                                    <Dumbbell className={`h-3 w-3 text-[#F08A1D]`} />
                                    <span className={`text-[11px] font-bold text-[#F08A1D]`}>{workoutDuration}dk</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={`flex flex-col items-center gap-2 py-5 border-t ${T.cardBorder}`}>
                        <p className={`text-xs ${T.subtitle}`}>{t('Bu gün için kayıt yok', 'No records for this day')}</p>
                        <button type="button" onClick={() => setShowAddModal(true)}
                            className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold border ${T.cardBorder} ${T.accentSoft} ${T.accent} transition`}>
                            <Plus className="h-3.5 w-3.5" />
                            {t('Kayıt Ekle', 'Add Entry')}
                        </button>
                    </div>
                )}

                {/* ── Expanded detail ── */}
                {isExpanded && hasData && (
                    <div className={`p-4 space-y-3 border-t ${T.cardBorder}`}>
                        {/* Food */}
                        {mealsByKey.length > 0 && mealsByKey.map(({ meal, items }) => {
                            const mealKcal = items.reduce((s, i) => s + i.kcal, 0);
                            const isOpen = openMealKeys.includes(meal.key);
                            const Icon = meal.icon;
                            return (
                                <div key={meal.key} className={`rounded-2xl border ${T.cardBorder} overflow-hidden`}>
                                    <button type="button"
                                        onClick={() => toggleMeal(meal.key)}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition hover:bg-black/5 dark:hover:bg-white/5`}>
                                        <div className="flex items-center gap-2.5">
                                            <div className={`grid h-8 w-8 place-items-center rounded-full ${isDark ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
                                                <Icon className={`h-4 w-4 ${meal.textTone}`} strokeWidth={2} />
                                            </div>
                                            <span className={`text-sm font-semibold ${T.title}`}>{mealLabel(meal.key, language)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[11px] font-semibold ${T.subtitle}`}>{Math.round(mealKcal)} kcal · {items.length} {t('öğe', 'items')}</span>
                                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${T.subtitle} ${isOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <ul className={`border-t divide-y ${T.cardBorder}`}>
                                            {items.map((item) => (
                                                <li key={item.id} className={`flex items-center justify-between pl-4 pr-3 py-2.5 transition hover:bg-black/5 dark:hover:bg-white/5`}>
                                                    <div className="flex items-center gap-2 flex-1 min-w-0 mr-3">
                                                        <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                        <p className={`text-xs font-medium truncate ${T.title}`}>{item.name}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className={`text-[10px] font-medium ${T.subtitle}`}>{formatNutrition(item)}</span>
                                                        <button type="button" aria-label={t('Sil', 'Delete')}
                                                            onClick={() => {
                                                                if (!window.confirm(t('Bu besini silmek istediğinize emin misiniz?', 'Are you sure you want to delete this food?'))) return;
                                                                removeFoodFromMeal(log.date, meal.storeLabel, item.id);
                                                                addToast(t('Besin silindi.', 'Food deleted.'), 'error');
                                                            }}
                                                            className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-500/10 text-rose-500 transition hover:bg-rose-500/20 hover:scale-105 active:scale-95">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}

                        {/* Water */}
                        {waterAmount > 0 && (
                            <div className={`rounded-2xl border ${T.cardBorder} overflow-hidden`}>
                                <button type="button" onClick={() => toggleCategory('water')}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition hover:bg-black/5 dark:hover:bg-white/5`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className={`grid h-8 w-8 place-items-center rounded-full ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                            <Droplets className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                                        </div>
                                        <span className={`text-sm font-semibold ${T.title}`}>{t('Su', 'Water')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[11px] font-semibold ${T.subtitle}`}>{formatWater(waterAmount, language)}</span>
                                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${T.subtitle} ${openCategories.includes('water') ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                {openCategories.includes('water') && (
                                    <ul className={`border-t divide-y ${T.cardBorder}`}>
                                        {waterEntries.map((we) => (
                                            <li key={we.id} className={`flex items-center gap-2 px-4 py-2.5 transition hover:bg-black/5 dark:hover:bg-white/5`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mr-1.5" />
                                                {editingWaterId === we.id ? (
                                                    <>
                                                        <input type="number" value={editWaterValue}
                                                            onChange={(e) => setEditWaterValue(e.target.value)}
                                                            className={`w-20 rounded-lg border px-2 py-1 text-xs outline-none ${T.inputBg} ${T.inputBorder} ${T.inputText}`}
                                                            autoFocus />
                                                        <span className={`text-[10px] ${T.subtitle}`}>ml</span>
                                                        <div className="flex-1" />
                                                        <button type="button" onClick={() => {
                                                            const amt = toNumber(editWaterValue);
                                                            if (amt > 0) { updateWaterEntry(log.date, we.id, amt); addToast(t('Su güncellendi.', 'Water updated.')); }
                                                            setEditingWaterId(null);
                                                        }} className={`grid h-6 w-6 place-items-center rounded-full ${T.accentSoft} ${T.accent}`}>
                                                            <Check className="h-3 w-3" />
                                                        </button>
                                                        <button type="button" onClick={() => setEditingWaterId(null)}
                                                            className={`grid h-6 w-6 place-items-center rounded-full ${T.mutedSurface} ${T.subtitle}`}>
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className={`flex-1 text-xs font-semibold ${T.title}`}>{formatWater(we.amount)}</span>
                                                        <button type="button" onClick={() => { setEditingWaterId(we.id); setEditWaterValue(String(we.amount)); }}
                                                            className={`grid h-6 w-6 place-items-center rounded-full ${T.mutedSurface} ${T.subtitle}`}>
                                                            <Pencil className="h-3 w-3" />
                                                        </button>
                                                        <button type="button" onClick={() => {
                                                            if (!window.confirm(t('Bu su kaydını silmek istediğinize emin misiniz?', 'Are you sure you want to delete this water record?'))) return;
                                                            removeWaterEntry(log.date, we.id);
                                                            addToast(t('Su silindi.', 'Water deleted.'), 'error');
                                                        }}
                                                            className="grid h-6 w-6 place-items-center rounded-full bg-rose-500/10 text-rose-500 transition hover:bg-rose-500/20 hover:scale-105 active:scale-95">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Exercise */}
                        {isWorkoutDone && (
                            <div className={`rounded-2xl border ${T.cardBorder} overflow-hidden`}>
                                <button type="button" onClick={() => toggleCategory('exercise')}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition hover:bg-black/5 dark:hover:bg-white/5`}>
                                    <div className="flex items-center gap-2.5">
                                        <div className={`grid h-8 w-8 place-items-center rounded-full ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                                            <Dumbbell className={`h-4 w-4 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
                                        </div>
                                        <span className={`text-sm font-semibold ${T.title}`}>{t('Egzersiz', 'Exercise')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[11px] font-semibold ${T.subtitle}`}>{workoutName} · {workoutDuration}dk</span>
                                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${T.subtitle} ${openCategories.includes('exercise') ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                {openCategories.includes('exercise') && (
                                    <div className={`border-t ${T.cardBorder}`}>
                                        {editingExercise ? (
                                            <div className={`flex items-center gap-2 px-4 py-3 ${T.mutedSurface}`}>
                                                <input type="text" value={editExName} onChange={(e) => setEditExName(e.target.value)}
                                                    placeholder={t('Egzersiz adı', 'Exercise name')}
                                                    className={`flex-1 min-w-0 rounded-lg border px-2 py-1.5 text-xs outline-none ${T.inputBg} ${T.inputBorder} ${T.inputText}`} autoFocus />
                                                <input type="number" value={editExDuration} onChange={(e) => setEditExDuration(e.target.value)}
                                                    placeholder="dk"
                                                    className={`w-14 rounded-lg border px-2 py-1.5 text-xs outline-none ${T.inputBg} ${T.inputBorder} ${T.inputText}`} />
                                                <button type="button" onClick={handleSaveExercise}
                                                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${T.accentSoft} ${T.accent}`}>
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => setEditingExercise(false)}
                                                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${T.mutedSurface} ${T.subtitle}`}>
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`flex items-center gap-2 px-4 py-3 transition hover:bg-black/5 dark:hover:bg-white/5`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mr-1.5" />
                                                <span className={`flex-1 text-xs font-semibold ${T.title}`}>{workoutName}</span>
                                                {workoutDuration > 0 && <span className={`text-[11px] font-semibold ${T.subtitle}`}>{workoutDuration} dk</span>}
                                                <button type="button"
                                                    onClick={() => { setEditExName(workoutName ?? ''); setEditExDuration(String(workoutDuration)); setEditingExercise(true); }}
                                                    className={`grid h-6 w-6 place-items-center rounded-full ${T.mutedSurface} ${T.subtitle}`}>
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                                <button type="button" onClick={handleDeleteExercise}
                                                    className="grid h-6 w-6 place-items-center rounded-full bg-rose-500/10 text-rose-500 transition hover:bg-rose-500/20 hover:scale-105 active:scale-95">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </article>

            {/* Add entry modal */}
            {showAddModal && (
                <AddEntryModal
                    date={log.date}
                    dateLabel={`${dateLabel} · ${weekday}`}
                    onClose={() => setShowAddModal(false)}
                />
            )}

            {/* Water edit modal (portal) */}
            {editModal === 'water' && (
                <EditModal
                    title={t('Su Ekle', 'Add Water')}
                    subtitle={`${dateLabel} · ${weekday}`}
                    onClose={() => setEditModal(null)}
                >
                    <WaterSection targetDate={log.date} />
                </EditModal>
            )}

            {/* Exercise edit modal (portal) */}
            {editModal === 'exercise' && (
                <EditModal
                    title={t('Egzersiz Güncelle', 'Update Exercise')}
                    subtitle={`${dateLabel} · ${weekday}`}
                    onClose={() => setEditModal(null)}
                >
                    <ExerciseSection targetDate={log.date} />
                </EditModal>
            )}
        </>
    );
}
