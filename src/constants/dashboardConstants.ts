import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    Bike,
    Coffee,
    Cookie,
    Droplets,
    Drumstick,
    Dumbbell,
    Footprints,
    GlassWater,
    Milk,
    Pizza,
    Plus,
    Wine,
    Zap,
} from 'lucide-react';
import type { FoodItem } from '../types';

export type MealKey = 'kahvalti' | 'ogle' | 'aksam' | 'atistirmalik';
export type EntryMode = 'library' | 'manual';
export type ActiveSection = 'food' | 'water' | 'exercise';
export type AppLanguage = 'tr' | 'en';

export const CIRCUMFERENCE = 289;

export const MEAL_META: Array<{
    key: MealKey;
    storeLabel: string;
    labelTr: string;
    labelEn: string;
    icon: LucideIcon;
    textTone: string;
    selectedTone: string;
    hoverTone: string;
}> = [
        { key: 'kahvalti', storeLabel: 'Kahvalti', labelTr: 'Kahvaltı', labelEn: 'Breakfast', icon: Coffee, textTone: 'text-amber-700', selectedTone: 'bg-amber-100 border-amber-400 text-amber-800', hoverTone: 'hover:bg-amber-50' },
        { key: 'ogle', storeLabel: 'Ogle', labelTr: 'Öğle', labelEn: 'Lunch', icon: Pizza, textTone: 'text-orange-700', selectedTone: 'bg-orange-100 border-orange-400 text-orange-800', hoverTone: 'hover:bg-orange-50' },
        { key: 'aksam', storeLabel: 'Aksam', labelTr: 'Akşam', labelEn: 'Dinner', icon: Drumstick, textTone: 'text-rose-700', selectedTone: 'bg-rose-100 border-rose-400 text-rose-800', hoverTone: 'hover:bg-rose-50' },
        { key: 'atistirmalik', storeLabel: 'Atistirmalik', labelTr: 'Atıştırmalık', labelEn: 'Snacks', icon: Cookie, textTone: 'text-indigo-700', selectedTone: 'bg-indigo-100 border-indigo-400 text-indigo-800', hoverTone: 'hover:bg-indigo-50' },
    ];

export const WATER_OPTIONS: Array<{ value: number; labelTr: string; labelEn: string; icon: LucideIcon }> = [
    { value: 100, labelTr: '100 ml', labelEn: '100 ml', icon: Coffee },
    { value: 200, labelTr: '200 ml', labelEn: '200 ml', icon: GlassWater },
    { value: 400, labelTr: '400 ml', labelEn: '400 ml', icon: Wine },
    { value: 500, labelTr: '500 ml', labelEn: '500 ml', icon: Milk },
    { value: 1000, labelTr: '1 lt', labelEn: '1 L', icon: Droplets },
];

export const EXERCISE_OPTIONS: Array<{ key: string; labelTr: string; labelEn: string; icon: LucideIcon }> = [
    { key: 'walk', labelTr: 'Yürüyüş', labelEn: 'Walk', icon: Footprints },
    { key: 'run', labelTr: 'Koşu', labelEn: 'Run', icon: Activity },
    { key: 'strength', labelTr: 'Güç', labelEn: 'Strength', icon: Dumbbell },
    { key: 'bike', labelTr: 'Bisiklet', labelEn: 'Bike', icon: Bike },
    { key: 'hiit', labelTr: 'Kardiyo', labelEn: 'Cardio', icon: Zap },
    { key: 'manual', labelTr: 'Manuel', labelEn: 'Manual', icon: Plus },
];

export const BUILTIN_FOODS: FoodItem[] = [
    { id: 'kofte', name: 'Köfte', kcal: 180, protein: 14, carb: 4, fat: 12, unit: 'porsiyon' },
    { id: 'tavuk', name: 'Tavuk', kcal: 165, protein: 31, carb: 0, fat: 4, unit: 'porsiyon' },
    { id: 'yogurt', name: 'Yoğurt', kcal: 90, protein: 5, carb: 8, fat: 3, unit: 'porsiyon' },
    { id: 'yumurta', name: 'Yumurta', kcal: 70, protein: 6, carb: 0, fat: 5, unit: 'porsiyon' },
    { id: 'pilav', name: 'Pilav (100g)', kcal: 130, protein: 3, carb: 28, fat: 1, unit: 'gram' },
    { id: 'ekmek', name: 'Ekmek', kcal: 80, protein: 3, carb: 15, fat: 1, unit: 'porsiyon' },
];

export function mealLabel(mealKey: MealKey, language: AppLanguage): string {
    const meal = MEAL_META.find((entry) => entry.key === mealKey);
    if (!meal) return mealKey;
    return language === 'tr' ? meal.labelTr : meal.labelEn;
}

export function exerciseLabel(exerciseKey: string, language: AppLanguage): string {
    const exercise = EXERCISE_OPTIONS.find((entry) => entry.key === exerciseKey);
    if (!exercise) return exerciseKey;
    return language === 'tr' ? exercise.labelTr : exercise.labelEn;
}

export function todayString(): string {
    return new Date().toISOString().split('T')[0];
}

export function toNumber(v: string): number {
    const n = Number(v.trim());
    return Number.isFinite(n) ? n : 0;
}

export function formatNutrition(item: FoodItem): string {
    const parts = [`${Math.round(item.kcal)} kcal`];
    if (item.protein > 0) parts.push(`p:${Math.round(item.protein)}g`);
    if (item.carb > 0) parts.push(`k:${Math.round(item.carb)}g`);
    if (item.fat > 0) parts.push(`y:${Math.round(item.fat)}g`);
    return parts.join(' · ');
}

export function formatWater(ml: number, language: AppLanguage = 'tr'): string {
    if (ml <= 0) return language === 'tr' ? '0 lt' : '0 L';
    if (ml < 1000) return `${ml} ml`;
    return `${(ml / 1000).toFixed(1)} ${language === 'tr' ? 'lt' : 'L'}`;
}

export function barPct(current: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
}
