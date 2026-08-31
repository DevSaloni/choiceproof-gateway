import React from 'react';
import type { ScenarioId } from '../types/choiceproof';
import { Tooltip } from './Tooltip';
import { ShieldCheck, ArrowRight, Info } from './Icons';

interface SelectionStabilityCardProps {
  currentScenario: ScenarioId;
}

export const SelectionStabilityCard: React.FC<SelectionStabilityCardProps> = ({
  currentScenario,
}) => {
  const isUnstable = currentScenario === 'scenario_2';

  return (
    <div className="stability-check-card">
      <div className="stability-card-header">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-indigo-600" />
          <h4 className="stability-title">Selection Stability Check</h4>
        </div>
        <Tooltip content="Compares agent output with and without unverified merchant text to detect prompt poisoning.">
          <Info size={14} className="text-slate-400 cursor-pointer" />
        </Tooltip>
      </div>

      <div className="stability-comparison-layout">
        <div className="stability-sub-card">
          <span className="stability-col-label">Normal AI Selection</span>
          <div className="stability-product-name">
            {isUnstable ? 'Premium X' : 'Nike Runner'}
          </div>
          <span className="stability-col-sub">
            Full catalog including merchant descriptions
          </span>
        </div>

        <div className="stability-divider-arrow">
          <ArrowRight size={16} className="text-slate-400" />
        </div>

        <div className="stability-sub-card">
          <span className="stability-col-label">Clean Selection</span>
          <div className="stability-product-name">Nike Runner</div>
          <span className="stability-col-sub">Verified product facts only</span>
        </div>
      </div>

      <div className="stability-result-banner">
        {isUnstable ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pill-badge pill-amber font-bold">UNSTABLE</span>
              <span className="text-xs font-semibold text-slate-800">
                Selection changed when untrusted merchant-authored content was removed. This is a review signal, not proof of malicious influence.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="pill-badge pill-emerald font-bold">STABLE</span>
            <span className="text-xs font-semibold text-slate-800">
              The AI selected the same product when merchant promotional text was removed.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
