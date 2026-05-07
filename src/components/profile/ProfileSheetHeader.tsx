import { Check, Pencil, X } from 'lucide-react';
import type { DashTheme } from '../../constants/themes';
import type { ProfileCopy } from './profileCopy';

interface Props {
    theme: DashTheme;
    copy: ProfileCopy;
    avatarLetter: string;
    displayName: string;
    emailDraft: string;
    emailError?: string;
    editingEmail: boolean;
    isDirty: boolean;
    canSave: boolean;
    onEmailChange: (value: string) => void;
    onToggleEmailEdit: (value: boolean) => void;
    onSave: () => void;
    onClose: () => void;
}

export function ProfileSheetHeader({
    theme,
    copy,
    avatarLetter,
    displayName,
    emailDraft,
    emailError,
    editingEmail,
    isDirty,
    canSave,
    onEmailChange,
    onToggleEmailEdit,
    onSave,
    onClose,
}: Props) {
    return (
        <div className={`sticky top-0 z-10 border-b px-4 py-4 sm:px-5 ${theme.dropdownBg} ${theme.cardBorder}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${theme.circle} text-lg font-bold text-white`}>
                        {avatarLetter}
                    </div>
                    <div className="min-w-0">
                        <h2 id="profile-sheet-title" className={`text-lg font-semibold ${theme.title}`}>
                            {displayName}
                        </h2>
                        {editingEmail ? (
                            <div className="mt-1 flex items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <input
                                        type="email"
                                        value={emailDraft}
                                        onChange={(event) => onEmailChange(event.target.value)}
                                        aria-label={copy.emailPlaceholder}
                                        className={`w-full rounded-2xl border px-3 py-2 text-xs outline-none transition ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.ring} focus:ring-1`}
                                        autoFocus
                                    />
                                    {emailError ? <p className="mt-1 text-xs text-rose-600">{emailError}</p> : null}
                                </div>
                                <button
                                    type="button"
                                    aria-label={copy.emailDone}
                                    onClick={() => onToggleEmailEdit(false)}
                                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${theme.mutedSurface} ${theme.title}`}
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => onToggleEmailEdit(true)}
                                className={`mt-1 flex items-center gap-1 text-sm ${theme.subtitle} hover:underline`}
                            >
                                <span className="truncate">{emailDraft || copy.emailPlaceholder}</span>
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                    {isDirty ? (
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={!canSave}
                            data-autofocus
                            className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${theme.accentBtn}`}
                        >
                            <Check className="h-4 w-4" />
                            {canSave ? copy.save : copy.saveInvalid}
                        </button>
                    ) : null}
                    <button
                        type="button"
                        aria-label={copy.close}
                        onClick={onClose}
                        className={`grid h-10 w-10 place-items-center rounded-full border transition ${theme.cardBorder} ${theme.mutedSurface} ${theme.title}`}
                    >
                        <X className="h-4.5 w-4.5" />
                    </button>
                </div>
            </div>

            {isDirty ? (
                <p className={`mt-3 text-xs ${canSave ? theme.subtitle : 'text-rose-600'}`}>
                    {canSave ? copy.saveHint : copy.saveInvalid}
                </p>
            ) : null}
        </div>
    );
}
