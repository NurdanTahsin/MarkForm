import { THEME_PRESETS, type ThemeKey } from '../../constants/themes';
import { useUserStore } from '../../store/useUserStore';
import type { DashTheme } from '../../constants/themes';

interface Props {
    language: 'tr' | 'en';
    theme: ThemeKey;
    step: number;
    activeTheme: DashTheme;
}

export function OnboardingHeader({ language, theme, step, activeTheme: T }: Props) {
    const setLanguage = useUserStore((s) => s.setLanguage);
    const setTheme = useUserStore((s) => s.setTheme);
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

            {/* Tema seçimi */}
            <div className="mt-3 space-y-2">
                <span className={`text-xs ${T.subtitle}`}>{t('Tema Seçimi:', 'Theme Selection:')}</span>
                <div className="flex flex-wrap items-center gap-2">
                    {(Object.keys(THEME_PRESETS) as ThemeKey[]).map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTheme(key)}
                            title={THEME_PRESETS[key].label}
                            className={[
                                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition',
                                theme === key
                                    ? `${T.ringProgress} ${T.cardBorder}`
                                    : `${T.cardBorder} ${T.mutedSurface} ${T.title}`,
                            ].join(' ')}
                        >
                            <span className={`h-3.5 w-3.5 rounded-full ${THEME_PRESETS[key].circle}`} />
                            {THEME_PRESETS[key].label}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}
