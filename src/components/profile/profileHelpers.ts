import type { ThemeKey, DashTheme } from '../../constants/themes';
import {
    addDays,
    addMonthsKeepingDay,
    calculateSafeMonthOffset,
    formatDateInput,
    startOfDay,
} from '../../utils/dateUtils';
import { calculateMinDaysForSafety, calculateTDEE } from '../../utils/healthEngine';
import type { UserGoal, UserStats } from '../../types';
import type { ProfileCopy, ProfileLanguage } from './profileCopy';

export interface ProfileDraftState {
    email: string;
    name: string;
    gender: 'male' | 'female';
    weight: string;
    height: string;
    age: string;
    activityLevel: string;
    cycleEnabled: boolean;
    lastPeriodDate: string;
    cycleLength: string;
    periodLength: string;
    targetWeight: string;
    weeklySportQuota: string;
    waterTarget: string;
    theme: ThemeKey;
    language: ProfileLanguage;
}

export interface ProfileParsedDraft {
    weight: number;
    height: number;
    age: number;
    cycleLength: number;
    periodLength: number;
    targetWeight: number;
    weeklySportQuota: number;
    waterTarget: number;
}

export interface ProfileValidationErrors {
    email?: string;
    weight?: string;
    height?: string;
    age?: string;
    targetWeight?: string;
    weeklySportQuota?: string;
    waterTarget?: string;
    lastPeriodDate?: string;
    cycleLength?: string;
    periodLength?: string;
}

export function getInitialMonthOffset(targetDate: string | undefined, today: Date): number {
    if (!targetDate) return 1;
    return Math.max(1, calculateSafeMonthOffset(today, startOfDay(new Date(targetDate))));
}

export function createInitialDraft(params: {
    stats: UserStats | null;
    goal: UserGoal | null;
    email: string;
    theme: ThemeKey;
    language: ProfileLanguage;
    waterTarget: number;
}): ProfileDraftState {
    const { stats, goal, email, theme, language, waterTarget } = params;
    return {
        email,
        name: stats?.name ?? '',
        gender: stats?.gender ?? 'male',
        weight: stats?.currentWeight?.toString() ?? '',
        height: stats?.height?.toString() ?? '',
        age: stats?.age?.toString() ?? '',
        activityLevel: stats?.activityLevel ?? 'moderatelyActive',
        cycleEnabled: stats?.cycleTrackingEnabled ?? false,
        lastPeriodDate: stats?.lastPeriodStartDate ?? '',
        cycleLength: stats?.averageCycleLength?.toString() ?? '28',
        periodLength: stats?.periodLength?.toString() ?? '',
        targetWeight: goal?.targetWeight?.toString() ?? '',
        weeklySportQuota: (goal?.weeklySportQuota ?? 0).toString(),
        waterTarget: waterTarget.toString(),
        theme,
        language,
    };
}

export function parseDraftNumbers(draft: ProfileDraftState): ProfileParsedDraft {
    return {
        weight: Number.parseFloat(draft.weight),
        height: Number.parseFloat(draft.height),
        age: Number.parseFloat(draft.age),
        cycleLength: Number.parseFloat(draft.cycleLength),
        periodLength: Number.parseFloat(draft.periodLength),
        targetWeight: Number.parseFloat(draft.targetWeight),
        weeklySportQuota: Number.parseInt(draft.weeklySportQuota, 10),
        waterTarget: Number.parseInt(draft.waterTarget, 10),
    };
}

export function validateProfileDraft(
    draft: ProfileDraftState,
    parsed: ProfileParsedDraft,
    copy: ProfileCopy
): ProfileValidationErrors {
    const errors: ProfileValidationErrors = {};
    const trimmedEmail = draft.email ? draft.email.trim() : '';

    if (trimmedEmail.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        errors.email = copy.errors.email;
    }
    if (!Number.isFinite(parsed.weight) || parsed.weight <= 0) {
        errors.weight = copy.errors.weight;
    }
    if (!Number.isFinite(parsed.height) || parsed.height <= 0) {
        errors.height = copy.errors.height;
    }
    if (!Number.isFinite(parsed.age) || parsed.age <= 0) {
        errors.age = copy.errors.age;
    }
    if (!Number.isFinite(parsed.targetWeight) || parsed.targetWeight <= 0) {
        errors.targetWeight = copy.errors.targetWeight;
    }
    if (!Number.isFinite(parsed.weeklySportQuota) || parsed.weeklySportQuota < 0 || parsed.weeklySportQuota > 7) {
        errors.weeklySportQuota = copy.errors.weeklySportQuota;
    }
    if (!Number.isFinite(parsed.waterTarget) || parsed.waterTarget < 100) {
        errors.waterTarget = copy.errors.waterTarget;
    }
    if (draft.cycleEnabled && draft.lastPeriodDate.length === 0) {
        errors.lastPeriodDate = copy.errors.lastPeriodDate;
    }
    if (draft.cycleEnabled && (!Number.isFinite(parsed.cycleLength) || parsed.cycleLength < 20 || parsed.cycleLength > 40)) {
        errors.cycleLength = copy.errors.cycleLength;
    }
    if (draft.cycleEnabled && (!Number.isFinite(parsed.periodLength) || parsed.periodLength < 1 || parsed.periodLength > 15)) {
        errors.periodLength = copy.errors.periodLength;
    }

    return errors;
}

