import './App.css'
import { useUserStore } from './store/useUserStore'
import Dashboard from './views/Dashboard'
import Onboarding from './views/Onboarding'

function App() {
  const stats = useUserStore((state) => state.stats)
  const goal = useUserStore((state) => state.goal)

  if (stats && goal) {
    return <Dashboard />
  }

  return <Onboarding />
}

export default App
