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
}

export interface UserGoal {
  targetWeight: number;
  targetDate: string;
  weeklySportQuota: number;
}

export interface DailyLog {
  date: string;
  calories: number;
  isSportDone: boolean;
  water?: number;
  sleep?: number;
}
