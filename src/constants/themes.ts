export type ThemeKey = 'earthy';

export interface DashTheme {
    // Dashboard layout
    pageBg: string;
    cardBg: string;
    dropdownBg: string;
    cardBorder: string;
    title: string;
    subtitle: string;
    accent: string;
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

export const THEME_PRESETS: Record<ThemeKey, DashTheme> = {
    earthy: {
        label: 'Fresh Earth',
        pageBg: 'bg-[#F7F5F0]', // Soft Beige / Off-White
        cardBg: 'bg-[#FFFFFF] border border-[#E8E6E1] shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-[20px]', // Pure White with subtle lift
        dropdownBg: 'bg-[#FFFFFF] border border-[#E8E6E1] rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
        cardBorder: 'border-[#E8E6E1]',
        title: 'text-[#2C3627]', // Deep Slate Green/Grey
        subtitle: 'text-[#828A7E]', // Medium Grey
        accent: 'text-[#4A6B31]', // Deep Grass Green for primary icons/headers
        accentSoft: 'bg-[#F08A1D]/10', // Soft orange for selected states
        mutedSurface: 'bg-[#F7F5F0]',
        inputCls: 'w-full rounded-[20px] border px-4 py-3 text-sm border-[#E8E6E1] text-[#2C3627] bg-[#FFFFFF] outline-none focus:border-[#F08A1D] focus:ring-4 focus:ring-[#F08A1D]/20 transition-all hover:bg-[#F7F5F0]/50 placeholder-[#828A7E]/60',
        circle: 'bg-[#4A6B31]/10',
        inputBg: 'bg-[#FFFFFF]',
        inputBorder: 'border-[#E8E6E1]',
        inputText: 'text-[#2C3627]',
        accentBtn: 'bg-[#F08A1D] hover:bg-[#e07d14] text-white font-bold hover:shadow-[0_4px_15px_rgba(240,138,29,0.25)] transition-all active:scale-95 shadow-sm', // Vibrant Orange
        subtleSurface: 'bg-[#F7F5F0] border border-[#E8E6E1] shadow-sm',
        energySurface: 'bg-[#F08A1D]/10 border border-[#F08A1D]/20',
        recommendationSurface: 'bg-[#F7F5F0] border border-[#E8E6E1]',
        dividerText: 'text-[#828A7E]/40',
        ring: 'focus:ring-[#F08A1D]/30',
        ringTrack: 'stroke-[#F7F5F0]',
        ringProgress: 'ring-4 ring-[#4A6B31]', // Grass Green
        overlay: 'bg-[#2C3627]/40 backdrop-blur-sm',
        dangerSurface: 'bg-rose-50',
        dangerBorder: 'border-rose-200',
        dangerText: 'text-rose-600',
    },
};
