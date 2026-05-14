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
import { resolveTheme } from '../constants/themes';
import { DEFAULT_FOODS, todayString } from '../constants/dashboardConstants';

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
    waterTarget: number;
    weightLog: WeightEntry[];
    setStats: (stats: UserStats) => void;
    setGoal: (goal: UserGoal) => void;
    setLanguage: (language: 'tr' | 'en') => void;
    setEmail: (email: string) => void;
    setWaterTarget: (ml: number) => void;
    addWeightEntry: (weight: number, date?: string) => void;
    updateWeightEntry: (id: string, weight: number, date: string) => void;
    removeWeightEntry: (id: string) => void;
    addLog: (log: DailyLog) => void;
    updateLog: (date: string, updates: Partial<DailyLog>) => void;
    addFoodToMeal: (date: string, categoryName: string, food: FoodItem) => void;
    removeFoodFromMeal: (date: string, categoryName: string, foodId: string) => void;
    updateFoodInMeal: (date: string, categoryName: string, foodId: string, updates: Partial<FoodItem>) => void;
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

function getLatestWeightEntry(entries: WeightEntry[]): WeightEntry | undefined {
    return entries.at(-1);
}

function patchStatsWithWeight(state: UserStoreState, latestEntry?: WeightEntry) {
    if (!state.stats || !latestEntry) return state.stats;
    const baseStats = { ...state.stats, currentWeight: latestEntry.weight };
    return { ...baseStats, TDEE: calculateTDEE(baseStats) };
}

function updateMealCategories(
    categories: MealCategory[],
    categoryName: string,
    updater: (items: FoodItem[]) => FoodItem[]
): MealCategory[] {
    return categories.map((category) => (
        category.name === categoryName
            ? { ...category, items: updater(category.items) }
            : category
    ));
}

function findOrAppendMealCategory(categories: MealCategory[], categoryName: string, food: FoodItem): MealCategory[] {
    const categoryIndex = categories.findIndex((category) => category.name === categoryName);
    if (categoryIndex === -1) {
        const newCategory = createMealCategory(categoryName);
        newCategory.items.push(food);
        return [...categories, newCategory];
    }

    return categories.map((category, index) => (
        index === categoryIndex ? { ...category, items: [...category.items, food] } : category
    ));
}

function removeFoodById(categories: MealCategory[], categoryName: string, foodId: string): MealCategory[] {
    return updateMealCategories(categories, categoryName, (items) => items.filter((item) => item.id !== foodId));
}

function removeCategoryByName(categories: MealCategory[], categoryName: string): MealCategory[] {
    return categories.filter((category) => category.name !== categoryName);
}

function updateFoodById(
    categories: MealCategory[],
    categoryName: string,
    foodId: string,
    updates: Partial<FoodItem>
): MealCategory[] {
    return updateMealCategories(categories, categoryName, (items) => (
        items.map((item) => (item.id === foodId ? { ...item, ...updates, id: item.id } : item))
    ));
}

function removeWaterEntryById(entries: WaterEntry[] | undefined, entryId: string): WaterEntry[] {
    return (entries ?? []).filter((entry) => entry.id !== entryId);
}

function updateWaterEntryById(entries: WaterEntry[] | undefined, entryId: string, amount: number): WaterEntry[] {
    return (entries ?? []).map((entry) => (entry.id === entryId ? { ...entry, amount } : entry));
}

export const useUserStore = create<UserStoreState>()(
    persist(
        (set) => ({
            stats: null,
            goal: null,
            logs: [],
            personalFoods: DEFAULT_FOODS,
            language: 'tr',
            email: '',
            waterTarget: 2000,
            weightLog: [],
            setStats: (stats) => set({ stats }),
            setGoal: (goal) => set({ goal }),
            setLanguage: (language) => set({ language }),
            setEmail: (email) => set({ email }),
            setWaterTarget: (waterTarget) => set({ waterTarget }),
            addWeightEntry: (weight, date) =>
                set((state) => {
                    const entryDate = date || todayString();
                    const newEntry: WeightEntry = { id: `weight-${Date.now()}`, date: entryDate, weight };
                    const nextLog = [...state.weightLog, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    return { weightLog: nextLog, stats: patchStatsWithWeight(state, getLatestWeightEntry(nextLog)) };
                }),
            updateWeightEntry: (id, weight, date) =>
                set((state) => {
                    const nextLog = state.weightLog.map(e => e.id === id ? { ...e, weight, date } : e).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    return { weightLog: nextLog, stats: patchStatsWithWeight(state, getLatestWeightEntry(nextLog)) };
                }),
            removeWeightEntry: (id) =>
                set((state) => {
                    const nextLog = state.weightLog.filter(e => e.id !== id);
                    return { weightLog: nextLog, stats: patchStatsWithWeight(state, getLatestWeightEntry(nextLog)) };
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
                    const nextCategories = findOrAppendMealCategory(activeLog.categories, categoryName, food);

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
                            categories: removeFoodById(shapedLog.categories, categoryName, foodId),
                        };
                    }),
                })),
            updateFoodInMeal: (date, categoryName, foodId, updates) =>
                set((state) => ({
                    logs: state.logs.map((log) => {
                        if (log.date !== date) return log;
                        const shapedLog = ensureLogShape(log);
                        return {
                            ...shapedLog,
                            categories: updateFoodById(shapedLog.categories, categoryName, foodId, updates),
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
                            categories: removeCategoryByName(shapedLog.categories, categoryName),
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
                        const entries = removeWaterEntryById(shaped.waterEntries, entryId);
                        return { ...shaped, waterEntries: entries, waterIntake: sumWaterEntries(entries) };
                    }),
                })),
            updateWaterEntry: (date, entryId, amount) =>
                set((state) => ({
                    logs: state.logs.map((log) => {
                        if (log.date !== date) return log;
                        const shaped = ensureLogShape(log);
                        const entries = updateWaterEntryById(shaped.waterEntries, entryId, amount);
                        return { ...shaped, waterEntries: entries, waterIntake: sumWaterEntries(entries) };
                    }),
                })),
            clearAll: () => {
                localStorage.removeItem('vitalstrack-user-store');
                set({ stats: null, goal: null, logs: [], personalFoods: [], weightLog: [], email: '' });
            },
        }),
        {
            name: 'vitalstrack-user-store',
            merge: (persistedState, currentState) => {
                const persisted = persistedState as Partial<UserStoreState> | undefined;
                if (!persisted) return currentState;
                const merged = { ...currentState, ...persisted };
                if (!Array.isArray(persisted.personalFoods) || persisted.personalFoods.length === 0) {
                    merged.personalFoods = currentState.personalFoods;
                }
                return merged;
            },
        }
    )
);

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useActiveTheme() {
    return resolveTheme();
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
