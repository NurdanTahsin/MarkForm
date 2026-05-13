import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const getWindow = (): Window | undefined => {
    if (typeof globalThis === 'undefined') {
        return undefined;
    }

    return (globalThis as { window?: Window }).window;
};

const isStandalone = () => {
    const win = getWindow();
    const nav = win?.navigator as { standalone?: boolean } | undefined;
    return !!(win?.matchMedia?.('(display-mode: standalone)').matches || nav?.standalone === true);
};

function PwaInstallPrompt() {
    const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [isIos, setIsIos] = useState(false);

    useEffect(() => {
        const win = getWindow();
        if (!win) {
            return;
        }

        setIsInstalled(isStandalone());
        setIsIos(/iphone|ipad|ipod/i.test(win.navigator.userAgent));
    }, []);

    useEffect(() => {
        const win = getWindow();
        if (!win) {
            return;
        }

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setPromptEvent(event as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setPromptEvent(null);
        };

        win.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        win.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            win.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            win.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const showIosHint = isIos && !isInstalled && !promptEvent;
    const showPrompt = !isInstalled && !!promptEvent;

    if (dismissed || (!showPrompt && !showIosHint)) {
        return null;
    }

    const handleInstallClick = async () => {
        if (!promptEvent) {
            return;
        }

        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
            setIsInstalled(true);
        }
        setPromptEvent(null);
    };

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-90">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-10 w-10 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center">
                        <img src="/icon.png" alt="MarkForm" className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-[#0F172A]">MarkForm'u ana ekrana ekle</p>
                        <p className="mt-1 text-xs text-[#64748B]">
                            {showIosHint
                                ? "iOS'ta Safari Paylas > Ana Ekrana Ekle."
                                : 'Uygulama gibi acmak icin kur.'}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            {showPrompt && (
                                <button
                                    type="button"
                                    onClick={handleInstallClick}
                                    className="rounded-full bg-[#0EA5E9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0284C7]"
                                >
                                    Uygulamayi yukle
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setDismissed(true)}
                                className="rounded-full border border-[#E2E8F0] px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PwaInstallPrompt;
