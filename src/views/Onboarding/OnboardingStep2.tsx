import type { DashTheme } from '../../constants/themes';
import type { UserStats } from '../../types';

interface Props {
    T: DashTheme;
    language: 'tr' | 'en';
    bmr: number | null;
    draftStats: UserStats | null;
    idealPlanInfo: {
        intake: number;
    } | null;
    idealWeight: number | null;
}

export function OnboardingStep2({ T, language, bmr, draftStats, idealPlanInfo, idealWeight }: Props) {
    const t = (tr: string, en: string) => (language === 'tr' ? tr : en);

    return (
        <div className="space-y-5">
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${T.subtitle}`}>
                {t('Adım 2: Metabolizma Raporu', 'Step 2: Metabolism Report')}
            </h2>
            <p className={`text-sm ${T.subtitle}`}>
                {t(
                    'Burası bedeninin pusulası. Rakamlar seni yargılamak için değil, daha sağlıklı bir yol çizmek için var.',
                    'These numbers are your compass for a safer plan.'
                )}
            </p>

            <div className={`rounded-2xl border p-5 ${T.recommendationSurface}`}>
                <p className={`text-xs uppercase tracking-wide ${T.subtitle}`}>{t('Rapor', 'Report')}</p>

                <div className="mt-4 space-y-4">
                    {/* BMR */}
                    <div className={`rounded-xl border p-4 ${T.cardBg} ${T.cardBorder}`}>
                        <p className={`text-xs ${T.subtitle}`}>BMR</p>
                        <p className={`mt-1 text-2xl font-bold ${T.title}`}>{bmr ? `${bmr.toFixed(0)} kcal` : '--'}</p>
                        <p className={`mt-2 text-sm ${T.subtitle}`}>
                            {t(
                                'Tam dinlenmede bile bedeninin çalışması için gerekli taban enerji. Bu eşiğin altına inmek hızlandırmaz, sadece bedeni zorlar.',
                                'Your base energy need at complete rest. Going under this makes things harder, not better.'
                            )}
                        </p>
                        <div className="mt-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2">
                            <p className="text-sm font-semibold text-rose-800">
                                {t(
                                    'Bazal metabolizmanın altına düşmek metabolizmanı yavaşlatır.',
                                    'Going below BMR can slow your metabolism.'
                                )}
                            </p>
                        </div>
                    </div>

                    {/* TDEE */}
                    <div className={`rounded-xl border p-4 ${T.cardBg} ${T.cardBorder}`}>
                        <p className={`text-xs ${T.subtitle}`}>TDEE</p>
                        <p className={`mt-1 text-2xl font-bold ${T.title}`}>
                            {draftStats ? `${draftStats.TDEE.toFixed(0)} kcal` : '--'}
                        </p>
                        <p className={`mt-2 text-sm ${T.subtitle}`}>
                            {t(
                                'Gün boyu hareketlerinle birlikte toplam ihtiyacın. Bu civarda kaldığında kilo genelde sabitlenir; antrenmanla yağ-kas dağılımı yine değişebilir.',
                                'Your total daily need with activity. Around this level, weight tends to stay stable while body composition can still improve.'
                            )}
                        </p>
                    </div>

                    {/* İdeal kalori + kilo */}
                    <div className={`rounded-xl border p-4 ${T.cardBg} ${T.cardBorder}`}>
                        <p className={`text-xs ${T.subtitle}`}>{t('İdeal Kalori + İdeal Kilo', 'Ideal Calories + Ideal Weight')}</p>
                        <p className={`mt-1 text-2xl font-bold ${T.title}`}>
                            {idealPlanInfo ? `${idealPlanInfo.intake.toFixed(0)} kcal` : '--'}
                            {' / '}
                            {idealWeight !== null ? `${idealWeight.toFixed(1)} kg` : '--'}
                        </p>
                        <p className={`mt-2 text-sm ${T.subtitle}`}>
                            {t(
                                'Hedefledigimiz degisimi yakalamak icin haftalik ortalamada bu kalori cizgisini takip etmeni oneririz.',
                                'To reach the desired change, aim around this calorie line in your weekly average.'
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
