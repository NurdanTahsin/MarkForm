import { useState } from 'react';
import { useActiveTheme, useUserStore } from '../../../store/useUserStore';
import type { ActiveSection } from '../../../constants/dashboardConstants';
import { FoodSection } from './FoodSection';
import { WaterSection } from './WaterSection';
import { ExerciseSection } from './ExerciseSection';

export function ActionCard() {
    const T = useActiveTheme();
    const language = useUserStore((s) => s.language);
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);

    const [activeSection, setActiveSection] = useState<ActiveSection>('food');

    return (
        <section className={`rounded-3xl border p-3 sm:p-4 ${T.cardBg} ${T.cardBorder} shadow-sm`}>
            {/* Section tabs */}
            <div className="grid grid-cols-3 gap-1.5 mb-3 sm:gap-2">
                {([
                    { key: 'food', label: t('Yemek +', 'Add Food') },
                    { key: 'water', label: t('Su Ekle', 'Add Water') },
                    { key: 'exercise', label: t('Egzersiz Ekle', 'Add Exercise') },
                ] as { key: ActiveSection; label: string }[]).map(({ key, label }) => {
                    const tabTone = activeSection === key
                        ? T.accentBtn
                        : ['border', T.cardBorder, T.title, T.mutedSurface].join(' ');

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveSection(key)}
                            className={`min-w-0 rounded-full px-1.5 py-2 text-[10px] font-semibold leading-tight transition sm:px-3 sm:py-2 sm:text-sm ${tabTone}`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Content area — min-h keeps card stable between tabs */}
            <div className="min-h-64">
                {activeSection === 'food' && <FoodSection />}
                {activeSection === 'water' && <WaterSection />}
                {activeSection === 'exercise' && <ExerciseSection />}
            </div>
        </section>
    );
}
