import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';

const DEBOUNCE_MS = 1200;

/**
 * Supabase ↔ Zustand store senkronizasyonu.
 * Sadece auth kullanıcıları için çalışır, misafirler es geçilir.
 */
export function useSupabaseSync() {
    const user = useAuthStore((s) => s.user);
    const isGuest = useAuthStore((s) => s.isGuest);
    const storeState = useUserStore();
    const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const didPullRef = useRef(false);

    // ── PULL: cloud → store ────────────────────────────────────────────────
    useEffect(() => {
        if (!user || isGuest || didPullRef.current) return;
        didPullRef.current = true;

        async function pull() {
            // 1. Profile çek
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user!.id)
                .single();

            // 2. Günlük loglar çek
            const { data: logs } = await supabase
                .from('daily_logs')
                .select('*')
                .eq('user_id', user!.id);

            const cloudHasData = profile && (profile.stats || profile.goal);
            const localStats = useUserStore.getState().stats;
            const localGoal = useUserStore.getState().goal;
            const localLogs = useUserStore.getState().logs;

            if (!cloudHasData && (localStats || localGoal)) {
                // ── MIGRATION: localStorage → cloud ──────────────────────
                console.log('[Sync] localStorage verisi cloud\'a migrate ediliyor...');
                await supabase.from('profiles').upsert({
                    id: user!.id,
                    stats: localStats,
                    goal: localGoal,
                    water_target: useUserStore.getState().waterTarget,
                    weight_log: useUserStore.getState().weightLog,
                    personal_foods: useUserStore.getState().personalFoods,
                    language: useUserStore.getState().language,
                    updated_at: new Date().toISOString(),
                });

                if (localLogs.length > 0) {
                    const logRows = localLogs.map((log) => ({
                        user_id: user!.id,
                        date: log.date,
                        data: log,
                    }));
                    await supabase.from('daily_logs').upsert(logRows, { onConflict: 'user_id,date' });
                }
            } else if (cloudHasData && profile) {
                // ── PULL: cloud verisi store'a yaz ───────────────────────
                const { setStats, setGoal, setWaterTarget, setLanguage } = useUserStore.getState();
                if (profile.stats) setStats(profile.stats);
                if (profile.goal) setGoal(profile.goal);
                if (profile.water_target) setWaterTarget(profile.water_target);
                if (profile.language) setLanguage(profile.language as 'tr' | 'en');

                if (logs && logs.length > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const parsedLogs = logs.map((row: any) => row.data as import('../types').DailyLog);
                    useUserStore.setState({ logs: parsedLogs });
                }

                if (profile.weight_log) {
                    useUserStore.setState({ weightLog: profile.weight_log });
                }
                if (profile.personal_foods) {
                    useUserStore.setState({ personalFoods: profile.personal_foods });
                }
            }
        }

        pull();
    }, [user, isGuest]);

    // ── PUSH: store → cloud (debounced) ───────────────────────────────────
    useEffect(() => {
        if (!user || isGuest) return;
        if (!didPullRef.current) return; // pull tamamlanmadan push yapma

        if (pushTimerRef.current) clearTimeout(pushTimerRef.current);

        pushTimerRef.current = setTimeout(async () => {
            const state = useUserStore.getState();

            await supabase.from('profiles').upsert({
                id: user.id,
                stats: state.stats,
                goal: state.goal,
                water_target: state.waterTarget,
                weight_log: state.weightLog,
                personal_foods: state.personalFoods,
                language: state.language,
                updated_at: new Date().toISOString(),
            });

            if (state.logs.length > 0) {
                const logRows = state.logs.map((log) => ({
                    user_id: user.id,
                    date: log.date,
                    data: log,
                }));
                await supabase.from('daily_logs').upsert(logRows, { onConflict: 'user_id,date' });
            }
        }, DEBOUNCE_MS);

        return () => {
            if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        user,
        isGuest,
        storeState.stats,
        storeState.goal,
        storeState.logs,
        storeState.waterTarget,
        storeState.weightLog,
        storeState.personalFoods,
        storeState.language,
    ]);

    // Auth değişince pull flag'ini sıfırla
    useEffect(() => {
        didPullRef.current = false;
    }, [user]);
}
