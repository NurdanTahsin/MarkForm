import type { UserGoal, UserStats } from '../../types';
import { calculateTDEE } from '../../utils/healthEngine';
import { toNumber as constToNumber } from '../../constants/dashboardConstants';

export { constToNumber as toNumber };

export type WizardStep = 1 | 2 | 3;
export type Gender = 'male' | 'female';

export interface ActivityOption {
    value: string;
    labelTr: string;
    labelEn: string;
    descriptionTr: string;
    descriptionEn: string;
}

export const ACTIVITY_OPTIONS: ActivityOption[] = [
    { value: 'sedentary', labelTr: 'Hareketsiz', labelEn: 'Sedentary', descriptionTr: 'Masa başı günler, düzenli egzersiz yok denecek kadar az.', descriptionEn: 'Mostly desk work, little to no planned exercise.' },
    { value: 'lightlyActive', labelTr: 'Az Aktif', labelEn: 'Lightly Active', descriptionTr: 'Haftada 1-3 gün hafif tempolu hareket.', descriptionEn: 'Light movement around 1-3 days per week.' },
    { value: 'moderatelyActive', labelTr: 'Orta Aktif', labelEn: 'Moderately Active', descriptionTr: 'Haftada 3-5 gün orta tempoda aktif yaşam.', descriptionEn: 'Moderate activity around 3-5 days weekly.' },
    { value: 'veryActive', labelTr: 'Cok Aktif', labelEn: 'Very Active', descriptionTr: 'Neredeyse her gün düzenli egzersiz.', descriptionEn: 'Consistent training most days of the week.' },
    { value: 'extraActive', labelTr: 'Aşırı Aktif', labelEn: 'Extra Active', descriptionTr: 'Yüksek eforlu spor veya fiziksel olarak zorlayıcı günler.', descriptionEn: 'High-volume training or physically demanding routine.' },
];

export function buildDraftStats(input: {
    name: string;
    age: string;
    height: string;
    currentWeight: string;
    gender: Gender;
    activityLevel: string;
}): UserStats | null {
    const name = input.name.trim();
    const age = constToNumber(input.age);
    const height = constToNumber(input.height);
    const currentWeight = constToNumber(input.currentWeight);

    if (!Number.isFinite(age) || age <= 0) return null;
    if (!Number.isFinite(height) || height <= 0) return null;
    if (!Number.isFinite(currentWeight) || currentWeight <= 0) return null;

    const stats: UserStats = {
        name: name.length > 0 ? name : undefined,
        age,
        height,
        currentWeight,
        gender: input.gender,
        activityLevel: input.activityLevel,
        TDEE: 0,
    };
    stats.TDEE = calculateTDEE(stats);
    return stats;
}

export function buildDraftGoal(input: { targetWeight: string; targetDate: string }): UserGoal | null {
    const targetWeight = constToNumber(input.targetWeight);
    if (!Number.isFinite(targetWeight) || targetWeight <= 0 || input.targetDate.length === 0) return null;
    return { targetWeight, targetDate: input.targetDate, weeklySportQuota: 0 };
}
