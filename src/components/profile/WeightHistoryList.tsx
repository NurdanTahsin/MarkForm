import { useState } from 'react';
import { Pencil, Trash2, PlusCircle, Check, X } from 'lucide-react';
import { useUserStore, type WeightEntry } from '../../store/useUserStore';
import { useActiveTheme } from '../../store/useUserStore';

export function WeightHistoryList() {
    const T = useActiveTheme();
    const weightLog = useUserStore((s) => s.weightLog);
    const addWeightEntry = useUserStore((s) => s.addWeightEntry);
    const updateWeightEntry = useUserStore((s) => s.updateWeightEntry);
    const removeWeightEntry = useUserStore((s) => s.removeWeightEntry);
    const language = useUserStore((s) => s.language);

    const [isAdding, setIsAdding] = useState(false);
    const [newWeight, setNewWeight] = useState('');
    const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editWeight, setEditWeight] = useState('');
    const [editDate, setEditDate] = useState('');

    const handleAdd = () => {
        const w = parseFloat(newWeight);
        if (!isNaN(w) && w > 0 && newDate) {
            // we use mid-day time for ISO to avoid timezone shifts pushing it to previous day
            const isoDate = new Date(`${newDate}T12:00:00Z`).toISOString();
            addWeightEntry(w, isoDate);
            setIsAdding(false);
            setNewWeight('');
        }
    };

    const startEdit = (entry: WeightEntry) => {
        setEditingId(entry.id);
        setEditWeight(entry.weight.toString());
        // Extract YYYY-MM-DD from ISO
        setEditDate(entry.date.split('T')[0]);
    };

    const handleSaveEdit = (id: string) => {
        const w = parseFloat(editWeight);
        if (!isNaN(w) && w > 0 && editDate) {
            const isoDate = new Date(`${editDate}T12:00:00Z`).toISOString();
            updateWeightEntry(id, w, isoDate);
            setEditingId(null);
        }
    };

    const sortedLog = [...weightLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className={`text-base font-semibold ${T.title}`}>Kilo Geçmişi</h3>
                <button
                    type="button"
                    onClick={() => setIsAdding(!isAdding)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${T.accentBtn}`}
                >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Yeni Ekle
                </button>
            </div>

            {isAdding && (
                <div className={`flex items-center gap-2 rounded-2xl border p-3 ${T.cardBorder} ${T.mutedSurface}`}>
                    <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className={`flex-1 rounded-xl px-3 py-2 text-sm outline-none border ${T.cardBorder} ${T.inputBg} ${T.title}`}
                    />
                    <input
                        type="number"
                        placeholder="kg"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className={`w-20 rounded-xl px-3 py-2 text-sm outline-none border ${T.cardBorder} ${T.inputBg} ${T.title}`}
                    />
                    <button type="button" onClick={handleAdd} className={`grid h-9 w-9 place-items-center rounded-xl transition ${T.accentBtn}`}>
                        <Check className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="space-y-2">
                {sortedLog.length === 0 ? (
                    <p className={`text-sm ${T.subtitle} py-4 text-center`}>Henüz kilo kaydınız bulunmuyor.</p>
                ) : (
                    sortedLog.map((entry) => (
                        <div key={entry.id} className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${T.cardBorder} ${T.cardBg}`}>
                            {editingId === entry.id ? (
                                <div className="flex w-full items-center gap-2">
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className={`flex-1 rounded-xl px-2 py-1.5 text-sm outline-none border ${T.cardBorder} ${T.inputBg} ${T.title}`}
                                    />
                                    <input
                                        type="number"
                                        value={editWeight}
                                        onChange={(e) => setEditWeight(e.target.value)}
                                        className={`w-16 rounded-xl px-2 py-1.5 text-sm outline-none border ${T.cardBorder} ${T.inputBg} ${T.title}`}
                                    />
                                    <button type="button" onClick={() => handleSaveEdit(entry.id)} className={`text-emerald-500 hover:opacity-70 p-1`}>
                                        <Check className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => setEditingId(null)} className={`text-rose-500 hover:opacity-70 p-1`}>
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${T.title}`}>{entry.weight} kg</span>
                                        <span className={`text-xs ${T.subtitle}`}>
                                            {new Date(entry.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(entry)}
                                            className={`grid h-8 w-8 place-items-center rounded-full transition ${T.mutedSurface} ${T.title} hover:opacity-70`}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (window.confirm(language === 'tr' ? 'Bu kilo kaydını silmek istediğinize emin misiniz?' : 'Are you sure you want to delete this weight record?')) {
                                                    removeWeightEntry(entry.id);
                                                }
                                            }}
                                            className="grid h-8 w-8 place-items-center rounded-full text-rose-500 transition hover:bg-rose-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
