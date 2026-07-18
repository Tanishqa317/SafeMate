import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CoreVitals from './pages/CoreVitals';
import VibrationDNA from './pages/VibrationDNA';
import SwissCheese from './pages/SwissCheese';
import Replay from './pages/Replay';
import OracleSwarm from './pages/OracleSwarm';
import Evacuation from './pages/Evacuation';
import AlarmFatigue from './pages/AlarmFatigue';
import EvidenceChain from './pages/EvidenceChain';
import Compliance from './pages/Compliance';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CoreVitals />} />
          <Route path="/vibration-dna" element={<VibrationDNA />} />
          <Route path="/swiss-cheese" element={<SwissCheese />} />
          <Route path="/replay" element={<Replay />} />
          <Route path="/oracle-swarm" element={<OracleSwarm />} />
          <Route path="/evacuation" element={<Evacuation />} />
          <Route path="/alarm-fatigue" element={<AlarmFatigue />} />
          <Route path="/evidence-chain" element={<EvidenceChain />} />
          <Route path="/compliance" element={<Compliance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
