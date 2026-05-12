import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Utensils, Droplets, Dumbbell } from 'lucide-react';
import { useActiveTheme, useUserStore } from '../../../store/useUserStore';
import { FoodSection } from '../ActionCard/FoodSection';
import { WaterSection } from '../ActionCard/WaterSection';
import { ExerciseSection } from '../ActionCard/ExerciseSection';

type Tab = 'food' | 'water' | 'exercise';

interface Props {
    date: string;
    dateLabel: string;
    onClose: () => void;
}

export function AddEntryModal({ date, dateLabel, onClose }: Props) {
    const T = useActiveTheme();
    const language = useUserStore((s) => s.language);
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);
    const [activeTab, setActiveTab] = useState<Tab>('food');

    const tabs: { key: Tab; label: string; icon: typeof Utensils }[] = [
        { key: 'food', label: t('Yemek', 'Food'), icon: Utensils },
        { key: 'water', label: t('Su', 'Water'), icon: Droplets },
        { key: 'exercise', label: t('Egzersiz', 'Exercise'), icon: Dumbbell },
    ];

    return createPortal(
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative w-full max-w-md rounded-3xl ${T.cardBg} border ${T.cardBorder} shadow-2xl z-10 overflow-hidden`}
                style={{ maxHeight: '90vh' }}>

                {/* Header */}
                <div className={`flex items-center justify-between px-5 py-4 border-b ${T.cardBorder}`}>
                    <div>
                        <h3 className={`text-base font-bold ${T.title}`}>{t('Kayıt Ekle', 'Add Entry')}</h3>
                        <p className={`text-xs mt-0.5 ${T.subtitle}`}>{dateLabel}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`grid h-8 w-8 place-items-center rounded-full border ${T.cardBorder} ${T.mutedSurface} ${T.title} transition`}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className={`flex border-b ${T.cardBorder} px-5 gap-1`}>
                    {tabs.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-1.5 px-3 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
                                activeTab === key
                                    ? `${T.accent} border-current`
                                    : `${T.subtitle} border-transparent`
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>
                    {activeTab === 'food' && (
                        <FoodSection targetDate={date} />
                    )}
                    {activeTab === 'water' && (
                        <WaterSection targetDate={date} />
                    )}
                    {activeTab === 'exercise' && (
                        <ExerciseSection targetDate={date} />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
