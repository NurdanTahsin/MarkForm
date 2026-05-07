import { HistoryDayCard } from './HistoryDayCard';
import type { Past30LogEntry } from './historyHelpers';

interface Props {
    logs: Past30LogEntry[];
    targetKcal: number;
    targetProtein: number;
    targetCarb: number;
    targetFat: number;
}

export function Next7Tab({ logs, targetKcal, targetProtein, targetCarb, targetFat }: Props) {
    return (
        <div className="space-y-3">
            {logs.map((entry) => (
                <HistoryDayCard
                    key={entry.log.date}
                    entry={entry}
                    targetKcal={targetKcal}
                    targetProtein={targetProtein}
                    targetCarb={targetCarb}
                    targetFat={targetFat}
                />
            ))}
        </div>
    );
}
