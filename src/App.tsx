import { useUserStore } from './store/useUserStore'
import Dashboard from './views/Dashboard'
import Onboarding from './views/Onboarding'
import { ToastContainer } from './components/ui/ToastContainer'

function App() {
  const stats = useUserStore((state) => state.stats)
  const goal = useUserStore((state) => state.goal)

  return (
    <>
      {stats && goal ? <Dashboard /> : <Onboarding />}
      <ToastContainer />
    </>
  )
}

export default App
