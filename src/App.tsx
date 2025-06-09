import { AppRoutes } from './routes/AppRoutes'
import { AnimatedBackground } from './components/AnimatedBackground'
import { ThemeTransition } from './components/ThemeTransition'

function App() {
  return (
    <div className="App relative min-h-screen transition-theme">
      <AnimatedBackground />
      <AppRoutes />
      <ThemeTransition />
    </div>
  )
}

export default App