import { AppRoutes } from "./routes/AppRoutes";
import { ThemeTransition } from "./components/ThemeTransition";

function App() {
  return (
    <div className="App relative min-h-screen transition-theme">
      <AppRoutes />
      <ThemeTransition />
    </div>
  );
}

export default App;
