import { useUserStore } from '../store/useUserStore';

/**
 * Returns a translation helper bound to the current app language.
 * Usage: const t = useTranslate(); → t('Türkçe metin', 'English text')
 */
export function useTranslate() {
    const language = useUserStore((s) => s.language);
    return (tr: string, en: string): string => (language === 'tr' ? tr : en);
}
