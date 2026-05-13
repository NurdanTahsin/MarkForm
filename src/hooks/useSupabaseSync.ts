import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';

const DEBOUNCE_MS = 1200;

type CloudProfile = {
    stats?: unknown;
    goal?: unknown;
    water_target?: number;
    weight_log?: unknown;
    personal_foods?: unknown;
    language?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CloudLogRow = { data: any };

async function fetchProfile(userId: string) {
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return data as CloudProfile | null;
}

async function fetchLogs(userId: string) {
    const { data } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId);
    return (data ?? []) as CloudLogRow[];
}

function hasCloudData(profile: CloudProfile | null): boolean {
    return Boolean(profile && (profile.stats || profile.goal));
}

async function migrateLocalToCloud(userId: string) {
    const state = useUserStore.getState();
    await supabase.from('profiles').upsert({
        id: userId,
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
            user_id: userId,
            date: log.date,
            data: log,
        }));
        await supabase.from('daily_logs').upsert(logRows, { onConflict: 'user_id,date' });
    }
}

function applyCloudToStore(profile: CloudProfile, logs: CloudLogRow[]) {
    const { setStats, setGoal, setWaterTarget, setLanguage } = useUserStore.getState();
    if (profile.stats) setStats(profile.stats as import('../types').UserStats);
    if (profile.goal) setGoal(profile.goal as import('../types').UserGoal);
    if (profile.water_target) setWaterTarget(profile.water_target);
    if (profile.language) setLanguage(profile.language as 'tr' | 'en');

    if (logs.length > 0) {
        const parsedLogs = logs.map((row) => row.data as import('../types').DailyLog);
        useUserStore.setState({ logs: parsedLogs });
    }

    if (profile.weight_log) {
        useUserStore.setState({ weightLog: profile.weight_log as import('../types').WeightEntry[] });
    }
    if (profile.personal_foods) {
        useUserStore.setState({ personalFoods: profile.personal_foods as import('../types').FoodItem[] });
    }
}

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
            const userId = user.id;
            const [profile, logs] = await Promise.all([
                fetchProfile(userId),
                fetchLogs(userId),
            ]);

            const cloudHasData = hasCloudData(profile);
            const local = useUserStore.getState();

            if (!cloudHasData && (local.stats || local.goal)) {
                console.log('[Sync] localStorage verisi cloud\'a migrate ediliyor...');
                await migrateLocalToCloud(userId);
                return;
            }

            if (cloudHasData && profile) {
                applyCloudToStore(profile, logs);
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
