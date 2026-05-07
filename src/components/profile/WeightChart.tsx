import { useMemo } from 'react';
import type { WeightEntry } from '../../store/useUserStore';
import type { DashTheme } from '../../constants/themes';
import type { ProfileCopy } from './profileCopy';

interface Props {
    theme: DashTheme;
    data: WeightEntry[];
    timeRange: 'month' | 'all';
    language: 'tr' | 'en';
    copy: ProfileCopy;
}

export function WeightChart({ theme, data, timeRange, language, copy }: Props) {
    const chartData = useMemo(() => {
        if (data.length === 0) return [];
        let filtered = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (timeRange === 'month') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            filtered = filtered.filter(e => new Date(e.date) >= thirtyDaysAgo);
        }
        return filtered;
    }, [data, timeRange]);

    if (chartData.length < 2) {
        return (
            <div className={`flex h-48 items-center justify-center rounded-2xl border border-dashed ${theme.cardBorder} ${theme.mutedSurface}`}>
                <p className={`text-sm ${theme.subtitle}`}>{copy.chartEmpty}</p>
            </div>
        );
    }

    const minWeight = Math.min(...chartData.map(d => d.weight));
    const maxWeight = Math.max(...chartData.map(d => d.weight));
    const range = maxWeight - minWeight === 0 ? 10 : maxWeight - minWeight;
    const paddingY = range * 0.2; // 20% padding top and bottom
    const yMin = minWeight - paddingY;
    const yMax = maxWeight + paddingY;
    const yRange = yMax - yMin;

    const width = 1000;
    const height = 300;
    
    const points = chartData.map((d, i) => {
        const x = (i / (chartData.length - 1)) * width;
        const y = height - ((d.weight - yMin) / yRange) * height;
        return `${x},${y}`;
    }).join(' ');

    const latest = chartData[chartData.length - 1];
    const first = chartData[0];
    const weightDiff = latest.weight - first.weight;
    const diffText = weightDiff > 0 ? `(+${weightDiff.toFixed(1)}kg)` : weightDiff < 0 ? `(${weightDiff.toFixed(1)}kg)` : '';

    const formatDateStr = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className={`relative w-full rounded-3xl border p-5 shadow-sm ${theme.cardBg} ${theme.cardBorder}`}>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className={`text-base font-semibold ${theme.title}`}>{copy.chartTitle}</h3>
                    <p className={`text-2xl font-bold mt-1 flex items-baseline gap-2 ${theme.title}`}>
                        {latest.weight} <span className={`text-sm font-normal ${theme.subtitle}`}>kg</span>
                        {diffText && (
                            <span className={`text-sm font-semibold ${weightDiff > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {diffText}
                            </span>
                        )}
                    </p>
                </div>
            </div>
            <div className="relative w-full pb-2">
                <div className="relative h-48 w-full">
                    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible preserve-3d" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="0" x2={width} y2="0" stroke="currentColor" strokeOpacity="0.1" className={theme.title} />
                    <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeOpacity="0.1" className={theme.title} />
                    <line x1="0" y1={height} x2={width} y2={height} stroke="currentColor" strokeOpacity="0.1" className={theme.title} />
                    
                    {/* Line */}
                    <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        className={theme.accent}
                    />

                    {/* Data Points */}
                    {chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1)) * width;
                        const y = height - ((d.weight - yMin) / yRange) * height;
                        
                        const isFirst = i === 0;
                        const isLast = i === chartData.length - 1;
                        const step = Math.ceil(chartData.length / 7);
                        const showLabel = isFirst || isLast || (i % step === 0);

                        return (
                            <g key={d.id}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="6"
                                    fill="currentColor"
                                    className={theme.accent}
                                />
                                {showLabel && (
                                    <text
                                        x={x}
                                        y={y - 12}
                                        textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
                                        stroke="white"
                                        strokeWidth="5"
                                        strokeLinejoin="round"
                                        paintOrder="stroke"
                                        fill="currentColor"
                                        className={`${theme.title}`}
                                        style={{ fontSize: isFirst || isLast ? '18px' : '14px', fontWeight: 'bold' }}
                                    >
                                        {d.weight}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
                </div>
            </div>
            <div className="mt-4 flex justify-between">
                <span className={`text-xs ${theme.subtitle}`}>{formatDateStr(chartData[0].date)}</span>
                <span className={`text-xs ${theme.subtitle}`}>{formatDateStr(latest.date)}</span>
            </div>
        </div>
    );
}
