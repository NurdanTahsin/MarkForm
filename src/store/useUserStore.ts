import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { DailyLog, FoodItem, MealCategory, UserGoal, UserStats } from '../types';
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
    personalFoods: FoodItem[];
    language: 'tr' | 'en';
    setStats: (stats: UserStats) => void;
    setGoal: (goal: UserGoal) => void;
    setLanguage: (language: 'tr' | 'en') => void;
    addLog: (log: DailyLog) => void;
    updateLog: (date: string, updates: Partial<DailyLog>) => void;
    addFoodToMeal: (date: string, categoryName: string, food: FoodItem) => void;
    removeFoodFromMeal: (date: string, categoryName: string, foodId: string) => void;
    removeCategoryEntirely: (date: string, categoryName: string) => void;
    addFoodToLibrary: (food: FoodItem) => void;
    deleteFromLibrary: (foodId: string) => void;
    clearAll: () => void;
}

function createEmptyLog(date: string): DailyLog {
    return {
        date,
        categories: [],
        workoutDone: false,
        waterIntake: 0,
        calories: 0,
        isSportDone: false,
        water: 0,
    };
}

function ensureLogShape(log: DailyLog): DailyLog {
    return {
        ...log,
        categories: log.categories ?? [],
        workoutDone: log.workoutDone ?? log.isSportDone ?? false,
        waterIntake: log.waterIntake ?? log.water ?? 0,
    };
}

function createMealCategory(name: string): MealCategory {
    return {
        id: `cat-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name,
        items: [],
    };
}

export const useUserStore = create<UserStoreState>()(
    persist(
        (set) => ({
            stats: null,
            goal: null,
            logs: [],
            personalFoods: [],
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
            addFoodToMeal: (date, categoryName, food) =>
                set((state) => {
                    const existingIndex = state.logs.findIndex((log) => log.date === date);

                    if (existingIndex === -1) {
                        const newCategory = createMealCategory(categoryName);
                        newCategory.items.push(food);

                        return {
                            logs: [
                                ...state.logs,
                                {
                                    ...createEmptyLog(date),
                                    categories: [newCategory],
                                },
                            ],
                        };
                    }

                    const nextLogs = [...state.logs];
                    const activeLog = ensureLogShape(nextLogs[existingIndex]);
                    const categoryIndex = activeLog.categories.findIndex(
                        (category) => category.name === categoryName
                    );

                    let nextCategories: MealCategory[];

                    if (categoryIndex === -1) {
                        const newCategory = createMealCategory(categoryName);
                        newCategory.items.push(food);
                        nextCategories = [...activeLog.categories, newCategory];
                    } else {
                        nextCategories = activeLog.categories.map((category, index) =>
                            index === categoryIndex
                                ? { ...category, items: [...category.items, food] }
                                : category
                        );
                    }

                    nextLogs[existingIndex] = {
                        ...activeLog,
                        categories: nextCategories,
                    };

                    return { logs: nextLogs };
                }),
            removeFoodFromMeal: (date, categoryName, foodId) =>
                set((state) => ({
                    logs: state.logs.map((log) => {
                        if (log.date !== date) {
                            return log;
                        }

                        const shapedLog = ensureLogShape(log);
                        return {
                            ...shapedLog,
                            categories: shapedLog.categories.map((category) =>
                                category.name === categoryName
                                    ? {
                                        ...category,
                                        items: category.items.filter((item) => item.id !== foodId),
                                    }
                                    : category
                            ),
                        };
                    }),
                })),
            removeCategoryEntirely: (date, categoryName) =>
                set((state) => ({
                    logs: state.logs.map((log) => {
                        if (log.date !== date) {
                            return log;
                        }

                        const shapedLog = ensureLogShape(log);
                        return {
                            ...shapedLog,
                            categories: shapedLog.categories.filter(
                                (category) => category.name !== categoryName
                            ),
                        };
                    }),
                })),
            addFoodToLibrary: (food) =>
                set((state) => {
                    const exists = state.personalFoods.some((item) => item.id === food.id);

                    if (exists) {
                        return {
                            personalFoods: state.personalFoods.map((item) =>
                                item.id === food.id ? food : item
                            ),
                        };
                    }

                    return {
                        personalFoods: [...state.personalFoods, food],
                    };
                }),
            deleteFromLibrary: (foodId) =>
                set((state) => ({
                    personalFoods: state.personalFoods.filter((food) => food.id !== foodId),
                })),
            clearAll: () => set({ stats: null, goal: null, logs: [], personalFoods: [] }),
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
