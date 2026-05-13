import { useUserStore } from './store/useUserStore';
import { useAuthStore } from './store/useAuthStore';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import Dashboard from './views/Dashboard';
import Onboarding from './views/Onboarding';
import LandingPage from './views/Landing/LandingPage';
import { ToastContainer } from './components/ui/ToastContainer';

function AppContent() {
  useSupabaseSync();

  const stats = useUserStore((state) => state.stats);
  const goal = useUserStore((state) => state.goal);

  return (
    <>
      {stats && goal ? <Dashboard /> : <Onboarding />}
      <ToastContainer />
    </>
  );
}

function App() {
  const session = useAuthStore((state) => state.session);
  const isGuest = useAuthStore((state) => state.isGuest);
  const loading = useAuthStore((state) => state.loading);

  // Supabase session kontrol edilirken bekle
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#1E40AF] flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-2xl">💪</span>
          </div>
          <div className="w-6 h-6 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Giriş yapılmamış ve misafir değilse → Landing
  if (!session && !isGuest) {
    return <LandingPage />;
  }

  // Giriş yapılmış veya misafir → uygulama
  return <AppContent />;
}

export default App;
