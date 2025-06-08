import { AppRoutes } from './routes/AppRoutes'
import { AnimatedBackground } from './components/AnimatedBackground'

function App() {
  return (
    <div className="App relative min-h-screen">
      <AnimatedBackground />
      <AppRoutes />
    </div>
  )
}

export default App