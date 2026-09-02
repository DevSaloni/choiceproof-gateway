import React from 'react';
import { ShieldCheck, RefreshCw } from './Icons';

interface DashboardHeaderProps {
  onNewSession: () => void;
  onGoToLanding: () => void;
  aiMode?: string;
  paymentMode?: string;
  apiConnected?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onNewSession,
  onGoToLanding,
  aiMode = 'fixture',
  paymentMode = 'mock',
  apiConnected = false,
}) => {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header-inner">
        {/* Left branding */}
        <div className="header-left">
          <div className="brand-badge-clickable" onClick={onGoToLanding} title="Back to Overview">
            <div className="brand-icon-wrapper-sm">
              <ShieldCheck size={20} className="text-indigo-600" />
            </div>
            <div>
              <div className="header-brand-title">ChoiceProof Gateway</div>
              <div className="header-brand-tagline">Verify the choice. Bind the payment.</div>
            </div>
          </div>
        </div>

        {/* Right badges & controls */}
        <div className="header-right">
          <div className={`header-badge ${apiConnected ? 'badge-neutral' : 'badge-offline'}`} title={apiConnected ? 'Connected to ChoiceProof API' : 'API unreachable'}>
            <span className={`dot-indicator ${apiConnected ? 'dot-emerald' : 'dot-red'}`}></span>
            {apiConnected ? 'API connected' : 'API offline'}
          </div>

          <div className="header-badge badge-neutral" title="AI provider mode from the server">
            <span className="dot-indicator dot-blue"></span>
            AI: {aiMode === 'gemini' ? 'Gemini' : 'Fixture'}
          </div>

          <div className="header-badge badge-razorpay" title="Payment provider mode from the server">
            <span className="dot-indicator dot-indigo"></span>
            Payment: {paymentMode === 'razorpay' ? 'Razorpay Test' : 'Mock'}
          </div>

          <div className="user-chip">
            <div className="user-avatar">DS</div>
            <span className="user-name">Demo Shopper</span>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onNewSession}
            title="Reset session to default state"
          >
            <RefreshCw size={14} />
            New Session
          </button>
        </div>
      </div>
    </header>
  );
};
