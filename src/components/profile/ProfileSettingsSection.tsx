import type { DashTheme } from '../../constants/themes';
import { ProfileField } from './ProfileField';
import type { ProfileCopy, ProfileLanguage } from './profileCopy';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
    theme: DashTheme;
    copy: ProfileCopy;
    inputClassName: string;
    languageDraft: ProfileLanguage;
    cycleEnabled: boolean;
    lastPeriodDate: string;
    cycleLength: string;
    isFemale: boolean;
    errors: {
        email?: string;
        lastPeriodDate?: string;
        cycleLength?: string;
    };
    onLanguageChange: (value: ProfileLanguage) => void;
    onCycleEnabledChange: (value: boolean) => void;
    onLastPeriodDateChange: (value: string) => void;
    onCycleLengthChange: (value: string) => void;
    maxPeriodDate: string;
}

export function ProfileSettingsSection({
    theme,
    copy,
    inputClassName,
    languageDraft,
    cycleEnabled,
    lastPeriodDate,
    cycleLength,
    isFemale,
    errors,
    onLanguageChange,
    onCycleEnabledChange,
    onLastPeriodDateChange,
    onCycleLengthChange,
    maxPeriodDate,
}: Props) {
    const { session, isGuest, signOut } = useAuthStore();

    return (
        <section className={`rounded-3xl border p-5 shadow-sm ${theme.cardBorder} ${theme.cardBg}`}>
            <div className="mb-4">
                <h3 className={`text-base font-semibold ${theme.title}`}>{copy.settingsTitle}</h3>
            </div>

            <div className="space-y-3">

                <div className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 ${theme.cardBorder} ${theme.mutedSurface}`}>
                    <p className={`text-sm font-semibold ${theme.title}`}>{copy.language}</p>
                    <div className={`flex rounded-full border p-1 shadow-sm ${theme.cardBorder} ${theme.dropdownBg}`}>
                        {(['tr', 'en'] as const).map((language) => (
                            <button
                                key={language}
                                type="button"
                                onClick={() => onLanguageChange(language)}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${languageDraft === language ? theme.accentBtn : `${theme.title} ${theme.mutedSurface}`}`}
                            >
                                {copy.languageLabels[language]}
                            </button>
                        ))}
                    </div>
                </div>

                {isFemale ? (
                    <div className={`rounded-2xl border px-4 py-3 ${theme.cardBorder} ${theme.mutedSurface}`}>
                        <div className="flex items-center justify-between gap-4">
                            <p className={`text-sm font-semibold ${theme.title}`}>{copy.cycleTracking}</p>
                            <button
                                type="button"
                                aria-label={copy.cycleTracking}
                                onClick={() => onCycleEnabledChange(!cycleEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${cycleEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${cycleEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {cycleEnabled ? (
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <ProfileField label={copy.lastPeriodDate} theme={theme} error={errors.lastPeriodDate}>
                                    <input
                                        type="date"
                                        max={maxPeriodDate}
                                        value={lastPeriodDate}
                                        onChange={(event) => onLastPeriodDateChange(event.target.value)}
                                        title={copy.lastPeriodDate}
                                        placeholder={copy.lastPeriodDate}
                                        className={inputClassName}
                                    />
                                </ProfileField>
                                <ProfileField label={copy.cycleLength} unit={copy.dayUnit} theme={theme} error={errors.cycleLength}>
                                    <input
                                        type="number"
                                        min="20"
                                        max="40"
                                        value={cycleLength}
                                        onChange={(event) => onCycleLengthChange(event.target.value)}
                                        title={copy.cycleLength}
                                        placeholder="28"
                                        className={inputClassName}
                                    />
                                </ProfileField>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {/* Hesap / Çıkış */}
                <div className={`rounded-2xl border px-4 py-3 space-y-2 ${theme.cardBorder} ${theme.mutedSurface}`}>
                    {session ? (
                        <>
                            <p className={`text-xs ${theme.subtitle}`}>
                                Giriş yapılan hesap: <span className="font-semibold">{session.user.email}</span>
                            </p>
                            <button
                                id="profile-sign-out-btn"
                                type="button"
                                onClick={() => signOut()}
                                className="w-full py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-100 active:scale-95 transition-all"
                            >
                                Çıkış Yap
                            </button>
                        </>
                    ) : isGuest ? (
                        <>
                            <p className={`text-xs ${theme.subtitle}`}>
                                Misafir modundasın — veriler yalnızca bu cihazda saklanır.
                            </p>
                            <button
                                id="profile-create-account-btn"
                                type="button"
                                onClick={() => signOut()}
                                className={`w-full py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-all ${theme.accentBtn}`}
                            >
                                Hesap Oluştur / Giriş Yap
                            </button>
                        </>
                    ) : null}
                </div>

            </div>
        </section>
    );
}
