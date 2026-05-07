import { createPortal } from 'react-dom';
import { useToastStore } from '../../store/useToastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useActiveTheme } from '../../store/useUserStore';

export function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);
    const removeToast = useToastStore((s) => s.removeToast);
    const T = useActiveTheme();

    if (toasts.length === 0) return null;

    return createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4">
            {toasts.map((toast) => {
                let Icon = Info;
                let colors = `${T.cardBg} ${T.title} border-${T.cardBorder}`;
                
                if (toast.type === 'success') {
                    Icon = CheckCircle2;
                    colors = 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20';
                } else if (toast.type === 'error') {
                    Icon = AlertCircle;
                    colors = 'bg-rose-500 text-white border-rose-600 shadow-rose-500/20';
                }

                return (
                    <div 
                        key={toast.id} 
                        className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-bottom-4 fade-in duration-300 ${colors}`}
                    >
                        <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 shrink-0" />
                            <p className="text-sm font-medium">{toast.message}</p>
                        </div>
                        <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}
        </div>,
        document.body
    );
}
