import { useMemo, useState } from 'react';
import { ChevronRight, ScanLine, AlertCircle, Sparkles, BookOpen, ChevronDown } from 'lucide-react';
import { useActiveTheme, useUserStore } from '../../../store/useUserStore';
import type { FoodItem } from '../../../types';
import {
    MEAL_META,
    mealLabel,
    todayString,
    toNumber,
    BUILTIN_FOODS,
} from '../../../constants/dashboardConstants';
import type { MealKey } from '../../../constants/dashboardConstants';
import { FoodLibraryModal } from '../FoodLibraryModal';
import { BarcodeScanner } from './BarcodeScanner';
import { fetchFoodByBarcode } from '../../../utils/openFoodFacts';
import { parseFoodInput } from '../../../utils/nlpEngine';
import { useToastStore } from '../../../store/useToastStore';

interface Props {
    targetDate?: string;
}

type AddMode = 'list' | 'manual' | 'smart' | 'barcode';

function getMealLabel(key: MealKey): string {
    return MEAL_META.find((m) => m.key === key)!.storeLabel;
}

export function FoodSection({ targetDate }: Props) {
    const T = useActiveTheme();
    const language = useUserStore((s) => s.language);
    const storeAddFood = useUserStore((s) => s.addFoodToMeal);
    const personalFoods = useUserStore((s) => s.personalFoods);
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);
    const addToast = useToastStore((s) => s.addToast);

    const today = targetDate ?? todayString();
    const [addMode, setAddMode] = useState<AddMode>('list');
    const [selectedMeal, setSelectedMeal] = useState<MealKey>('kahvalti');

    // Mode: List & Barcode
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [amountInput, setAmountInput] = useState('');
    const [showLibrary, setShowLibrary] = useState(false);

    // Mode: Manual
    const [manualName, setManualName] = useState('');
    const [manualKcal, setManualKcal] = useState('');
    const [manualProtein, setManualProtein] = useState('');
    const [manualCarb, setManualCarb] = useState('');
    const [manualFat, setManualFat] = useState('');

    // Mode: Smart
    const [smartText, setSmartText] = useState('');
    const [smartError, setSmartError] = useState('');

    // Barcode state
    const [showScanner, setShowScanner] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState('');

    const mealTone = (mealKey: MealKey, isActive: boolean) => {
        const palettes = {
            kahvalti: { idle: `${T.cardBorder} ${T.dropdownBg} text-[#FFD65A] hover:bg-[#FFD65A]/10`, active: 'border-[#FFD65A]/50 bg-[#FFD65A]/20 text-[#FFD65A]' }, // Soft Yellow
            ogle: { idle: `${T.cardBorder} ${T.dropdownBg} text-[#5B7E3C] hover:bg-[#5B7E3C]/10`, active: 'border-[#5B7E3C]/50 bg-[#5B7E3C]/20 text-[#5B7E3C]' }, // Grass Green
            aksam: { idle: `${T.cardBorder} ${T.dropdownBg} text-[#EA5252] hover:bg-[#EA5252]/10`, active: 'border-[#EA5252]/50 bg-[#EA5252]/20 text-[#EA5252]' }, // Red-Pink
            atistirmalik: { idle: `${T.cardBorder} ${T.dropdownBg} text-[#FF9D23] hover:bg-[#FF9D23]/10`, active: 'border-[#FF9D23]/50 bg-[#FF9D23]/20 text-[#FF9D23]' }, // Vibrant Orange
        };
        const tone = palettes[mealKey];
        return isActive ? tone.active : tone.idle;
    };

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

    const handleFoodSelected = (food: FoodItem) => {
        setSelectedFood(food);
        setAmountInput(food.unit === 'gram' ? '100' : '1');
    };

    const handleAddListOrBarcode = () => {
        if (!selectedFood || !preview) return;
        const amountLabel = selectedFood.unit === 'gram' ? `${amountInput}g` : `${amountInput} porsiyon`;
        storeAddFood(today, getMealLabel(selectedMeal), {
            id: `${selectedFood.id}-${Date.now()}`,
            name: `${selectedFood.name} (${amountLabel})`,
            kcal: preview.kcal,
            protein: preview.protein,
            carb: preview.carb,
            fat: preview.fat,
            unit: selectedFood.unit,
        });
        setSelectedFood(null);
        setAmountInput('');
        addToast(t('Besin başarıyla eklendi.', 'Food successfully added.'));
    };

    const handleAddManual = () => {
        if (!manualName.trim() || !manualKcal) return;
        storeAddFood(today, getMealLabel(selectedMeal), {
            id: `manual-${Date.now()}`,
            name: manualName,
            kcal: toNumber(manualKcal),
            protein: toNumber(manualProtein),
            carb: toNumber(manualCarb),
            fat: toNumber(manualFat),
            unit: 'porsiyon',
        });
        setManualName('');
        setManualKcal('');
        setManualProtein('');
        setManualCarb('');
        setManualFat('');
        addToast(t('Besin başarıyla eklendi.', 'Food successfully added.'));
    };

    const handleAddSmart = () => {
        setSmartError('');
        const combinedLibrary = [...BUILTIN_FOODS, ...personalFoods];
        const { food, amount, error } = parseFoodInput(smartText, combinedLibrary);

        if (error || !food) {
            setSmartError(error || t('Bir hata oluştu.', 'An error occurred.'));
            return;
        }

        const amountLabel = food.unit === 'gram' ? `${amount}g` : `${amount} porsiyon`;
        const factor = food.unit === 'gram' ? amount / 100 : amount;

        storeAddFood(today, getMealLabel(selectedMeal), {
            id: `${food.id}-smart-${Date.now()}`,
            name: `${food.name} (${amountLabel})`,
            kcal: Math.round(food.kcal * factor),
            protein: Math.round(food.protein * factor),
            carb: Math.round(food.carb * factor),
            fat: Math.round(food.fat * factor),
            unit: food.unit,
        });

        setSmartText('');
        addToast(t('Besin başarıyla eklendi.', 'Food successfully added.'));
    };

    const handleBarcodeScanned = async (barcode: string) => {
        setShowScanner(false);
        setIsScanning(true);
        setScanError('');

        // Strip any whitespace just in case
        const cleanBarcode = barcode.trim();

        const data = await fetchFoodByBarcode(cleanBarcode);
        setIsScanning(false);

        if (data && data.name) {
            setSelectedFood({
                id: `barcode-${cleanBarcode}`,
                name: data.name,
                kcal: data.kcal || 0,
                protein: data.protein || 0,
                carb: data.carb || 0,
                fat: data.fat || 0,
                unit: data.unit as 'gram' | 'porsiyon' || 'gram',
            });
            setAmountInput('100');
        } else {
            setScanError(t(`Barkod (${cleanBarcode}) bulunamadı veya eksik.`, `Barcode (${cleanBarcode}) not found or incomplete.`));
        }
    };

    return (
        <div className="space-y-4 pb-3 animate-in">
            {/* 1. Üst Kısım: Sekmeler ve Besin Listesi Butonu */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <select
                        value={addMode}
                        title={t('Besin ekleme modunu seçin', 'Select food addition mode')}
                        onChange={e => {
                            setAddMode(e.target.value as AddMode);
                            setSelectedFood(null);
                            setScanError('');
                        }}
                        className={`w-full rounded-xl pl-3 pr-9 py-3 text-sm font-semibold border ${T.cardBorder} ${T.inputBg} ${T.title} outline-none focus:${T.ring} appearance-none cursor-pointer transition-colors`}
                    >
                        <option value="list">{t('Listeden', 'From List')}</option>
                        <option value="manual">{t('Manuel', 'Manual')}</option>
                        <option value="smart">{t('Akıllı Ekleme', 'Smart Add')}</option>
                        <option value="barcode">{t('Barkod', 'Barcode')}</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDown className={`h-4 w-4 ${T.subtitle}`} />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShowLibrary(true)}
                    className={`shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold ${T.accent} ${T.accentSoft} border ${T.cardBorder} transition hover:opacity-80`}
                >
                    <BookOpen className="h-4 w-4" />
                    {t('Besin Listesi', 'Food Library')}
                </button>
            </div>

            {/* 2. Öğün Seçici */}
            <div className="grid grid-cols-4 gap-2">
                {MEAL_META.map((meal) => {
                    const isActive = meal.key === selectedMeal;
                    const Icon = meal.icon;
                    return (
                        <button
                            key={meal.key}
                            type="button"
                            onClick={() => setSelectedMeal(meal.key)}
                            className={`rounded-2xl border px-2 py-3.5 text-sm font-semibold transition ${mealTone(meal.key, isActive)}`}
                        >
                            <span className="flex flex-col items-center gap-1">
                                <Icon className="h-4 w-4" strokeWidth={2} />
                                <span className="text-[11px]">{mealLabel(meal.key, language)}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* 3. İçerik: Listeden Ekle */}
            {addMode === 'list' && (
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowLibrary(true)}
                        className={`w-full flex items-center justify-between rounded-xl border px-3 py-4 text-sm transition ${T.cardBorder} ${T.mutedSurface} ${selectedFood ? T.title : T.subtitle}`}
                    >
                        <span className="truncate">{selectedFood ? selectedFood.name : t('Besin Seç...', 'Select Food...')}</span>
                        <ChevronRight className="ml-1 h-4 w-4 shrink-0" strokeWidth={2} />
                    </button>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                            min="0"
                            step={selectedFood?.unit === 'gram' ? '10' : '0.5'}
                            placeholder={selectedFood?.unit === 'gram' ? t('Miktar (gram)', 'Amount (gram)') : t('Porsiyon', 'Portion')}
                            disabled={!selectedFood}
                            className={`flex-1 ${T.inputCls} disabled:opacity-40`}
                        />
                        <button
                            type="button"
                            onClick={handleAddListOrBarcode}
                            disabled={!preview}
                            className={`shrink-0 rounded-xl px-8 py-3.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${T.accentSecondary}`}
                        >
                            {t('Ekle', 'Add')}
                        </button>
                    </div>
                </div>
            )}

            {/* 3. İçerik: Manuel Ekle */}
            {addMode === 'manual' && (
                <div className="space-y-3">
                    <input
                        type="text"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder={t('Yemek Adı', 'Food Name')}
                        className={T.inputCls}
                    />
                    <div className="grid grid-cols-4 gap-2">
                        <input type="number" value={manualKcal} onChange={e => setManualKcal(e.target.value)} placeholder="Kcal" className={`${T.inputCls} px-2`} />
                        <input type="number" value={manualProtein} onChange={e => setManualProtein(e.target.value)} placeholder="Pro(g)" className={`${T.inputCls} px-2`} />
                        <input type="number" value={manualCarb} onChange={e => setManualCarb(e.target.value)} placeholder="Karb(g)" className={`${T.inputCls} px-2`} />
                        <input type="number" value={manualFat} onChange={e => setManualFat(e.target.value)} placeholder="Yağ(g)" className={`${T.inputCls} px-2`} />
                    </div>
                    <button
                        type="button"
                        onClick={handleAddManual}
                        disabled={!manualName.trim() || !manualKcal}
                        className={`w-full rounded-xl px-4 py-3.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${T.accentSecondary}`}
                    >
                        {t('Ekle', 'Add')}
                    </button>
                </div>
            )}

            {/* 3. İçerik: Akıllı Ekle */}
            {addMode === 'smart' && (
                <div className="space-y-3">
                    <p className={`text-xs ${T.subtitle}`}>
                        <Sparkles className={`inline-block h-3 w-3 mr-1 ${T.accent}`} />
                        {t('Ne yediğinizi yazın, biz anlayalım. (Örn: "100 gram tavuk" veya "2 elma")', 'Type what you ate, we will understand. (e.g., "100 grams chicken" or "2 apples")')}
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={smartText}
                            onChange={(e) => setSmartText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSmart()}
                            placeholder={t('Ne yediğinizi yazın...', 'Type what you ate...')}
                            className={`flex-1 ${T.inputCls}`}
                        />
                        <button
                            type="button"
                            onClick={handleAddSmart}
                            disabled={!smartText.trim()}
                            className={`shrink-0 rounded-xl px-8 py-3.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${T.accentSecondary}`}
                        >
                            {t('Ekle', 'Add')}
                        </button>
                    </div>
                    {smartError && <p className={`text-xs ${T.dangerText}`}>{smartError}</p>}
                </div>
            )}

            {/* 3. İçerik: Barkod */}
            {addMode === 'barcode' && (
                <div className="space-y-3">
                    {scanError && (
                        <div className={`flex items-center gap-2 p-3 rounded-xl border ${T.dangerSurface} ${T.dangerBorder} ${T.dangerText}`}>
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span className="text-sm">{scanError}</span>
                        </div>
                    )}

                    {!selectedFood ? (
                        <button
                            type="button"
                            onClick={() => setShowScanner(true)}
                            disabled={isScanning}
                            className={`w-full flex items-center justify-center gap-2 rounded-xl border px-3 py-8 text-sm transition ${T.cardBorder} ${T.mutedSurface} ${T.accent} hover:${T.accentSoft}`}
                        >
                            {isScanning ? (
                                <span className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    <ScanLine className="h-6 w-6" />
                                    <span>{t('Kamerayı Aç ve Barkod Okut', 'Open Camera & Scan')}</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <>
                            <div className={`flex items-center justify-between rounded-xl border px-3 py-4 text-sm ${T.cardBorder} ${T.mutedSurface} ${T.title}`}>
                                <span className="truncate">{selectedFood.name}</span>
                                <button type="button" onClick={() => setSelectedFood(null)} className={`text-xs ${T.accent}`}>{t('İptal', 'Cancel')}</button>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={amountInput}
                                    onChange={(e) => setAmountInput(e.target.value)}
                                    min="0"
                                    step="10"
                                    placeholder={t('Miktar (gram)', 'Amount (gram)')}
                                    className={`flex-1 ${T.inputCls}`}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddListOrBarcode}
                                    disabled={!preview}
                                    className={`shrink-0 rounded-xl px-8 py-3.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${T.accentSecondary}`}
                                >
                                    {t('Ekle', 'Add')}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            <FoodLibraryModal
                open={showLibrary}
                onClose={() => setShowLibrary(false)}
                onSelect={(food) => {
                    if (addMode !== 'list') setAddMode('list');
                    handleFoodSelected(food);
                }}
            />

            {showScanner && (
                <BarcodeScanner
                    onScan={handleBarcodeScanned}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
