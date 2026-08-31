import React, { useState } from 'react';
import type { IntentLockRules } from '../types/choiceproof';
import { DEFAULT_USER_REQUEST } from '../data/mockData';
import {
  Sparkles,
  CheckCircle2,
  Footprints,
  IndianRupee,
  Truck,
  Ban,
  Tag,
  Edit3,
  Check,
  AlertCircle,
} from './Icons';

interface IntentLockColumnProps {
  intentRules: IntentLockRules;
  onUpdateRules: (rules: IntentLockRules) => void;
  onConfirmLock: () => void;
}

export const IntentLockColumn: React.FC<IntentLockColumnProps> = ({
  intentRules,
  onUpdateRules,
  onConfirmLock,
}) => {
  const [inputText, setInputText] = useState(DEFAULT_USER_REQUEST);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUnresolvedSample, setShowUnresolvedSample] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onUpdateRules({
        ...intentRules,
        status: 'parsed',
      });
    }, 600);
  };

  const handleUseExample = () => {
    setInputText(DEFAULT_USER_REQUEST);
  };

  const handleEdit = () => {
    onUpdateRules({
      ...intentRules,
      status: 'draft',
    });
  };

  return (
    <div className="column-card step-card">
      <div className="step-card-header">
        <div className="step-badge">Step 1</div>
        <h3 className="step-title">Intent Lock</h3>
      </div>
      <p className="step-subtitle">
        Define and lock the strict boundaries for your autonomous shopping agent.
      </p>

      {/* Draft State */}
      {intentRules.status === 'draft' && (
        <div className="intent-input-area">
          <label htmlFor="user-request-input" className="form-label">
            What should your AI shopping agent buy?
          </label>
          <textarea
            id="user-request-input"
            className="form-textarea"
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. Buy running shoes, size UK 8, under ₹5000..."
          />

          <div className="intent-action-row">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleUseExample}
            >
              Use Example
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAnalyze}
              disabled={!inputText.trim()}
            >
              <Sparkles size={14} />
              Analyze Requirements
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="analyzing-state">
          <div className="spinner-indigo" />
          <p className="analyzing-text">
            Turning your request into clear shopping rules…
          </p>
          <span className="analyzing-sub">Extracting category, budget, delivery & preferences</span>
        </div>
      )}

      {/* Parsed Preview State */}
      {!isAnalyzing && intentRules.status === 'parsed' && (
        <div className="parsed-intent-container">
          <div className="parsed-header">
            <span className="parsed-title">Intent Lock Preview</span>
            <span className="pill-badge pill-blue">v{intentRules.version} Draft</span>
          </div>

          <div className="intent-section">
            <div className="intent-section-label">Category</div>
            <div className="intent-category-val">{intentRules.category}</div>
          </div>

          <div className="intent-section">
            <div className="intent-section-label">Hard requirements:</div>
            <div className="intent-rules-list">
              <div className="intent-rule-item">
                <div className="rule-icon bg-indigo-50 text-indigo-600">
                  <Footprints size={15} />
                </div>
                <div className="rule-details">
                  <span className="rule-key">Size</span>
                  <span className="rule-val">{intentRules.size}</span>
                </div>
              </div>

              <div className="intent-rule-item">
                <div className="rule-icon bg-emerald-50 text-emerald-600">
                  <IndianRupee size={15} />
                </div>
                <div className="rule-details">
                  <span className="rule-key">Maximum budget</span>
                  <span className="rule-val">₹{intentRules.maxBudget.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="intent-rule-item">
                <div className="rule-icon bg-blue-50 text-blue-600">
                  <Truck size={15} />
                </div>
                <div className="rule-details">
                  <span className="rule-key">Delivery within</span>
                  <span className="rule-val">{intentRules.deliveryDaysLimit} days</span>
                </div>
              </div>

              <div className="intent-rule-item">
                <div className="rule-icon bg-slate-100 text-slate-700">
                  <Ban size={15} />
                </div>
                <div className="rule-details">
                  <span className="rule-key">Subscription</span>
                  <span className="rule-val">
                    {intentRules.subscriptionAllowed ? 'Allowed' : 'Not allowed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="intent-section">
            <div className="intent-section-label">Preference:</div>
            <div className="intent-pref-item">
              <div className="rule-icon bg-purple-50 text-purple-600">
                <Tag size={15} />
              </div>
              <div className="rule-details">
                <span className="rule-key">Brand</span>
                <span className="rule-val">{intentRules.brandPreference}</span>
              </div>
            </div>
          </div>

          <div className="intent-button-row">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleEdit}
            >
              <Edit3 size={14} />
              Edit
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm btn-glow"
              onClick={onConfirmLock}
            >
              <Check size={15} />
              Confirm Intent Lock
            </button>
          </div>
        </div>
      )}

      {/* Confirmed State */}
      {!isAnalyzing && intentRules.status === 'confirmed' && (
        <div className="confirmed-intent-card">
          <div className="confirmed-top">
            <div className="confirmed-icon-box">
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>
            <div>
              <h4 className="confirmed-title">Intent Lock Confirmed</h4>
              <p className="confirmed-sub">
                Version {intentRules.version} · Used for product verification and payment limits
              </p>
            </div>
          </div>

          <div className="confirmed-summary-grid">
            <div className="summary-pill">
              <span className="pill-k">Size</span>
              <span className="pill-v">{intentRules.size}</span>
            </div>
            <div className="summary-pill">
              <span className="pill-k">Budget</span>
              <span className="pill-v">≤ ₹{intentRules.maxBudget.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-pill">
              <span className="pill-k">Delivery</span>
              <span className="pill-v">≤ {intentRules.deliveryDaysLimit} days</span>
            </div>
            <div className="summary-pill">
              <span className="pill-k">Brand</span>
              <span className="pill-v">Nike</span>
            </div>
            <div className="summary-pill">
              <span className="pill-k">Subscription</span>
              <span className="pill-v">No</span>
            </div>
          </div>

          <div className="confirmed-footer-actions">
            <button
              type="button"
              className="btn-link"
              onClick={handleEdit}
            >
              <Edit3 size={13} />
              Modify requirements
            </button>

            <button
              type="button"
              className="btn-link text-slate-500"
              onClick={() => setShowUnresolvedSample(!showUnresolvedSample)}
            >
              {showUnresolvedSample ? 'Hide sample constraint' : 'View edge case demo'}
            </button>
          </div>

          {/* Optional Unresolved Requirement Example */}
          {showUnresolvedSample && (
            <div className="unresolved-alert-box">
              <div className="flex items-center gap-2 text-amber-700 font-medium text-xs">
                <AlertCircle size={14} />
                <span>Size is required before automatic payment.</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-xs mt-2"
                onClick={() => alert('Demo simulated: Size UK 8 selected.')}
              >
                Select Size
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
