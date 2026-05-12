import { HistoryDayCard } from './HistoryDayCard';
import type { Past30LogEntry } from './historyHelpers';

interface Props {
    logs: Past30LogEntry[];
    targetKcal: number;
}

export function Next7Tab({ logs, targetKcal }: Props) {
    return (
        <div className="space-y-3">
            {logs.map((entry) => (
                <HistoryDayCard
                    key={entry.log.date}
                    entry={entry}
                    targetKcal={targetKcal}
                />
            ))}
        </div>
    );
}
