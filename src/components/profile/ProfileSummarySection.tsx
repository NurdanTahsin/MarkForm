import { Activity, Flame, Gauge } from 'lucide-react';
import type { DashTheme } from '../../constants/themes';
import type { WeightEntry } from '../../store/useUserStore';
import type { ProfileCopy } from './profileCopy';

interface Props {
    theme: DashTheme;
    copy: ProfileCopy;
    bmiLabel: string;
    bmiTone: { text: string; pill: string };
    bmiValue: string;
    tdeeValue: string;
    bmrValue: string;
    weightLog: WeightEntry[];
}

function Sparkline({ data, tone, theme, emptyLabel }: { data: WeightEntry[]; tone: string; theme: DashTheme; emptyLabel: string }) {
    if (data.length < 2) {
        return <p className={`text-xs italic ${theme.subtitle}`}>{emptyLabel}</p>;
    }

    const weights = data.map((entry) => entry.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = max - min || 1;
    const width = 240;
    const height = 56;
    const points = data
        .map((entry, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - 8 - ((entry.weight - min) / range) * (height - 16);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
    const first = weights[0];
    const last = weights[weights.length - 1];
    const trend = last - first;

    return (
        <div className="space-y-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-14 w-full" aria-hidden="true">
                <polyline points={points} fill="none" stroke={tone} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                <circle cx={width} cy={height - 8 - ((last - min) / range) * (height - 16)} r="3.5" fill={tone} />
            </svg>
            <p className={`text-xs ${theme.subtitle}`}>
                {first.toFixed(1)} kg {'->'} {last.toFixed(1)} kg
                <span className={`ml-1 font-semibold ${trend < 0 ? theme.accent : trend > 0 ? 'text-rose-500' : theme.subtitle}`}>
                    ({trend > 0 ? '+' : ''}{trend.toFixed(1)} kg)
                </span>
            </p>
        </div>
    );
}

export function ProfileSummarySection({
    theme,
    copy,
    bmiLabel,
    bmiTone,
    bmiValue,
    tdeeValue,
    bmrValue,
    weightLog,
}: Props) {
    const isDarkTheme = theme.title === 'text-slate-50';
    const cards = [
        { label: copy.bmi, value: bmiValue, detail: bmiLabel, icon: Activity, valueClass: bmiTone.text, detailClass: bmiTone.pill },
        { label: copy.tdee, value: tdeeValue, detail: copy.kcalPerDay, icon: Flame, valueClass: theme.title, detailClass: `${theme.accentSoft} ${theme.accent}` },
        { label: copy.bmr, value: bmrValue, detail: copy.basalRate, icon: Gauge, valueClass: theme.title, detailClass: `${theme.mutedSurface} ${theme.subtitle}` },
    ];

    return (
        <section className={`rounded-3xl border p-5 shadow-sm ${theme.cardBorder} ${theme.cardBg}`}>
            <div className="mb-4 flex items-start justify-between gap-4">
                <h3 className={`text-base font-semibold ${theme.title}`}>{copy.summaryTitle}</h3>
                <div className={`rounded-full px-3 py-1 text-[11px] font-medium ${bmiTone.pill}`}>{bmiLabel}</div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                {cards.map(({ label, value, detail, icon: Icon, valueClass, detailClass }) => (
                    <div key={label} className={`rounded-2xl border p-4 ${theme.cardBorder} ${theme.mutedSurface}`}>
                        <div className="mb-5 flex items-center justify-between">
                            <span className={`text-[11px] font-semibold uppercase tracking-wide ${theme.subtitle}`}>{label}</span>
                            <div className={`grid h-9 w-9 place-items-center rounded-2xl ${theme.accentSoft} ${theme.accent}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                        </div>
                        <p className={`text-2xl font-semibold ${valueClass}`}>{value}</p>
                        <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${detailClass}`}>{detail}</p>
                    </div>
                ))}
            </div>

            <div className={`mt-4 rounded-2xl border p-4 ${theme.cardBorder} ${theme.mutedSurface}`}>
                <div className="mb-3 flex items-center justify-between gap-3">
                    <p className={`text-sm font-semibold ${theme.title}`}>{copy.weightTrendTitle}</p>
                    <div className={`rounded-full px-2.5 py-1 text-[11px] ${theme.accentSoft} ${theme.accent}`}>
                        {weightLog.length} {copy.records}
                    </div>
                </div>
                <Sparkline
                    data={weightLog.slice(-30)}
                    tone={isDarkTheme ? '#2dd4bf' : theme.accent.includes('teal') ? '#0f766e' : '#047857'}
                    theme={theme}
                    emptyLabel={copy.noMeasurements}
                />
            </div>
        </section>
    );
}
