import React from 'react';
import { ShieldCheck, RefreshCw } from './Icons';

interface DashboardHeaderProps {
  onNewSession: () => void;
  onGoToLanding: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onNewSession,
  onGoToLanding,
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
          <div className="header-badge badge-neutral" title="Operating with pre-verified mock catalog fixtures">
            <span className="dot-indicator dot-blue"></span>
            AI: Fixture Mode
          </div>

          <div className="header-badge badge-razorpay" title="Simulated Razorpay Sandbox Payment Verification">
            <span className="dot-indicator dot-indigo"></span>
            Payment: Razorpay Test Mode
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
