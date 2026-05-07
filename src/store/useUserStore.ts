import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { DailyLog, FoodItem, MealCategory, UserGoal, UserStats, WaterEntry } from '../types';
import {
    calculateDailyCalorieDelta,
    calculateIntakeFromDays,
    calculateMinDaysForSafety,
    calculateTDEE,
    validateIntake,
} from '../utils/healthEngine';
import { THEME_PRESETS, type ThemeKey } from '../constants/themes';
import { todayString } from '../constants/dashboardConstants';

export interface WeightEntry {
    id: string;
    date: string;
    weight: number;
}

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
    email: string;
    theme: ThemeKey;
    waterTarget: number;
    weightLog: WeightEntry[];
    setStats: (stats: UserStats) => void;
    setGoal: (goal: UserGoal) => void;
    setLanguage: (language: 'tr' | 'en') => void;
    setEmail: (email: string) => void;
    setTheme: (theme: ThemeKey) => void;
    setWaterTarget: (ml: number) => void;
    addWeightEntry: (weight: number, date?: string) => void;
    updateWeightEntry: (id: string, weight: number, date: string) => void;
    removeWeightEntry: (id: string) => void;
    addLog: (log: DailyLog) => void;
    updateLog: (date: string, updates: Partial<DailyLog>) => void;
    addFoodToMeal: (date: string, categoryName: string, food: FoodItem) => void;
    removeFoodFromMeal: (date: string, categoryName: string, foodId: string) => void;
    removeCategoryEntirely: (date: string, categoryName: string) => void;
    addFoodToLibrary: (food: FoodItem) => void;
    deleteFromLibrary: (foodId: string) => void;
    removeLog: (date: string) => void;
    addWaterEntry: (date: string, amount: number) => void;
    removeWaterEntry: (date: string, entryId: string) => void;
    updateWaterEntry: (date: string, entryId: string, amount: number) => void;
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
        waterEntries: log.waterEntries ?? [],
    };
}

