import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import LegacyProofLab from './App.tsx';
import { ConciergeApp } from './ConciergeApp.tsx';

export function Router() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<ConciergeApp route="landing" />} />
      <Route path="/shop" element={<ConciergeApp route="shop" />} />
      <Route path="/proof/:sessionId" element={<ProofRoute />} />
      <Route path="/lab" element={<LegacyProofLab initialPage="dashboard" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>;
}

function ProofRoute() {
  const { sessionId } = useParams();
  return <ConciergeApp route="proof" sessionId={sessionId} />;
}
