import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslate } from '../../hooks/useTranslate';
import { useUserStore } from '../../store/useUserStore';
import AuthPage from '../Auth/AuthPage';
import PrivacyPolicy from './PrivacyPolicy';

const FEATURES = [
    { icon: '🔥', labelTr: 'Kalori Takibi', labelEn: 'Calorie Tracking' },
    { icon: '💧', labelTr: 'Su Takibi', labelEn: 'Water Tracking' },
    { icon: '🏃', labelTr: 'Egzersiz Takibi', labelEn: 'Exercise Tracking' },
    { icon: '🌸', labelTr: 'Adet Takvimi', labelEn: 'Cycle Calendar' },
    { icon: '🎯', labelTr: 'Kişisel Plan', labelEn: 'Personal Plan' },
];

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const { continueAsGuest } = useAuthStore();
    const t = useTranslate();
    const language = useUserStore((s) => s.language);
    const setLanguage = useUserStore((s) => s.setLanguage);

    if (showPrivacy) {
        return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
    }

    if (showAuth) {
        return <AuthPage onBack={() => setShowAuth(false)} />;
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#E0F2FE] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#0EA5E9]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-15 -left-15 w-65 h-65 bg-[#1E40AF]/8 rounded-full blur-3xl pointer-events-none" />

            <div className="absolute top-4 right-4 z-20 flex rounded-full border border-[#E2E8F0] bg-white/90 p-0.5 shadow-sm sm:top-6 sm:right-6 sm:p-1">
                {(['tr', 'en'] as const).map((lang) => (
                    <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition sm:px-3 sm:text-xs ${language === lang ? 'bg-[#0EA5E9] text-white' : 'text-[#64748B] hover:text-[#0EA5E9]'}`}
                    >
                        {lang.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="w-full max-w-sm relative z-10 flex flex-col items-center text-center">

                {/* Logo */}
                <div className="mb-3 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="w-14 h-14 rounded-2xl shrink-0 overflow-hidden">
                            <img src="/icon.png" alt="MarkForm Logo" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="text-[2.2rem] font-black text-[#1E3A8A] tracking-tight leading-none pt-1 sm:text-[2.75rem]">
                            Mark<span className="text-[#0EA5E9]">Form</span>
                        </h1>
                    </div>
                    <p className="text-[#64748B] text-sm font-medium mt-1">
                        {t('Sağlıklı yaşamın akıllı takipçisi', 'Your smart healthy living tracker')}
                    </p>
                </div>

                {/* Feature chips */}
                <div className="flex flex-wrap justify-center gap-2 my-8">
                    {FEATURES.map((f) => (
                        <span
                            key={f.labelTr}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-[#1E3A8A] text-xs font-semibold shadow-sm"
                        >
                            <span className="text-sm">{f.icon}</span>
                            {language === 'tr' ? f.labelTr : f.labelEn}
                        </span>
                    ))}
                </div>

                {/* CTAs */}
                <div className="w-full space-y-3">
                    <button
                        id="landing-create-account-btn"
                        onClick={() => setShowAuth(true)}
                        className="w-full py-4 rounded-2xl bg-linear-to-r from-[#0EA5E9] to-[#1E40AF] text-white font-bold text-base shadow-[0_6px_24px_rgba(14,165,233,0.35)] hover:shadow-[0_8px_30px_rgba(14,165,233,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                    >
                        {t('Hesap Aç / Giriş Yap', 'Create Account / Sign In')}
                    </button>

                    <button
                        id="landing-guest-btn"
                        onClick={continueAsGuest}
                        className="w-full py-3.5 rounded-2xl bg-white border border-[#E2E8F0] text-[#64748B] font-semibold text-sm hover:border-[#0EA5E9] hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/5 active:scale-95 transition-all duration-200 shadow-sm"
                    >
                        {t('Misafir Olarak Devam Et →', 'Continue as Guest →')}
                    </button>
                </div>

                <div className="mt-6 flex flex-col items-center gap-1.5">
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                        {t('Misafir modunda veriler yalnızca bu cihazda saklanır', 'In guest mode, data stays only on this device')}
                    </p>
                    <button
                        onClick={() => setShowPrivacy(true)}
                        className="text-xs text-[#64748B] hover:text-[#0EA5E9] transition-colors underline decoration-[#E2E8F0] hover:decoration-[#0EA5E9] underline-offset-4"
                    >
                        {t('Gizlilik Politikası', 'Privacy Policy')}
                    </button>
                </div>
            </div>
        </div>
    );
}
