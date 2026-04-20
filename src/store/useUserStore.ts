import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { DailyLog, UserGoal, UserStats } from '../types';
import {
    calculateDailyCalorieDelta,
    calculateIntakeFromDays,
    calculateMinDaysForSafety,
    validateIntake,
} from '../utils/healthEngine';

interface DailyCalorieTarget {
    intake: number;
    minSafeDays: number;
    warning: string | null;
    requiredDailyCalories: number;
}

interface UserStoreState {
    stats: UserStats | null;
    goal: UserGoal | null;
    logs: DailyLog[];
    language: 'tr' | 'en';
    setStats: (stats: UserStats) => void;
    setGoal: (goal: UserGoal) => void;
    setLanguage: (language: 'tr' | 'en') => void;
    addLog: (log: DailyLog) => void;
    updateLog: (date: string, updates: Partial<DailyLog>) => void;
    clearAll: () => void;
}

export const useUserStore = create<UserStoreState>()(
    persist(
        (set) => ({
            stats: null,
            goal: null,
            logs: [],
            language: 'tr',
            setStats: (stats) => set({ stats }),
            setGoal: (goal) => set({ goal }),
            setLanguage: (language) => set({ language }),
            addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
            updateLog: (date, updates) =>
                set((state) => ({
                    logs: state.logs.map((log) =>
                        log.date === date ? { ...log, ...updates, date: log.date } : log
                    ),
                })),
            clearAll: () => set({ stats: null, goal: null, logs: [] }),
        }),
        {
            name: 'vitalstrack-user-store',
        }
    )
);

export function useDailyCalorieTarget(
    draftStats?: UserStats | null,
    draftGoal?: UserGoal | null
): DailyCalorieTarget | null {
    const storedStats = useUserStore((state) => state.stats);
    const storedGoal = useUserStore((state) => state.goal);

    const activeStats = draftStats ?? storedStats;
    const activeGoal = draftGoal ?? storedGoal;

    if (!activeStats || !activeGoal) {
        return null;
    }

    try {
        const minSafeDays = calculateMinDaysForSafety(activeStats, activeGoal);
        const intake = calculateIntakeFromDays(activeStats, activeGoal, minSafeDays);
        const delta = calculateDailyCalorieDelta(activeStats, activeGoal);
        const requiredDailyCalories = activeStats.TDEE - delta;
        const warning = validateIntake(activeStats, intake);

        return {
            intake,
            minSafeDays,
            warning,
            requiredDailyCalories,
        };
    } catch {
        return null;
    }
}
