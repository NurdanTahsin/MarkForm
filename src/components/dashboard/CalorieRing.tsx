import { CIRCUMFERENCE } from '../../constants/dashboardConstants';
import { useActiveTheme } from '../../store/useUserStore';

interface Props {
    value: number;
    max: number;
}

export function CalorieRing({ value, max }: Props) {
    const T = useActiveTheme();
    const offset = max > 0 ? Math.round(CIRCUMFERENCE * (1 - Math.min(1, value / max))) : CIRCUMFERENCE;
    return (
        <div className="relative h-36 w-36 shrink-0 sm:h-40 sm:w-40">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="46" fill="none" strokeWidth="10" className={T.ringTrack} />
                <circle
                    cx="60" cy="60" r="46" fill="none" strokeWidth="10" strokeLinecap="round"
                    className="stroke-[#1E40AF]"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                    <p className={`text-xl font-bold sm:text-2xl ${T.title}`}>{Math.round(value)}</p>
                    <p className={`text-xs ${T.subtitle}`}>/{max} kcal</p>
                </div>
            </div>
        </div>
    );
}
