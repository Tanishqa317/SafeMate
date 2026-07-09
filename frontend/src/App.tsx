import Dashboard from './components/Dashboard'
import SwissCheese from './components/SwissCheese'
import ReplayEngine from './components/ReplayEngine'
import EvacMap from './components/EvacMap'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Risk Dashboard</h1>
        <p className="text-slate-400 mt-2">Starter UI for risk monitoring and evacuation planning.</p>
      </header>

      <main className="grid gap-6 md:grid-cols-2">
        <Dashboard />
        <SwissCheese />
        <ReplayEngine />
        <EvacMap />
      </main>
    </div>
  )
}

export default App
