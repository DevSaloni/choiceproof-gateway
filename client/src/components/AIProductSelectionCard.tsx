import React, { useEffect, useState } from 'react';
import type { ProductOffer, ScenarioId } from '../types/choiceproof';
import { AI_SELECTION_BY_SCENARIO, MOCK_PRODUCTS } from '../data/mockData';
import {
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
} from './Icons';

interface AIProductSelectionCardProps {
  currentScenario: ScenarioId;
  isIntentConfirmed: boolean;
  eligibleCount?: number;
  selectedProductOverride?: ProductOffer;
  reasonOverride?: string;
}

export const AIProductSelectionCard: React.FC<AIProductSelectionCardProps> = ({
  currentScenario,
  isIntentConfirmed,
  eligibleCount = 3,
  selectedProductOverride,
  reasonOverride,
}) => {
  const [isComparing, setIsComparing] = useState(true);
  const [showComparisonBasis, setShowComparisonBasis] = useState(false);

  useEffect(() => {
    if (!isIntentConfirmed) {
      setIsComparing(false);
      return;
    }
    setIsComparing(true);
    const timer = window.setTimeout(() => setIsComparing(false), 700);
    return () => window.clearTimeout(timer);
  }, [currentScenario, isIntentConfirmed]);

  const selection = AI_SELECTION_BY_SCENARIO[currentScenario];
  const product =
    selectedProductOverride ||
    MOCK_PRODUCTS.find((item) => item.id === selection.productId) ||
    MOCK_PRODUCTS[0];
  const brandLabel = product.brand === 'Other' ? 'Other brand' : product.brand;
  const reason = reasonOverride || selection.reason;

  return (
    <div className={`column-card step-card ${!isIntentConfirmed ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="step-card-header">
        <div className="step-badge">Step 3</div>
        <h3 className="step-title">AI Product Selection</h3>
      </div>
      <p className="step-subtitle">Selected from {eligibleCount} eligible offers</p>

      {isComparing ? (
        <div className="analyzing-state selection-loading-state">
          <div className="spinner-indigo" />
          <p className="analyzing-text">AI is comparing eligible offers…</p>
          <span className="analyzing-sub">Brand · Price · Delivery · Rating · Warranty</span>
        </div>
      ) : (
        <>
          <div className="ai-selected-product-card">
            <div className="ai-selected-product-top">
              <div className="ai-selected-icon">
                <ShoppingBag size={18} className="text-indigo-600" />
              </div>
              <div className="ai-selected-copy">
                <div className="ai-selected-label">
                  <Sparkles size={13} className="text-indigo-600" />
                  AI selection
                </div>
                <h4 className="ai-selected-name">{product.name}</h4>
                <p className="ai-selected-meta">
                  ₹{product.price.toLocaleString('en-IN')} · {brandLabel} · Delivery in {product.deliveryDays} days
                </p>
                <p className="ai-selected-sku">
                  SKU {product.sku} · Merchant {product.merchant}
                </p>
              </div>
            </div>

            {selection.boundCartNote ? (
              <div className="ai-selected-bound-note">
                <ShieldCheck size={15} className="text-emerald-600 flex-shrink-0" />
                <span>{selection.boundCartNote}</span>
              </div>
            ) : (
              <p className="ai-selected-reason">{reason}</p>
            )}

            {selection.verifyWarning && (
              <div className="ai-selected-verify-warning">
                <AlertTriangle size={14} className="flex-shrink-0" />
                <span>{selection.verifyWarning}</span>
              </div>
            )}
          </div>

          <div className="comparison-basis-section">
            <button
              type="button"
              className="merchant-content-toggle"
              onClick={() => setShowComparisonBasis((open) => !open)}
            >
              <span>Comparison basis</span>
              {showComparisonBasis ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showComparisonBasis && (
              <div className="comparison-basis-body">
                <ul className="comparison-basis-list">
                  <li>Price</li>
                  <li>Delivery</li>
                  <li>Brand preference</li>
                  <li>Rating</li>
                  <li>Warranty</li>
                </ul>
                <p className="comparison-basis-note">
                  Hard requirements decide eligibility. Preferences help compare eligible offers.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
