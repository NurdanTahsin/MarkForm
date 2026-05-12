import type { FoodItem } from '../../../types';
import { toDateOnly, toIsoDate, shiftDate } from '../../../utils/dateUtils';
import type { AppLanguage } from '../../../constants/dashboardConstants';
import { MEAL_META } from '../../../constants/dashboardConstants';

export { toDateOnly, toIsoDate, shiftDate };

const DAY_MS = 86400000;

export function formatDayLabel(targetDate: Date, language: AppLanguage) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((targetDate.getTime() - today.getTime()) / DAY_MS);

    if (diff === 0) return language === 'tr' ? 'Bugün' : 'Today';
    if (diff === -1) return language === 'tr' ? 'Dün' : 'Yesterday';
    if (diff === 1) return language === 'tr' ? 'Yarın' : 'Tomorrow';

    return targetDate.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
        day: 'numeric',
        month: 'long',
    });
}

export function formatWeekday(date: Date, language: AppLanguage) {
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    return date.toLocaleDateString(locale, { weekday: 'short' }).toLocaleUpperCase(locale);
}

export function getLogTotals(categories: Array<{ items: FoodItem[] }>) {
    const allItems = categories.flatMap((category) => category.items);
    return {
        kcal: allItems.reduce((sum, item) => sum + item.kcal, 0),
        protein: allItems.reduce((sum, item) => sum + item.protein, 0),
        carb: allItems.reduce((sum, item) => sum + item.carb, 0),
        fat: allItems.reduce((sum, item) => sum + item.fat, 0),
        count: allItems.length,
    };
}

export function buildWorkoutPlanIndices(sessionCount: number): Set<number> {
    const safeCount = Math.max(0, Math.min(sessionCount, 7));
    if (safeCount === 0) return new Set<number>();
    const indices = new Set<number>();
    const step = 7 / safeCount;
    for (let i = 0; i < safeCount; i += 1) {
        const day = Math.min(7, Math.max(1, Math.round(1 + i * step)));
        indices.add(day);
    }
    return indices;
}

export interface Past30LogEntry {
    log: import('../../../types').DailyLog;
    dateObj: Date;
    totals: ReturnType<typeof getLogTotals>;
    waterEntries: import('../../../types').WaterEntry[];
    waterAmount: number;
    mealsByKey: Array<{ meal: typeof MEAL_META[number]; items: FoodItem[] }>;
    hasData: boolean;
    isWorkoutDone: boolean;
    workoutName: string | undefined;
    workoutDuration: number;
}

export function buildPast30Logs(
    logs: import('../../../types').DailyLog[],
    last30Start: Date
): Past30LogEntry[] {
    const result: Past30LogEntry[] = [];
    const logMap = new Map(logs.map((l) => [l.date, l]));

    for (let i = 0; i <= 29; i++) {
        const dateObj = shiftDate(last30Start, i);
        const isoDate = toIsoDate(dateObj);
        const log = logMap.get(isoDate) ?? {
            date: isoDate,
            categories: [],
            workoutDone: false,
            waterIntake: 0,
            waterEntries: [],
            calories: 0,
            isSportDone: false,
            water: 0,
        } as import('../../../types').DailyLog;

        const totals = getLogTotals(log.categories ?? []);
        const waterEntries = log.waterEntries ?? [];
        const waterAmount = log.waterIntake ?? waterEntries.reduce((sum, e) => sum + e.amount, 0);
        const mealsByKey = MEAL_META.map((meal) => ({
            meal,
            items: log.categories.find((c) => c.name === meal.storeLabel)?.items ?? [],
        })).filter((e) => e.items.length > 0);
        const hasData = totals.count > 0 || waterAmount > 0 || Boolean(log.workoutDone);

        result.push({
            log,
            dateObj,
            totals,
            waterEntries,
            waterAmount,
            mealsByKey,
            hasData,
            isWorkoutDone: Boolean(log.workoutDone),
            workoutName: log.workoutName,
            workoutDuration: log.workoutDuration ?? 0,
        });
    }

    // Most recent first
    return result.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
}

export function buildFuture7Logs(
    logs: import('../../../types').DailyLog[],
    todayDate: Date
): Past30LogEntry[] {
    const result: Past30LogEntry[] = [];
    const logMap = new Map(logs.map((l) => [l.date, l]));

    for (let i = 1; i <= 7; i++) {
        const dateObj = shiftDate(todayDate, i);
        const isoDate = toIsoDate(dateObj);
        const log = logMap.get(isoDate) ?? {
            date: isoDate,
            categories: [],
            workoutDone: false,
            waterIntake: 0,
            waterEntries: [],
            calories: 0,
            isSportDone: false,
            water: 0,
        } as import('../../../types').DailyLog;

        const totals = getLogTotals(log.categories ?? []);
        const waterEntries = log.waterEntries ?? [];
        const waterAmount = log.waterIntake ?? waterEntries.reduce((sum, e) => sum + e.amount, 0);
        const mealsByKey = MEAL_META.map((meal) => ({
            meal,
            items: log.categories.find((c) => c.name === meal.storeLabel)?.items ?? [],
        })).filter((e) => e.items.length > 0);
        const hasData = totals.count > 0 || waterAmount > 0 || Boolean(log.workoutDone);

        result.push({
            log,
            dateObj,
            totals,
            waterEntries,
            waterAmount,
            mealsByKey,
            hasData,
            isWorkoutDone: Boolean(log.workoutDone),
            workoutName: log.workoutName,
            workoutDuration: log.workoutDuration ?? 0,
        });
    }

    return result;
}
