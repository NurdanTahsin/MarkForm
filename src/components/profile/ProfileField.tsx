import type { ReactNode } from 'react';
import type { DashTheme } from '../../constants/themes';

interface Props {
    label: string;
    theme: DashTheme;
    unit?: string;
    error?: string;
    children: ReactNode;
}

export function ProfileField({ label, theme, unit, error, children }: Props) {
    return (
        <label className="space-y-1.5">
            <span className={`block text-[11px] font-medium ${theme.subtitle}`}>{label}</span>
            <div className="relative">
                {children}
                {unit ? <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs ${theme.subtitle}`}>{unit}</span> : null}
            </div>
            {error ? <p className="text-xs text-rose-600">{error}</p> : null}
        </label>
    );
}
