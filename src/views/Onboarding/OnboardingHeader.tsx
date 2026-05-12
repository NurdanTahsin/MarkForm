import { useUserStore } from '../../store/useUserStore';
import type { DashTheme } from '../../constants/themes';

interface Props {
    language: 'tr' | 'en';
    step: number;
    activeTheme: DashTheme;
}

export function OnboardingHeader({ language, step, activeTheme: T }: Props) {
    const setLanguage = useUserStore((s) => s.setLanguage);
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);

    return (
        <header className="mb-6">
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${T.accent}`}>VitalsTrack</p>
            <h1 className={`mt-2 text-2xl font-bold ${T.title}`}>
                {t('Sana özel dengeli bir plan hazırlayalım', 'Let us build your balanced plan')}
            </h1>
            <p className={`mt-1 text-sm ${T.subtitle}`}>{t(`Adım ${step} / 3`, `Step ${step} of 3`)}</p>

            {/* Dil seçimi */}
            <div className={`mt-3 inline-flex items-center gap-2 rounded-xl border p-1 ${T.cardBorder} ${T.dropdownBg}`}>
                {(['tr', 'en'] as const).map((lang) => (
                    <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={[
                            'rounded-lg px-3 py-1 text-xs font-semibold transition',
                            language === lang ? T.accentBtn : `${T.subtitle} ${T.mutedSurface}`,
                        ].join(' ')}
                    >
                        {lang === 'tr' ? 'Türkçe' : 'English'}
                    </button>
                ))}
            </div>


        </header>
    );
}
