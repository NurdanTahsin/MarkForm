import type { UserGoal, UserStats } from '../types';

const KCAL_PER_KG = 7700;

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    veryActive: 1.725,
    extraActive: 1.9,
};

/**
 * Calculates BMR with the Mifflin-St Jeor equation.
 */
export function calculateBMR(stats: UserStats): number {
    const base = 10 * stats.currentWeight + 6.25 * stats.height - 5 * stats.age;

    // Mifflin-St Jeor gender offset.
    return stats.gender === 'male' ? base + 5 : base - 161;
}

/**
 * Calculates TDEE by multiplying BMR with an activity factor.
 */
export function calculateTDEE(stats: UserStats): number {
    const bmr = calculateBMR(stats);
    const multiplier = ACTIVITY_MULTIPLIERS[stats.activityLevel] ?? 1.2;

    return bmr * multiplier;
}

/**
 * Calculates required daily calorie delta to hit target weight by target date.
 * Positive result means deficit (eat less), negative result means surplus (eat more).
 */
export function calculateDailyCalorieDelta(
    stats: UserStats,
    goal: UserGoal,
    referenceDate: Date = new Date()
): number {
    const targetDate = new Date(goal.targetDate);

    if (Number.isNaN(targetDate.getTime())) {
        throw new Error('Invalid targetDate. Use an ISO-compatible date string.');
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.ceil((targetDate.getTime() - referenceDate.getTime()) / msPerDay);

    if (daysLeft <= 0) {
        throw new Error('targetDate must be a future date.');
    }

    const weightDifferenceKg = stats.currentWeight - goal.targetWeight;
    const totalKcalChange = weightDifferenceKg * KCAL_PER_KG;

    return totalKcalChange / daysLeft;
}

/**
 * Calculates required daily intake to hit target weight in exactly X days.
 */
export function calculateIntakeFromDays(
    stats: UserStats,
    goal: UserGoal,
    days: number
): number {
    if (!Number.isFinite(days) || days <= 0) {
        throw new Error('days must be a positive number.');
    }

    const tdee = calculateTDEE(stats);
    const weightDifferenceKg = stats.currentWeight - goal.targetWeight;
    const totalKcalChange = weightDifferenceKg * KCAL_PER_KG;
    const dailyDelta = totalKcalChange / days;

    // Intake = TDEE - deficit. If dailyDelta is negative (weight gain), this becomes TDEE + surplus.
    return tdee - dailyDelta;
}

/**
 * Calculates minimum days needed to reach the goal while never going below BMR.
 */
export function calculateMinDaysForSafety(stats: UserStats, goal: UserGoal): number {
    const weightDifferenceKg = stats.currentWeight - goal.targetWeight;

    // Weight gain or maintenance never requires intake below BMR.
    if (weightDifferenceKg <= 0) {
        return 1;
    }

    const tdee = calculateTDEE(stats);
    const bmr = calculateBMR(stats);
    const maxSafeDailyDeficit = tdee - bmr;

    if (maxSafeDailyDeficit <= 0) {
        throw new Error('Safe deficit is not possible because TDEE is not above BMR.');
    }

    const totalKcalToLose = weightDifferenceKg * KCAL_PER_KG;
    return Math.ceil(totalKcalToLose / maxSafeDailyDeficit);
}

/**
 * Validates intake safety against BMR.
 */
export function validateIntake(stats: UserStats, intake: number): string | null {
    const bmr = calculateBMR(stats);

    if (intake < bmr) {
        return `Warning: planned intake (${intake.toFixed(0)} kcal) is below BMR (${bmr.toFixed(0)} kcal).`;
    }

    return null;
}
