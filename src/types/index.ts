export interface UserStats {
  name?: string;
  age: number;
  height: number;
  currentWeight: number;
  gender: 'male' | 'female';
  activityLevel: string;
  TDEE: number;
  cycleTrackingEnabled?: boolean;
  lastPeriodStartDate?: string;
  averageCycleLength?: number;
  periodLength?: number;
}

export interface UserGoal {
  targetWeight: number;
  targetDate: string;
  weeklySportQuota: number;
}

export type FoodUnit = 'porsiyon' | 'gram';

export interface FoodItem {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  unit: FoodUnit;
}

export interface MealCategory {
  id: string;
  name: string;
  items: FoodItem[];
}

export interface WaterEntry {
  id: string;
  amount: number; // ml
}

export interface DailyLog {
  date: string;
  categories: MealCategory[];
  workoutDone: boolean;
  waterIntake: number;
  waterEntries?: WaterEntry[];
  workoutName?: string;
  workoutDuration?: number; // dakika
  // Legacy alanlar: mevcut ekranlari kirilmadan gecis yapabilmek icin tutuldu.
  calories?: number;
  isSportDone?: boolean;
  water?: number;
}
