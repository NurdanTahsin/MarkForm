import { useState } from 'react';
import { useActiveTheme, useUserStore } from '../../../store/useUserStore';
import { useToastStore } from '../../../store/useToastStore';
import type { DailyLog } from '../../../types';
import {
    EXERCISE_OPTIONS,
    exerciseLabel,
    todayString,
    toNumber,
} from '../../../constants/dashboardConstants';

export function ExerciseSection({ targetDate }: { targetDate?: string }) {
    const T = useActiveTheme();
    const language = useUserStore((s) => s.language);
    const stats = useUserStore((s) => s.stats);
    const logs = useUserStore((s) => s.logs);
    const addLog = useUserStore((s) => s.addLog);
    const updateLog = useUserStore((s) => s.updateLog);
    const addToast = useToastStore((s) => s.addToast);
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);

    const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
    const [exManualName, setExManualName] = useState('');
    const [exDuration, setExDuration] = useState('');

    const today = targetDate ?? todayString();
    const todayLog = logs.find((l) => l.date === today);

    const calcExerciseCalories = (durationMinutes: number): number => {
        const weightKg = stats?.currentWeight ?? 70;
        return Math.round((3.5 * weightKg * durationMinutes) / 60);
    };

    const ensureTodayLog = (updates: Partial<DailyLog>) => {
        if (todayLog) updateLog(today, updates);
        else addLog({ date: today, categories: [], workoutDone: false, waterIntake: 0, waterEntries: [], ...updates } as DailyLog);
    };

    const handleSetExercise = (key: string) => {
        setSelectedExercise(key);
        setExDuration('');
        setExManualName('');
    };

    const handleSaveExercise = () => {
        const dur = toNumber(exDuration);
        if (!selectedExercise || dur <= 0) return;
        if (selectedExercise === 'manual' && !exManualName.trim()) return;
        const name = selectedExercise === 'manual'
            ? exManualName.trim()
            : exerciseLabel(selectedExercise, language);
        ensureTodayLog({ workoutDone: true, workoutName: name, workoutDuration: dur });
        setExDuration('');
        setExManualName('');
        addToast(t('Egzersiz başarıyla eklendi.', 'Exercise successfully added.'));
    };

    return (
        <div className="space-y-4 pb-3">
            <div className="grid grid-cols-3 gap-2">
                {EXERCISE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedExercise === opt.key;
                    return (
                        <button
                            key={opt.key}
                            type="button"
                            onClick={() => handleSetExercise(opt.key)}
                            className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-sm font-semibold transition ${isSelected
                                ? T.accentBtn
                                : `${T.cardBorder} ${T.dropdownBg} ${T.title}`}`}
                        >
                            <Icon className="h-5 w-5" strokeWidth={1.8} />
                            <span className="text-xs">{language === 'tr' ? opt.labelTr : opt.labelEn}</span>
                        </button>
                    );
                })}
            </div>

            {selectedExercise === 'manual' ? (
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="text"
                        value={exManualName}
                        onChange={(e) => setExManualName(e.target.value)}
                        placeholder={t('Egzersiz adı', 'Exercise name')}
                        className={`${T.inputCls} py-4`}
                    />
                    <input
                        type="number"
                        value={exDuration}
                        onChange={(e) => setExDuration(e.target.value)}
                        placeholder={t('Süre (dakika)', 'Duration (minutes)')}
                        className={`${T.inputCls} py-4`}
                    />
                </div>
            ) : (
                <input
                    type="number"
                    value={exDuration}
                    onChange={(e) => setExDuration(e.target.value)}
                    placeholder={t('Süre (dakika)', 'Duration (minutes)')}
                    className={`${T.inputCls} py-4`}
                />
            )}

            {toNumber(exDuration) > 0 && (
                <p className={`text-xs ${T.subtitle}`}>
                    {t('Tahmini yakılan kalori:', 'Estimated calories burned:')}{' '}
                    <span className={`font-semibold ${T.title}`}>
                        ~{calcExerciseCalories(toNumber(exDuration))} kcal
                    </span>
                </p>
            )}

            <button
                type="button"
                onClick={handleSaveExercise}
                disabled={!selectedExercise || toNumber(exDuration) <= 0 || (selectedExercise === 'manual' && !exManualName.trim())}
                className={`w-full rounded-xl px-4 py-3.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${T.accentSecondary}`}
            >
                {t('Kaydet', 'Save')}
            </button>
        </div>
    );
}
