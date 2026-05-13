import { ChevronDown, Target } from 'lucide-react';
import type { DashTheme } from '../../constants/themes';
import { addMonthsKeepingDay, formatMonthLabel } from '../../utils/dateUtils';
import { ProfileField } from './ProfileField';
import type { ProfileCopy } from './profileCopy';

interface Props {
    theme: DashTheme;
    copy: ProfileCopy;
    inputClassName: string;
    goalOpen: boolean;
    onToggleGoalOpen: () => void;
    summaryTargetWeight: string;
    summaryTargetDate: string;
    summaryWeeklySportQuota: string;
    caloriePreview: string | null;
    weightValue: string;
    heightValue: string;
    ageValue: string;
    targetWeightValue: string;
    weeklySportQuotaValue: string;
    waterTargetValue: string;
    monthOptions: number[];
    selectedMonthOffset: number;
    today: Date;
    errors: {
        weight?: string;
        height?: string;
        age?: string;
        targetWeight?: string;
        weeklySportQuota?: string;
        waterTarget?: string;
    };
    onWeightChange: (value: string) => void;
    onHeightChange: (value: string) => void;
    onAgeChange: (value: string) => void;
    onTargetWeightChange: (value: string) => void;
    onSelectedMonthOffsetChange: (value: number) => void;
    onWeeklySportQuotaChange: (value: string) => void;
    onWaterTargetChange: (value: string) => void;
}

export function ProfileGoalSection({
    theme,
    copy,
    inputClassName,
    goalOpen,
    onToggleGoalOpen,
    summaryTargetWeight,
    summaryTargetDate,
    summaryWeeklySportQuota,
    caloriePreview,
    weightValue,
    heightValue,
    ageValue,
    targetWeightValue,
    weeklySportQuotaValue,
    waterTargetValue,
    monthOptions,
    selectedMonthOffset,
    today,
    errors,
    onWeightChange,
    onHeightChange,
    onAgeChange,
    onTargetWeightChange,
    onSelectedMonthOffsetChange,
    onWeeklySportQuotaChange,
    onWaterTargetChange,
}: Readonly<Props>) {
    return (
        <section className={`rounded-3xl border p-5 shadow-sm ${theme.cardBorder} ${theme.cardBg}`}>
            <div className="mb-4">
                <h3 className={`text-base font-semibold ${theme.title}`}>{copy.bodyTitle}</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <ProfileField label={copy.weight} unit="kg" theme={theme} error={errors.weight}>
                    <input type="number" min="1" value={weightValue} onChange={(event) => onWeightChange(event.target.value)} className={inputClassName} title={copy.weight} />
                </ProfileField>
                <ProfileField label={copy.height} unit="cm" theme={theme} error={errors.height}>
                    <input type="number" min="1" value={heightValue} onChange={(event) => onHeightChange(event.target.value)} className={inputClassName} title={copy.height} />
                </ProfileField>
                <ProfileField label={copy.age} theme={theme} error={errors.age}>
                    <input type="number" min="1" value={ageValue} onChange={(event) => onAgeChange(event.target.value)} className={inputClassName} title={copy.age} />
                </ProfileField>
            </div>

            <div className={`mt-4 rounded-2xl border ${theme.cardBorder} ${theme.mutedSurface}`}>
                {goalOpen ? (
                    <button
                        type="button"
                        onClick={onToggleGoalOpen}
                        aria-expanded="true"
                        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                    >
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <div className={`grid h-9 w-9 place-items-center rounded-2xl ${theme.accentSoft} ${theme.accent}`}>
                                    <Target className="h-4 w-4" />
                                </div>
                                <p className={`text-sm font-semibold ${theme.title}`}>{copy.goalEdit}</p>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${theme.accentSoft} ${theme.accent}`}>
                                    {summaryTargetWeight}
                                </span>
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${theme.mutedSurface} ${theme.subtitle}`}>
                                    {summaryTargetDate}
                                </span>
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${theme.mutedSurface} ${theme.subtitle}`}>
                                    {copy.sportPerWeek} {summaryWeeklySportQuota} {copy.weekSuffix}
                                </span>
                                {caloriePreview ? (
                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${theme.accentSoft} ${theme.accent}`}>
                                        {caloriePreview}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 shrink-0 transition rotate-180 ${theme.subtitle}`} />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onToggleGoalOpen}
                        aria-expanded="false"
                        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                    >
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <div className={`grid h-9 w-9 place-items-center rounded-2xl ${theme.accentSoft} ${theme.accent}`}>
                                    <Target className="h-4 w-4" />
                                </div>
                                <p className={`text-sm font-semibold ${theme.title}`}>{copy.goalEdit}</p>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${theme.accentSoft} ${theme.accent}`}>
                                    {summaryTargetWeight}
                                </span>
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${theme.mutedSurface} ${theme.subtitle}`}>
                                    {summaryTargetDate}
                                </span>
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${theme.mutedSurface} ${theme.subtitle}`}>
                                    {copy.sportPerWeek} {summaryWeeklySportQuota} {copy.weekSuffix}
                                </span>
                                {caloriePreview ? (
                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${theme.accentSoft} ${theme.accent}`}>
                                        {caloriePreview}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 shrink-0 transition ${theme.subtitle}`} />
                    </button>
                )}

                {goalOpen ? (
                    <div className={`space-y-4 border-t px-4 py-4 ${theme.cardBorder}`}>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <ProfileField label={copy.targetWeight} unit="kg" theme={theme} error={errors.targetWeight}>
                                <input
                                    type="number"
                                    min="1"
                                    value={targetWeightValue}
                                    onChange={(event) => onTargetWeightChange(event.target.value)}
                                    className={inputClassName}
                                    title={copy.targetWeight}
                                />
                            </ProfileField>

                            <ProfileField label={copy.duration} theme={theme}>
                                <select
                                    value={selectedMonthOffset}
                                    onChange={(event) => onSelectedMonthOffsetChange(Number(event.target.value))}
                                    className={inputClassName}
                                    title={copy.duration}
                                >
                                    {monthOptions.map((offset) => (
                                        <option key={offset} value={offset}>
                                            {offset} {copy.monthUnit} - {formatMonthLabel(addMonthsKeepingDay(today, offset))}
                                        </option>
                                    ))}
                                </select>
                            </ProfileField>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <ProfileField label={copy.sportDays} unit={copy.dayUnit} theme={theme} error={errors.weeklySportQuota}>
                                <input
                                    type="number"
                                    min="0"
                                    max="7"
                                    value={weeklySportQuotaValue}
                                    onChange={(event) => onWeeklySportQuotaChange(event.target.value)}
                                    className={inputClassName}
                                    title={copy.sportDays}
                                />
                            </ProfileField>

                            <ProfileField label={copy.dailyWater} unit={copy.waterUnit} theme={theme} error={errors.waterTarget}>
                                <input
                                    type="number"
                                    min="100"
                                    step="100"
                                    value={waterTargetValue}
                                    onChange={(event) => onWaterTargetChange(event.target.value)}
                                    className={inputClassName}
                                    title={copy.dailyWater}
                                />
                            </ProfileField>
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
