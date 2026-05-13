import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslate } from '../../hooks/useTranslate';
import { useUserStore } from '../../store/useUserStore';

type Tab = 'login' | 'register';

interface AuthPageProps {
    onBack: () => void;
}

export default function AuthPage({ onBack }: Readonly<AuthPageProps>) {
    const [tab, setTab] = useState<Tab>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const t = useTranslate();
    const language = useUserStore((s) => s.language);
    const setLanguage = useUserStore((s) => s.setLanguage);

    const { signIn, signUp, signInWithGoogle, loading, error, clearError } = useAuthStore();

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        clearError();

        if (tab === 'register') {
            if (password !== confirmPassword) return;
            await signUp(email, password);
        } else {
            await signIn(email, password);
        }
    }

    function switchTab(t: Tab) {
        setTab(t);
        clearError();
        setPassword('');
        setConfirmPassword('');
    }

    const submitLabel = tab === 'login'
        ? t('Giriş Yap', 'Sign In')
        : t('Hesap Oluştur', 'Create Account');

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back button + language */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-[#64748B] hover:text-[#0EA5E9] transition-colors text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t('Geri', 'Back')}
                    </button>
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

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(14,165,233,0.12)] border border-[#E2E8F0] overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-[#E2E8F0]">
                        <button
                            id="auth-tab-login"
                            onClick={() => switchTab('login')}
                            className={`flex-1 py-4 text-sm font-semibold transition-all ${tab === 'login'
                                ? 'text-[#0EA5E9] border-b-2 border-[#0EA5E9] bg-[#0EA5E9]/5'
                                : 'text-[#94A3B8] hover:text-[#64748B]'
                                }`}
                        >
                            {t('Giriş Yap', 'Sign In')}
                        </button>
                        <button
                            id="auth-tab-register"
                            onClick={() => switchTab('register')}
                            className={`flex-1 py-4 text-sm font-semibold transition-all ${tab === 'register'
                                ? 'text-[#0EA5E9] border-b-2 border-[#0EA5E9] bg-[#0EA5E9]/5'
                                : 'text-[#94A3B8] hover:text-[#64748B]'
                                }`}
                        >
                            {t('Kayıt Ol', 'Sign Up')}
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#64748B] mb-1.5 uppercase tracking-wide">
                                {t('E-posta', 'Email')}
                            </label>
                            <input
                                id="auth-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('ornek@email.com', 'name@email.com')}
                                className="w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] bg-[#F8FAFC] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E9]/20 transition-all placeholder-[#94A3B8]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#64748B] mb-1.5 uppercase tracking-wide">
                                {t('Şifre', 'Password')}
                            </label>
                            <input
                                id="auth-password"
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('En az 6 karakter', 'At least 6 characters')}
                                className="w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] bg-[#F8FAFC] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E9]/20 transition-all placeholder-[#94A3B8]"
                            />
                        </div>

                        {tab === 'register' && (
                            <div>
                                <label className="block text-xs font-semibold text-[#64748B] mb-1.5 uppercase tracking-wide">
                                    {t('Şifre Tekrar', 'Confirm Password')}
                                </label>
                                <input
                                    id="auth-confirm-password"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t('Şifreyi tekrar gir', 'Re-enter password')}
                                    className="w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] bg-[#F8FAFC] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E9]/20 transition-all placeholder-[#94A3B8]"
                                />
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-xs text-rose-500 mt-1.5">{t('Şifreler eşleşmiyor', 'Passwords do not match')}</p>
                                )}
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
                                <p className="text-sm text-rose-600">{error}</p>
                            </div>
                        )}

                        <button
                            id="auth-submit-btn"
                            type="submit"
                            disabled={loading || (tab === 'register' && password !== confirmPassword)}
                            className="w-full py-3.5 rounded-2xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold text-sm transition-all active:scale-95 shadow-[0_4px_15px_rgba(14,165,233,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    {t('Yükleniyor...', 'Loading...')}
                                </span>
                            ) : submitLabel}
                        </button>

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#E2E8F0]"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-2 text-xs text-[#94A3B8]">{t('veya', 'or')}</span>
                            </div>
                        </div>

                        {/* Google Login */}
                        <button
                            type="button"
                            onClick={() => signInWithGoogle()}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold text-sm hover:bg-[#F8FAFC] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                                <path d="M1 1h22v22H1z" fill="none" />
                            </svg>
                            {t('Google ile Devam Et', 'Continue with Google')}
                        </button>
                    </form>
                </div>

                {/* Register hint */}
                {tab === 'login' && (
                    <p className="text-center text-sm text-[#94A3B8] mt-4">
                        {t('Hesabın yok mu?', "Don't have an account?")}{' '}
                        <button
                            onClick={() => switchTab('register')}
                            className="text-[#0EA5E9] font-semibold hover:underline"
                        >
                            {t('Kayıt ol', 'Sign up')}
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}
