import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useActiveTheme, useUserStore } from '../../../store/useUserStore';
import { useToastStore } from '../../../store/useToastStore';
import { WATER_OPTIONS, todayString, toNumber } from '../../../constants/dashboardConstants';

export function WaterSection({ targetDate }: { targetDate?: string }) {
    const T = useActiveTheme();
    const language = useUserStore((s) => s.language);
    const addWaterEntry = useUserStore((s) => s.addWaterEntry);
    const addToast = useToastStore((s) => s.addToast);
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);

    const today = targetDate ?? todayString();
    const [showWaterManual, setShowWaterManual] = useState(false);
    const [waterManualInput, setWaterManualInput] = useState('');

    const [selectedWaterPreset, setSelectedWaterPreset] = useState<number | null>(null);

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
        addToast(t('Su başarıyla eklendi.', 'Water successfully added.'));
    };

    return (
        <div className="space-y-4 pb-3">
            <div className="grid grid-cols-3 gap-2">
                {WATER_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedWaterPreset === opt.value && !showWaterManual;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { setSelectedWaterPreset(opt.value); setShowWaterManual(false); }}
                            className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-sm font-semibold transition bg-transparent border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:scale-105 active:scale-95 ${isSelected ? 'bg-blue-500/20 shadow-inner' : ''}`}
                        >
                            <Icon className="h-5 w-5" strokeWidth={1.8} />
                            <span className="text-xs">{language === 'tr' ? opt.labelTr : opt.labelEn}</span>
                        </button>
                    );
                })}
                <button
                    type="button"
                    onClick={() => { setShowWaterManual((p) => !p); setSelectedWaterPreset(null); }}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-sm font-semibold transition bg-transparent border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:scale-105 active:scale-95 ${showWaterManual ? 'bg-blue-500/20 shadow-inner' : ''}`}
                >
                    <Plus className="h-5 w-5" strokeWidth={1.8} />
                    <span className="text-xs">{t('Manuel', 'Manual')}</span>
                </button>
            </div>

            {/* Always rendered — invisible when not manual to keep button position fixed */}
            <input
                type="number"
                value={waterManualInput}
                onChange={(e) => setWaterManualInput(e.target.value)}
                placeholder={t('Miktar girin (ml)', 'Enter amount (ml)')}
                className={`${T.inputCls} py-4 ${!showWaterManual ? 'invisible pointer-events-none' : ''}`}
                autoFocus={showWaterManual}
            />

            <button
                type="button"
                onClick={handleAddWater}
                disabled={showWaterManual ? !waterManualInput : selectedWaterPreset === null}
                className={`w-full rounded-xl px-4 py-3.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${T.accentSecondary}`}
            >
                {t('Ekle', 'Add')}
            </button>
        </div>
    );
}
