import React from 'react';
import type { ScenarioId } from '../types/choiceproof';
import { SCENARIOS } from '../data/mockData';
import { CheckCircle2, AlertTriangle, ShieldAlert } from './Icons';

interface ScenarioSelectorProps {
  currentScenario: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  currentScenario,
  onSelectScenario,
}) => {
  return (
    <div className="scenario-selector-container">
      <div className="scenario-selector-header">
        <h2 className="scenario-selector-title">Choose a demo scenario</h2>
        <span className="scenario-selector-hint">
          Switch test fixtures to evaluate how ChoiceProof audits AI decisions & blocks payment mutations.
        </span>
      </div>

      <div className="scenario-grid">
        {SCENARIOS.map((sc) => {
          const isSelected = currentScenario === sc.id;

          let icon = <CheckCircle2 size={20} className="text-emerald-600" />;
          let activeBorderClass = 'border-emerald-500 ring-emerald-100';

          if (sc.badgeType === 'review') {
            icon = <AlertTriangle size={20} className="text-amber-500" />;
            activeBorderClass = 'border-amber-500 ring-amber-100';
          } else if (sc.badgeType === 'blocked') {
            icon = <ShieldAlert size={20} className="text-red-500" />;
            activeBorderClass = 'border-red-500 ring-red-100';
          }

          return (
            <button
              key={sc.id}
              type="button"
              className={`scenario-card ${
                isSelected ? `scenario-card-active ${activeBorderClass}` : ''
              }`}
              onClick={() => onSelectScenario(sc.id)}
            >
              <div className="scenario-card-top">
                <div className="scenario-icon-wrapper">{icon}</div>
                <div className="scenario-badge-label">
                  {sc.badgeType === 'clean' && (
                    <span className="pill-badge pill-emerald">Approved</span>
                  )}
                  {sc.badgeType === 'review' && (
                    <span className="pill-badge pill-amber">Review Signal</span>
                  )}
                  {sc.badgeType === 'blocked' && (
                    <span className="pill-badge pill-red">Cart Attack</span>
                  )}
                </div>
              </div>

              <div className="scenario-card-title">{sc.title}</div>
              <div className="scenario-card-desc">{sc.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
