import { useState } from 'react';
import { History, User, AlertCircle } from 'lucide-react';
import { useActiveTheme, useUserStore } from '../store/useUserStore';
import { useTranslate } from '../hooks/useTranslate';
import { DailySummaryCard } from '../components/dashboard/DailySummaryCard';
import { ActionCard } from '../components/dashboard/ActionCard';
import { HistorySheet } from '../components/dashboard/HistorySheet';
import { TodaysLog } from '../components/dashboard/TodaysLog';
import { ProfileSheet } from '../components/profile/ProfileSheet';
import { addDays } from '../utils/dateUtils';

export default function Dashboard() {
    const T = useActiveTheme();
    const t = useTranslate();
    const language = useUserStore((state) => state.language);
    const setLanguage = useUserStore((state) => state.setLanguage);
    const stats = useUserStore((state) => state.stats);
    const [profileOpen, setProfileOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const [periodWarningOpen, setPeriodWarningOpen] = useState(false);

    let showPeriodWarning = false;
    let expectedPeriodDate = '';

    if (stats?.cycleTrackingEnabled && stats.lastPeriodStartDate && stats.averageCycleLength) {
        const lastDate = new Date(stats.lastPeriodStartDate);
        const nextDate = addDays(lastDate, stats.averageCycleLength);
        const today = new Date();
        const diffTime = nextDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 3) {
            showPeriodWarning = true;
            expectedPeriodDate = nextDate.toLocaleDateString();
        }
    }

    return (
        <main className={`min-h-screen p-4 sm:p-6 lg:p-8 ${T.pageBg}`}>
            <div className="mx-auto w-full max-w-6xl space-y-6">

                {/* Header */}
                <header className={`relative z-20 rounded-3xl border px-5 py-4 sm:px-6 sm:py-5 ${T.cardBg} ${T.cardBorder} shadow-sm`}>
                    <div className="flex items-center justify-between">
                        <h1 className={`text-2xl font-bold sm:text-3xl ${T.title}`}>MarkForm</h1>
                        <div className="relative flex items-center gap-2">
                            {/* Dil */}
                            <div className={`flex rounded-full border p-1 mr-2 ${T.cardBorder} ${T.dropdownBg}`}>
                                {(['tr', 'en'] as const).map((lang) => {
                                    const langTone = language === lang ? T.accentBtn : T.title;
                                    return (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => setLanguage(lang)}
                                            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${langTone}`}
                                        >
                                            {lang.toUpperCase()}
                                        </button>
                                    );
                                })}
                            </div>

                            {showPeriodWarning && (
                                <div className="relative flex items-center justify-center mr-1">
                                    <button
                                        type="button"
                                        onClick={() => setPeriodWarningOpen(!periodWarningOpen)}
                                        aria-label={t('Adet uyarısı', 'Period warning')}
                                        className="transition hover:opacity-80 focus:outline-none"
                                    >
                                        <AlertCircle className="h-6 w-6 text-rose-500 animate-pulse" />
                                    </button>
                                    {periodWarningOpen && (
                                        <div className="absolute top-10 right-0 w-48 rounded-xl p-2 text-xs shadow-lg bg-rose-100 text-rose-800 z-50">
                                            Adet döngünüz yaklaşıyor. Beklenen tarih: <strong>{expectedPeriodDate}</strong>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button
                                type="button"
                                aria-label={t('Geçmiş', 'History')}
                                onClick={() => setHistoryOpen(true)}
                                className={`grid h-10 w-10 place-items-center rounded-full border ${T.cardBorder} ${T.mutedSurface} ${T.title} transition hover:opacity-80`}
                            >
                                <History className="h-5 w-5" strokeWidth={1.9} />
                            </button>
                            <button
                                type="button"
                                aria-label={t('Profil', 'Profile')}
                                onClick={() => setProfileOpen(true)}
                                className={`grid h-10 w-10 place-items-center rounded-full border ${T.cardBorder} ${T.mutedSurface} ${T.title} transition hover:opacity-80`}
                            >
                                <User className="h-5 w-5" strokeWidth={1.9} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* 2-column grid on lg+, stacked on mobile */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <DailySummaryCard />
                    <ActionCard />
                </div>

                <TodaysLog />
            </div>

            <HistorySheet open={historyOpen} onClose={() => setHistoryOpen(false)} />
            <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
        </main>
    );
}
