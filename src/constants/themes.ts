export interface DashTheme {
    // Dashboard layout
    pageBg: string;
    cardBg: string;
    dropdownBg: string;
    cardBorder: string;
    title: string;
    subtitle: string;
    accent: string;
    accentSecondary: string;
    accentSoft: string;
    mutedSurface: string;
    inputCls: string;
    // Onboarding fields
    label: string;
    circle: string;
    inputBg: string;
    inputBorder: string;
    inputText: string;
    accentBtn: string;
    subtleSurface: string;
    energySurface: string;
    recommendationSurface: string;
    dividerText: string;
    ring: string;
    ringTrack: string;
    ringProgress: string;
    overlay: string;
    dangerSurface: string;
    dangerBorder: string;
    dangerText: string;
}

export const THEME: DashTheme = {
    label: 'Ocean Breeze',
    pageBg: 'bg-[#F8FAFC]',
    cardBg: 'bg-white',
    dropdownBg: 'bg-white border border-[#E2E8F0] rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
    cardBorder: 'border-[#E2E8F0]',
    title: 'text-[#1E3A8A]', // Darker blue (blue-900 equivalent)
    subtitle: 'text-[#64748B]',
    accent: 'text-[#0EA5E9]',
    accentSecondary: 'bg-[#1E40AF] text-white hover:bg-[#1E3A8A]', // Dark blue btn
    accentSoft: 'bg-[#0EA5E9]/10',
    mutedSurface: 'bg-[#F1F5F9]',
    inputCls: 'w-full rounded-[20px] border px-4 py-3 text-sm border-[#E2E8F0] text-[#0F172A] bg-white outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E9]/20 transition-all hover:bg-[#F8FAFC] placeholder-[#64748B]/60',
    circle: 'bg-[#0EA5E9]/10',
    inputBg: 'bg-white',
    inputBorder: 'border-[#E2E8F0]',
    inputText: 'text-[#0F172A]',
    accentBtn: 'bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold hover:shadow-[0_4px_15px_rgba(14,165,233,0.3)] transition-all active:scale-95 shadow-sm',
    subtleSurface: 'bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm',
    energySurface: 'bg-[#F59E0B]/10 border border-[#F59E0B]/20',
    recommendationSurface: 'bg-[#F8FAFC] border border-[#E2E8F0]',
    dividerText: 'text-[#94A3B8]',
    ring: 'focus:ring-[#0EA5E9]/30',
    ringTrack: 'stroke-[#F1F5F9]',
    ringProgress: 'ring-4 ring-[#0EA5E9]',
    overlay: 'bg-[#0F172A]/40 backdrop-blur-sm',
    dangerSurface: 'bg-rose-50',
    dangerBorder: 'border-rose-200',
    dangerText: 'text-rose-600',
};

/** Geriye uyumluluk veya kolay erişim için doğrudan THEME objesini döner */
export function resolveTheme(): DashTheme {
    return THEME;
}