function sumWaterEntries(entries: WaterEntry[]): number {
    return entries.reduce((s, e) => s + e.amount, 0);
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
            email: '',
            theme: 'light',
            waterTarget: 2000,
            weightLog: [],
            setStats: (stats) => set({ stats }),
            setGoal: (goal) => set({ goal }),
            setLanguage: (language) => set({ language }),
            setEmail: (email) => set({ email }),
            setTheme: (theme) => set({ theme }),
            setWaterTarget: (waterTarget) => set({ waterTarget }),
            addWeightEntry: (weight, date) =>
                set((state) => {
                    const entryDate = date || todayString();
                    const newEntry: WeightEntry = { id: `weight-${Date.now()}`, date: entryDate, weight };
                    const nextLog = [...state.weightLog, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const latestEntry = nextLog[nextLog.length - 1];
                    const nextStats = state.stats ? { ...state.stats, currentWeight: latestEntry.weight } : null;
                    if (nextStats) nextStats.TDEE = calculateTDEE(nextStats);
                    return { weightLog: nextLog, stats: nextStats };
                }),
            updateWeightEntry: (id, weight, date) =>
                set((state) => {
                    const nextLog = state.weightLog.map(e => e.id === id ? { ...e, weight, date } : e).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const latestEntry = nextLog[nextLog.length - 1];
                    const nextStats = state.stats && latestEntry ? { ...state.stats, currentWeight: latestEntry.weight } : state.stats;
                    if (nextStats) nextStats.TDEE = calculateTDEE(nextStats);
                    return { weightLog: nextLog, stats: nextStats };
                }),
            removeWeightEntry: (id) =>
                set((state) => {
                    const nextLog = state.weightLog.filter(e => e.id !== id);
                    const latestEntry = nextLog[nextLog.length - 1];
                    const nextStats = state.stats && latestEntry ? { ...state.stats, currentWeight: latestEntry.weight } : state.stats;
                    if (nextStats) nextStats.TDEE = calculateTDEE(nextStats);
                    return { weightLog: nextLog, stats: nextStats };
                }),
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
                                { ...createEmptyLog(date), categories: [newCategory] },
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

                    nextLogs[existingIndex] = { ...activeLog, categories: nextCategories };
                    return { logs: nextLogs };
                }),
            removeFoodFromMeal: (date, categoryName, foodId) =>
                set((state) => ({
                    logs: state.logs.map((log) => {
                        if (log.date !== date) return log;
                        const shapedLog = ensureLogShape(log);
                        return {
                            ...shapedLog,
                            categories: shapedLog.categories.map((category) =>
                                category.name === categoryName
                                    ? { ...category, items: category.items.filter((item) => item.id !== foodId) }
                                    : category
                            ),
                        };
                    }),
                })),
            removeCategoryEntirely: (date, categoryName) =>
                set((state) => ({
                    logs: state.logs.map((log) => {
                        if (log.date !== date) return log;
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
                    return { personalFoods: [...state.personalFoods, food] };
                }),
            deleteFromLibrary: (foodId) =>
                set((state) => ({
                    personalFoods: state.personalFoods.filter((food) => food.id !== foodId),
                })),
            removeLog: (date) =>
                set((state) => ({
                    logs: state.logs.filter((log) => log.date !== date),
                })),
            addWaterEntry: (date, amount) =>
                set((state) => {
                    const newEntry: WaterEntry = { id: `water-${Date.now()}`, amount };
                    const idx = state.logs.findIndex((l) => l.date === date);
                    if (idx === -1) {
                        return {
                            logs: [
                                ...state.logs,
                                { ...createEmptyLog(date), waterEntries: [newEntry], waterIntake: amount },
                            ],
                        };
                    }
                    const next = [...state.logs];
                    const shaped = ensureLogShape(next[idx]);
                    const entries = [...(shaped.waterEntries ?? []), newEntry];
                    next[idx] = { ...shaped, waterEntries: entries, waterIntake: sumWaterEntries(entries) };
                    return { logs: next };
                }),
            removeWaterEntry: (date, entryId) =>
                set((state) => ({
                    logs: state.logs.map((log) => {
                        if (log.date !== date) return log;
                        const shaped = ensureLogShape(log);
                        const entries = shaped.waterEntries!.filter((e) => e.id !== entryId);
                        return { ...shaped, waterEntries: entries, waterIntake: sumWaterEntries(entries) };
                    }),
                })),
            updateWaterEntry: (date, entryId, amount) =>
                set((state) => ({
                    logs: state.logs.map((log) => {
                        if (log.date !== date) return log;
                        const shaped = ensureLogShape(log);
                        const entries = shaped.waterEntries!.map((e) =>
                            e.id === entryId ? { ...e, amount } : e
                        );
                        return { ...shaped, waterEntries: entries, waterIntake: sumWaterEntries(entries) };
                    }),
                })),
            clearAll: () =>
                set({ stats: null, goal: null, logs: [], personalFoods: [], weightLog: [], email: '' }),
        }),
        { name: 'vitalstrack-user-store' }
    )
);

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useActiveTheme() {
    const theme = useUserStore((s) => s.theme);
    if (theme && theme in THEME_PRESETS) {
        return THEME_PRESETS[theme as ThemeKey];
    }
    return THEME_PRESETS.light;
}

export function useDailyCalorieTarget(
    draftStats?: UserStats | null,
    draftGoal?: UserGoal | null
): DailyCalorieTarget | null {
    const storedStats = useUserStore((state) => state.stats);
    const storedGoal = useUserStore((state) => state.goal);

    const activeStats = draftStats ?? storedStats;
    const activeGoal = draftGoal ?? storedGoal;

    if (!activeStats || !activeGoal) return null;

    try {
        const minSafeDays = calculateMinDaysForSafety(activeStats, activeGoal);
        const intake = calculateIntakeFromDays(activeStats, activeGoal, minSafeDays);
        const delta = calculateDailyCalorieDelta(activeStats, activeGoal);
        const requiredDailyCalories = activeStats.TDEE - delta;
        const warning = validateIntake(activeStats, intake);
        return { intake, minSafeDays, warning, requiredDailyCalories };
    } catch {
        return null;
    }
}
