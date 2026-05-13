import { useTranslate } from '../../hooks/useTranslate';
import { useUserStore } from '../../store/useUserStore';

interface Props {
    onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: Readonly<Props>) {
    const t = useTranslate();
    const language = useUserStore((s) => s.language);
    const setLanguage = useUserStore((s) => s.setLanguage);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col p-6">
            <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pt-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            aria-label={t('Geri', 'Back')}
                            title={t('Geri', 'Back')}
                            className="grid h-10 w-10 place-items-center rounded-full bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0EA5E9] hover:border-[#0EA5E9] transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-[#1E3A8A]">
                                {t('Gizlilik Politikası', 'Privacy Policy')}
                            </h1>
                            <p className="text-xs text-[#64748B] mt-1">
                                {t('Yürürlük Tarihi: 13 Mayıs 2026', 'Effective Date: May 13, 2026')}
                            </p>
                        </div>
                    </div>
                    <div className="flex rounded-full border border-[#E2E8F0] bg-white p-1 shadow-sm">
                        {(['tr', 'en'] as const).map((lang) => (
                            <button
                                key={lang}
                                type="button"
                                onClick={() => setLanguage(lang)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${language === lang ? 'bg-[#0EA5E9] text-white' : 'text-[#64748B] hover:text-[#0EA5E9]'}`}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E2E8F0] space-y-6 flex-1 text-[#475569] leading-relaxed text-sm">
                    <section>
                        <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">
                            {t('1. Kapsam ve Denetleyici', '1. Scope and Controller')}
                        </h2>
                        <p>
                            {t(
                                'Bu Gizlilik Politikası, MarkForm uygulamasını kullanırken verdiğiniz bilgilerin nasıl işlendiğini açıklar. MarkForm, bu verilerin işlenmesinden sorumludur.',
                                'This Privacy Policy explains how your information is processed when you use MarkForm. MarkForm is responsible for the processing of this data.'
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">
                            {t('2. Topladığımız Veriler', '2. Data We Collect')}
                        </h2>
                        <p>
                            {t(
                                'Yalnızca sizin sağladığınız bilgileri toplarız: hesap oluşturduğunuzda e-posta adresi, profil ve sağlık takibi için girdiğiniz ölçümler (boy, kilo, kalori, su, adet döngüsü vb.) ve uygulama içinde oluşturduğunuz günlük kayıtlar.',
                                'We collect only the information you provide: your email address when you create an account, measurements you enter for profile and health tracking (height, weight, calories, water, cycle tracking, etc.), and daily logs you create in the app.'
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">
                            {t('3. Verileri Nasıl Kullanırız', '3. How We Use Data')}
                        </h2>
                        <p>
                            {t(
                                'Verilerinizi uygulama özelliklerini sağlamak, hesap doğrulamak, cihazlar arası senkronizasyon yapmak ve talep ettiğiniz işlevleri yerine getirmek için kullanırız. Verilerinizi reklam amacıyla satmayız veya pazarlama için paylaşmayız.',
                                'We use your data to provide app features, authenticate your account, synchronize across devices, and deliver the functionality you request. We do not sell your data or share it for advertising or marketing purposes.'
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">
                            {t('4. Saklama ve İşleme', '4. Storage and Processing')}
                        </h2>
                        <p>
                            {t(
                                'Misafir modunda kullandığınız veriler yalnızca cihazınızda saklanır. Hesapla giriş yaptığınızda verileriniz, güvenli senkronizasyon sağlamak için bulut tabanlı altyapıda (Supabase) saklanır ve iletim sırasında şifrelenir.',
                                'When you use guest mode, your data is stored only on your device. When you sign in, your data is stored on cloud infrastructure (Supabase) for secure synchronization and is encrypted in transit.'
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">
                            {t('5. Paylaşım ve Üçüncü Taraflar', '5. Sharing and Third Parties')}
                        </h2>
                        <p>
                            {t(
                                'Verilerinizi yalnızca hizmeti sağlayabilmek için gerekli teknik hizmet sağlayıcılarla (ör. kimlik doğrulama ve veri barındırma) paylaşabiliriz. Google ile giriş yaptığınızda yalnızca temel kimlik bilgileri (e-posta) alınır. Yasal zorunluluk olmadıkça verileriniz üçüncü taraflarla paylaşılmaz.',
                                'We may share your data only with technical service providers required to operate the service (e.g., authentication and hosting). If you sign in with Google, only basic identity information (email) is received. We do not share your data with third parties unless required by law.'
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">
                            {t('6. Haklarınız ve Veri Silme', '6. Your Rights and Deletion')}
                        </h2>
                        <p>
                            {t(
                                'Dilediğiniz zaman hesabınızı kapatabilir veya uygulama içinden verilerinizi silebilirsiniz. Silme talebiniz sonrası verileriniz kalıcı olarak kaldırılır ve geri getirilemez.',
                                'You can close your account or delete your data at any time from within the app. After deletion, your data is permanently removed and cannot be restored.'
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">
                            {t('7. Güvenlik', '7. Security')}
                        </h2>
                        <p>
                            {t(
                                'Verilerinizin güvenliği için makul teknik ve idari önlemler uygularız. Ancak internet üzerinden yapılan hiçbir aktarım %100 güvenli değildir.',
                                'We apply reasonable technical and administrative measures to protect your data. However, no transmission over the internet is 100% secure.'
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">
                            {t('8. Çocukların Gizliliği', "8. Children's Privacy")}
                        </h2>
                        <p>
                            {t(
                                'MarkForm, 13 yaşın altındaki çocuklar için tasarlanmamıştır ve bilerek çocuklardan veri toplamaz.',
                                'MarkForm is not intended for children under 13 and we do not knowingly collect data from children.'
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">
                            {t('9. Değişiklikler', '9. Changes')}
                        </h2>
                        <p>
                            {t(
                                'Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda uygulama içinde bildirim yaparız.',
                                'We may update this policy from time to time. If changes are significant, we will notify you within the app.'
                            )}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-[#1E3A8A] mb-2">
                            {t('10. İletişim', '10. Contact')}
                        </h2>
                        <p>
                            {t(
                                'Bu gizlilik politikasıyla ilgili sorular için bize şu adresten ulaşabilirsiniz: nurdantahsin345@gmail.com',
                                'If you have questions about this policy, you can contact us at: nurdantahsin345@gmail.com'
                            )}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