export function buildDraftStats(baseStats: UserStats | null, draft: ProfileDraftState, parsed: ProfileParsedDraft): UserStats | null {
    if (!baseStats) return null;
    if (!Number.isFinite(parsed.weight) || !Number.isFinite(parsed.height) || !Number.isFinite(parsed.age)) {
        return null;
    }

    const nextStats: UserStats = {
        ...baseStats,
        name: draft.name.trim() || undefined,
        gender: draft.gender,
        activityLevel: draft.activityLevel,
        currentWeight: parsed.weight,
        height: parsed.height,
        age: parsed.age,
        cycleTrackingEnabled: draft.cycleEnabled,
        lastPeriodStartDate: draft.cycleEnabled && draft.lastPeriodDate ? draft.lastPeriodDate : undefined,
        averageCycleLength: draft.cycleEnabled && Number.isFinite(parsed.cycleLength) ? parsed.cycleLength : undefined,
        periodLength: draft.cycleEnabled && Number.isFinite(parsed.periodLength) ? parsed.periodLength : undefined,
        TDEE: 0,
    };
    nextStats.TDEE = calculateTDEE(nextStats);
    return nextStats;
}

export function getMinimumMonthOffset(stats: UserStats | null, targetWeight: number, today: Date): number {
    if (!stats || !Number.isFinite(targetWeight) || targetWeight <= 0) return 1;
    try {
        const minDays = calculateMinDaysForSafety(stats, {
            targetWeight,
            targetDate: formatDateInput(today),
            weeklySportQuota: 0,
        });
        const earliestDate = addDays(today, minDays);
        return Math.max(1, calculateSafeMonthOffset(today, earliestDate));
    } catch {
        return 1;
    }
}

export function buildGoalDraft(targetWeight: number, targetDate: string, weeklySportQuota: number): UserGoal | null {
    if (!Number.isFinite(targetWeight) || targetWeight <= 0 || !targetDate) return null;
    return {
        targetWeight,
        targetDate,
        weeklySportQuota,
    };
}

export function buildProfileSnapshot(params: {
    draft: ProfileDraftState;
    targetDate: string;
}): string {
    const { draft, targetDate } = params;
    return JSON.stringify({
        email: draft.email.trim(),
        name: draft.name.trim(),
        gender: draft.gender,
        activityLevel: draft.activityLevel,
        weight: draft.weight.trim(),
        height: draft.height.trim(),
        age: draft.age.trim(),
        cycleEnabled: draft.cycleEnabled,
        lastPeriodDate: draft.cycleEnabled ? draft.lastPeriodDate : '',
        cycleLength: draft.cycleEnabled ? draft.cycleLength.trim() : '',
        periodLength: draft.cycleEnabled ? draft.periodLength.trim() : '',
        targetWeight: draft.targetWeight.trim(),
        targetDate,
        weeklySportQuota: draft.weeklySportQuota.trim(),
        waterTarget: draft.waterTarget.trim(),
        theme: draft.theme,
        language: draft.language,
    });
}

export function getMonthOptions(minMonthOffset: number, selectedMonthOffset: number): number[] {
    const count = Math.max(6, selectedMonthOffset - minMonthOffset + 1);
    return Array.from({ length: count }, (_, index) => minMonthOffset + index);
}

export function getBmiTone(bmi: number | null, theme: DashTheme) {
    if (bmi === null) return { text: theme.title, pill: `${theme.mutedSurface} ${theme.subtitle}` };
    if (bmi < 18.5) return { text: 'text-sky-600', pill: 'bg-sky-50 text-sky-700' };
    if (bmi < 25) return { text: 'text-emerald-600', pill: 'bg-emerald-50 text-emerald-700' };
    if (bmi < 30) return { text: 'text-amber-600', pill: 'bg-amber-50 text-amber-700' };
    return { text: 'text-orange-500', pill: 'bg-orange-50 text-orange-600' };
}

export function getBmiLabel(bmi: number | null, copy: ProfileCopy) {
    if (bmi === null) return copy.waitingData;
    if (bmi < 18.5) return copy.bmiUnderweight;
    if (bmi < 25) return copy.bmiNormal;
    if (bmi < 30) return copy.bmiOverweight;
    return copy.bmiObese;
}

export function getTargetDateFromOffset(today: Date, monthOffset: number) {
    return formatDateInput(addMonthsKeepingDay(today, monthOffset));
}

export function getFocusableElements(root: HTMLElement): HTMLElement[] {
    return Array.from(
        root.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
    ).filter((element) => !element.hasAttribute('hidden') && !element.getAttribute('aria-hidden'));
}
