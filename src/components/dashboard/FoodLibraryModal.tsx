import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, X, Trash2 } from 'lucide-react';
import type { FoodItem, FoodUnit } from '../../types';
import { useActiveTheme, useUserStore } from '../../store/useUserStore';
import { BUILTIN_FOODS, toNumber } from '../../constants/dashboardConstants';
import { useToastStore } from '../../store/useToastStore';

interface Props {
    open: boolean;
    onClose: () => void;
    onSelect?: (food: FoodItem) => void;
}

export function FoodLibraryModal({ open, onClose, onSelect }: Props) {
    const T = useActiveTheme();
    const language = useUserStore((s) => s.language);
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);
    const personalFoods = useUserStore((s) => s.personalFoods);
    const addFoodToLibrary = useUserStore((s) => s.addFoodToLibrary);
    const deleteFromLibrary = useUserStore((s) => s.deleteFromLibrary);
    const addToast = useToastStore((s) => s.addToast);

    const [libName, setLibName] = useState('');
    const [libUnit, setLibUnit] = useState<FoodUnit>('porsiyon');
    const [libKcal, setLibKcal] = useState('');
    const [libProtein, setLibProtein] = useState('');
    const [libCarb, setLibCarb] = useState('');
    const [libFat, setLibFat] = useState('');
    const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

    const libraryFoods = useMemo(() => {
        const builtinIds = new Set(BUILTIN_FOODS.map((f) => f.id));
        return [...BUILTIN_FOODS, ...personalFoods.filter((f) => !builtinIds.has(f.id))];
    }, [personalFoods]);

    const resetForm = () => {
        setLibName('');
        setLibUnit('porsiyon');
        setLibKcal('');
        setLibProtein('');
        setLibCarb('');
        setLibFat('');
        setEditingFood(null);
    };

    useEffect(() => {
        if (!open) resetForm();
    }, [open]);

    const handleSave = () => {
        const name = libName.trim();
        const kcal = toNumber(libKcal);
        if (!name || kcal <= 0) return;
        addFoodToLibrary({
            id: editingFood?.id ?? `lib-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            name, kcal, unit: libUnit,
            protein: toNumber(libProtein),
            carb: toNumber(libCarb),
            fat: toNumber(libFat),
        });
        addToast(
            editingFood
                ? t('Besin başarıyla güncellendi.', 'Food successfully updated.')
                : t('Besin başarıyla eklendi.', 'Food successfully added.')
        );
        resetForm();
    };

    const handleEdit = (food: FoodItem) => {
        setEditingFood(food);
        setLibName(food.name);
        setLibUnit(food.unit);
        setLibKcal(String(food.kcal));
        setLibProtein(String(food.protein));
        setLibCarb(String(food.carb));
        setLibFat(String(food.fat));
    };

    const handleDelete = (foodId: string) => {
        deleteFromLibrary(foodId);
        if (editingFood?.id === foodId) resetForm();
        addToast(t('Besin başarıyla silindi.', 'Food successfully deleted.'));
    };

    const handleSelect = (food: FoodItem) => {
        if (!onSelect) return;
        onSelect(food);
        onClose();
    };

    const editingForm = (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 sm:p-6" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
            <div className={`w-full max-w-lg rounded-3xl shadow-2xl ${T.dropdownBg} ${T.cardBorder}`}>
                <div className={`flex items-center justify-between border-b px-5 py-4 ${T.dropdownBg} ${T.cardBorder}`}>
                    <h2 className={`text-base font-bold ${T.title}`}>
                        {t('Besini Düzenle', 'Edit Food')}
                    </h2>
                    <button type="button" aria-label={t('Kapat', 'Close')} onClick={resetForm} className={`grid h-9 w-9 place-items-center rounded-full border ${T.cardBorder} ${T.title}`}>
                        <X className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-5">
                    <div className={`rounded-2xl border p-4 space-y-3 ${T.cardBorder} ${T.accentSoft}`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${T.subtitle}`}>{t('Besin Bilgileri', 'Food Details')}</p>
                        <input type="text" value={libName} onChange={(e) => setLibName(e.target.value)} placeholder={t('Besin adı', 'Food name')} className={T.inputCls} />
                        <div className="flex gap-2">
                            {(['porsiyon', 'gram'] as FoodUnit[]).map((u) => (
                                <button
                                    key={u}
                                    type="button"
                                    onClick={() => setLibUnit(u)}
                                    className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${libUnit === u ? T.accentBtn : `border ${T.cardBorder} ${T.dropdownBg} ${T.title}`}`}
                                >
                                    {u === 'porsiyon' ? t('1 porsiyon bazlı', 'Per 1 portion') : t('100 gram bazlı', 'Per 100 grams')}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: t('Kalori', 'Calories'), value: libKcal, set: setLibKcal },
                                { label: t('Protein (g)', 'Protein (g)'), value: libProtein, set: setLibProtein },
                                { label: t('Karbonhidrat (g)', 'Carbs (g)'), value: libCarb, set: setLibCarb },
                                { label: t('Yağ (g)', 'Fat (g)'), value: libFat, set: setLibFat },
                            ].map(({ label, value, set }) => (
                                <label key={label} className="space-y-1">
                                    <span className={`text-xs ${T.subtitle}`}>{label}</span>
                                    <input type="number" value={value} onChange={(e) => set(e.target.value)} placeholder="0" className={T.inputCls} />
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${T.cardBorder} ${T.dropdownBg} ${T.title}`}
                            >
                                {t('İptal', 'Cancel')}
                            </button>
                            <button type="button" onClick={handleSave} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${T.accentBtn}`}>
                                {t('Güncelle', 'Update')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!open) return null;

    return createPortal(
        editingFood ? (
            editingForm
        ) : (
            <div
                className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className={`w-full flex flex-col max-w-lg max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden ${T.dropdownBg} ${T.cardBorder}`}>
                    <div className={`shrink-0 flex items-center justify-between border-b px-5 py-4 ${T.dropdownBg} ${T.cardBorder}`}>
                        <h2 className={`text-base font-bold ${T.title}`}>
                            {onSelect ? t('Besin Seç', 'Select Food') : t('Yemek Listesi', 'Food Library')}
                        </h2>
                        <button type="button" aria-label={t('Kapat', 'Close')} onClick={onClose} className={`grid h-9 w-9 place-items-center rounded-full border ${T.cardBorder} ${T.title}`}>
                            <X className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#828A7E]/30 hover:[&::-webkit-scrollbar-thumb]:bg-[#828A7E]/50">
                        {/* Add new food form */}
                        <div className={`rounded-2xl border p-4 space-y-3 ${T.cardBorder} ${T.accentSoft}`}>
                            <p className={`text-xs font-semibold uppercase tracking-wide ${T.subtitle}`}>{t('Yeni Besin Ekle', 'Add New Food')}</p>
                            <input type="text" value={libName} onChange={(e) => setLibName(e.target.value)} placeholder={t('Besin adı', 'Food name')} className={T.inputCls} />
                            <div className="flex gap-2">
                                {(['porsiyon', 'gram'] as FoodUnit[]).map((u) => (
                                    <button
                                        key={u}
                                        type="button"
                                        onClick={() => setLibUnit(u)}
                                        className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${libUnit === u ? T.accentBtn : `border ${T.cardBorder} ${T.dropdownBg} ${T.title}`}`}
                                    >
                                        {u === 'porsiyon' ? t('1 porsiyon bazlı', 'Per 1 portion') : t('100 gram bazlı', 'Per 100 grams')}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: t('Kalori', 'Calories'), value: libKcal, set: setLibKcal },
                                    { label: t('Protein (g)', 'Protein (g)'), value: libProtein, set: setLibProtein },
                                    { label: t('Karbonhidrat (g)', 'Carbs (g)'), value: libCarb, set: setLibCarb },
                                    { label: t('Yağ (g)', 'Fat (g)'), value: libFat, set: setLibFat },
                                ].map(({ label, value, set }) => (
                                    <label key={label} className="space-y-1">
                                        <span className={`text-xs ${T.subtitle}`}>{label}</span>
                                        <input type="number" value={value} onChange={(e) => set(e.target.value)} placeholder="0" className={T.inputCls} />
                                    </label>
                                ))}
                            </div>
                            <button type="button" onClick={handleSave} className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${T.accentBtn}`}>
                                {t('Kaydet', 'Save')}
                            </button>
                        </div>

                        {/* Food list */}
                        <div className="space-y-2">
                            <p className={`text-xs font-semibold uppercase tracking-wide ${T.subtitle}`}>{t('Kayıtlı Besinler', 'Saved Foods')}</p>
                            {libraryFoods.map((food) => {
                                const isBuiltin = BUILTIN_FOODS.some((b) => b.id === food.id);
                                return (
                                    <div
                                        key={food.id}
                                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${T.cardBorder} ${T.dropdownBg} ${onSelect ? 'cursor-pointer transition' : ''}`}
                                        onClick={onSelect ? () => handleSelect(food) : undefined}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={`text-sm font-semibold ${T.title} truncate`}>{food.name}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    food.unit === 'gram' 
                                                        ? 'bg-slate-200 text-slate-700' 
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {food.unit === 'gram' ? t('gram', 'gram') : t('porsiyon', 'portion')}
                                                </span>
                                            </div>
                                            <p className={`text-[11px] ${T.subtitle}`}>
                                                <span className="font-bold text-[#0A7C6E]">{food.unit === 'gram' ? '100 gr' : '1 adet'}: {Math.round(food.kcal)} kcal</span>
                                                <span className="mx-1.5 text-slate-300">|</span>
                                                <span className="text-rose-500 font-semibold">P: {Math.round(food.protein)}g</span>
                                                <span className="mx-1.5 text-slate-300">|</span>
                                                <span className="text-amber-500 font-semibold">K: {Math.round(food.carb)}g</span>
                                                <span className="mx-1.5 text-slate-300">|</span>
                                                <span className="text-indigo-500 font-semibold">Y: {Math.round(food.fat)}g</span>
                                            </p>
                                        </div>
                                        <div className="ml-3 flex items-center gap-1 shrink-0">
                                            {!isBuiltin && (
                                                <button
                                                    type="button"
                                                    aria-label={t('Düzenle', 'Edit')}
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(food); }}
                                                    className={`grid h-8 w-8 place-items-center rounded-full border ${T.cardBorder} ${T.title} transition ${T.dropdownBg}`}
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                                                </button>
                                            )}
                                            {!isBuiltin && (
                                                <button
                                                    type="button"
                                                    aria-label={t('Sil', 'Delete')}
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        if (window.confirm(t('Bu besini kütüphaneden silmek istediğinize emin misiniz?', 'Are you sure you want to delete this food from library?'))) {
                                                            handleDelete(food.id); 
                                                        }
                                                    }}
                                                    className="grid h-8 w-8 place-items-center rounded-full bg-rose-500/10 text-rose-500 transition hover:bg-rose-500/20 hover:scale-105 active:scale-95"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        ),
        document.body
    );
}
