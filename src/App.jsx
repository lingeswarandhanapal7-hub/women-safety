import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardShell from './components/DashboardShell';
import OnboardingGate from './components/OnboardingGate';
import AlertPanel from './pages/AlertPanel';
import DistressDetector from './pages/DistressDetector';
import SafetyScorePage from './pages/SafetyScorePage';
import SafetyNavigator from './pages/SafetyNavigator';
import CommunityShield from './pages/CommunityShield';
import EvidenceVault from './pages/EvidenceVault';
import ShadowMode from './pages/ShadowMode';
import WearablePanel from './pages/WearablePanel';
import FakeCall from './pages/FakeCall';
import AICompanion from './pages/AICompanion';
import OfflineMode from './pages/OfflineMode';
import Settings from './pages/Settings';
import useUserStore from './store/useUserStore';
import useSocketStore from './store/useSocketStore';
import useLocationStore from './store/useLocationStore';
import useAlertStore from './store/useAlertStore';
import api from './api';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useUserStore();
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  const { user, token, isAuthenticated, fetchMe } = useUserStore();
  const { init: initSocket } = useSocketStore();
  const { startTracking } = useLocationStore();
  const { fetchActive } = useAlertStore();

  // Init on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
      fetchActive();
      startTracking();
      if (token) initSocket(token);

      // Replay offline queue
      if (navigator.onLine) {
        const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        if (queue.length > 0) {
          Promise.all(queue.map(r => api({ url: r.url, method: r.method, data: r.data })))
            .then(() => {
              localStorage.setItem('offlineQueue', '[]');
              console.log(`✅ ${queue.length} offline actions synced`);
            })
            .catch(() => {});
        }
      }

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [isAuthenticated, token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <OnboardingGate>
                <DashboardShell />
              </OnboardingGate>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/alerts" replace />} />
          <Route path="alerts" element={<AlertPanel />} />
          <Route path="distress" element={<DistressDetector />} />
          <Route path="score" element={<SafetyScorePage />} />
          <Route path="route" element={<SafetyNavigator />} />
          <Route path="community" element={<CommunityShield />} />
          <Route path="evidence" element={<EvidenceVault />} />
          <Route path="shadow" element={<ShadowMode />} />
          <Route path="wearable" element={<WearablePanel />} />
          <Route path="fakecall" element={<FakeCall />} />
          <Route path="companion" element={<AICompanion />} />
          <Route path="offline" element={<OfflineMode />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
