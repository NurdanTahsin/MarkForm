import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useActiveTheme, useDailyCalorieTarget, useUserStore } from '../../../store/useUserStore';
import { shiftDate } from '../../../utils/dateUtils';
import { buildPast30Logs, buildFuture7Logs } from './historyHelpers';
import { Past30Tab } from './Past30Tab';
import { Next7Tab } from './Next7Tab';

interface Props {
    open: boolean;
    onClose: () => void;
}

type HistoryTab = 'past30' | 'next7';

export function HistorySheet({ open, onClose }: Props) {
    const T = useActiveTheme();
    const language = useUserStore((state) => state.language);
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);
    const logs = useUserStore((state) => state.logs);
    const calorieTarget = useDailyCalorieTarget();
    const dialogRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<HistoryTab>('past30');

    const targetKcal = Math.round(calorieTarget?.intake ?? 2000);

    const todayDate = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    const last30Start = useMemo(() => shiftDate(todayDate, -29), [todayDate]);

    const past30Logs = useMemo(
        () => buildPast30Logs(logs, last30Start),
        [logs, last30Start]
    );

    const future7Logs = useMemo(
        () => buildFuture7Logs(logs, todayDate),
        [logs, todayDate]
    );

    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [onClose, open]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <button
                type="button"
                aria-label={t('Geçmişi kapat', 'Close history')}
                className={`absolute inset-0 ${T.overlay}`}
                onClick={onClose}
            />

            {/* Dialog — fixed height, internal scroll */}
            <div
                ref={dialogRef}
                className={`relative flex flex-col w-full max-w-2xl rounded-3xl border shadow-2xl ${T.dropdownBg} ${T.cardBorder} h-[min(90vh,720px)]`}
            >
                {/* Sticky Header */}
                <div className={`flex shrink-0 items-center justify-between px-5 py-4 border-b ${T.cardBorder}`}>
                    <div>
                        <h2 className={`text-lg font-bold ${T.title}`}>{t('Geçmiş', 'History')}</h2>
                        <p className={`text-xs mt-0.5 ${T.subtitle}`}>
                            {t('Son 30 gün ve gelecek 7 gün', 'Last 30 days & next 7 days')}
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label={t('Kapat', 'Close')}
                        onClick={onClose}
                        className={`grid h-9 w-9 place-items-center rounded-full border transition ${T.cardBorder} ${T.mutedSurface} ${T.title}`}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Sticky Tabs */}
                <div className={`flex shrink-0 gap-1 px-5 py-2.5 border-b ${T.cardBorder}`}>
                    {([
                        { key: 'past30' as HistoryTab, label: t('Son 30 Gün', 'Last 30 Days') },
                        { key: 'next7' as HistoryTab, label: t('Gelecek 7 Gün', 'Next 7 Days') },
                    ]).map(({ key, label }) => {
                        const tabTone = activeTab === key
                            ? `${T.accentSoft} ${T.accent} ${T.cardBorder}`
                            : `${T.mutedSurface} ${T.subtitle} ${T.cardBorder}`;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveTab(key)}
                                className={`rounded-xl border px-4 py-1.5 text-sm font-semibold transition ${tabTone}`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-3 p-4">
                        {activeTab === 'past30' ? (
                            <Past30Tab
                                past30Logs={past30Logs}
                                targetKcal={targetKcal}
                            />
                        ) : (
                            <Next7Tab
                                logs={future7Logs}
                                targetKcal={targetKcal}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
