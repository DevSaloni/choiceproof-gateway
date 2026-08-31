import React, { useState, useEffect } from 'react';
import type {
  ScenarioId,
  ChoiceProofStatus,
  ProductOffer,
} from '../types/choiceproof';
import {
  MOCK_PRODUCTS,
} from '../data/mockData';
import { Tooltip } from './Tooltip';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  CreditCard,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Info,
} from './Icons';

interface ChoiceProofDecisionColumnProps {
  currentScenario: ScenarioId;
  selectedProductId: string;
  isIntentConfirmed: boolean;
  decisionStatus: ChoiceProofStatus;
  onSetDecisionStatus: (status: ChoiceProofStatus) => void;
  onSelectProduct: (productId: string) => void;
  isPermitIssued: boolean;
  onIssuePermit: () => void;
  onOpenRazorpayModal: (amount: number, product: ProductOffer) => void;
  onTriggerScenario3Mutation: () => void;
  isScenario3Mutated: boolean;
  onResetSession: () => void;
}

export const ChoiceProofDecisionColumn: React.FC<ChoiceProofDecisionColumnProps> = ({
  currentScenario,
  selectedProductId,
  isIntentConfirmed,
  decisionStatus,
  onSetDecisionStatus,
  onSelectProduct,
  isPermitIssued,
  onIssuePermit,
  onOpenRazorpayModal,
  onTriggerScenario3Mutation,
  isScenario3Mutated,
  onResetSession,
}) => {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(298); // 04:58

  // Live countdown for payment permit
  useEffect(() => {
    if (!isPermitIssued) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPermitIssued]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const selectedProduct =
    MOCK_PRODUCTS.find((p) => p.id === selectedProductId) || MOCK_PRODUCTS[0];

  const handleChooseRecommended = () => {
    onSelectProduct('prod_nike_runner');
    onSetDecisionStatus('APPROVED');
  };

  const handleConfirmOverride = () => {
    setShowOverrideModal(false);
    onSetDecisionStatus('APPROVED_WITH_USER_OVERRIDE');
  };

  return (
    <div className={`column-card step-card-decision ${!isIntentConfirmed ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Header */}
      <div className="step-card-header">
        <div className="step-badge step-badge-highlight">Step 4</div>
        <h3 className="step-title">ChoiceProof Decision</h3>
      </div>
      <p className="step-subtitle">
        Automated multi-layer audit before financial authorization is granted.
      </p>

      {/* =========================================================
          SCENARIO 1: APPROVED STATE
          ========================================================= */}
      {currentScenario === 'scenario_1' && (
        <div className="decision-box decision-box-approved">
          <div className="decision-header-row">
            <div className="status-badge-lg badge-approved">
              <CheckCircle2 size={20} />
              <span>APPROVED</span>
            </div>
            <span className="pill-badge pill-emerald text-xs">Pre-Auth Verified</span>
          </div>

          <h4 className="decision-product-title">
            Nike Runner matches the confirmed shopping requirements.
          </h4>

          {/* Audit Verification Checklist */}
          <div className="decision-checklist">
            <div className="checklist-item">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>Product exists in verified offer set</span>
            </div>
            <div className="checklist-item">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>₹4,499 is within ₹5,000 budget</span>
            </div>
            <div className="checklist-item">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>Delivery in 2 days is within 4 days</span>
            </div>
            <div className="checklist-item">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>No subscription detected</span>
            </div>
            <div className="checklist-item">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>Nike preference matched</span>
            </div>
            <div className="checklist-item">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>No clearly better observed offer</span>
            </div>
            <div className="checklist-item">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>Selection is stable</span>
            </div>
          </div>

          {!isPermitIssued && (
            <button
              type="button"
              className="btn btn-emerald btn-lg w-full mt-4 btn-glow"
              onClick={onIssuePermit}
            >
              <ShieldCheck size={18} />
              Issue Payment Permit
            </button>
          )}
        </div>
      )}

      {/* =========================================================
          SCENARIO 2: REVIEW REQUIRED STATE
          ========================================================= */}
      {currentScenario === 'scenario_2' && decisionStatus === 'REVIEW_REQUIRED' && (
        <div className="decision-box decision-box-review">
          <div className="decision-header-row">
            <div className="status-badge-lg badge-review">
              <AlertTriangle size={20} />
              <span>REVIEW REQUIRED</span>
            </div>
            <span className="pill-badge pill-amber text-xs">Review Signal</span>
          </div>

          <h4 className="decision-product-title">
            Premium X passes the hard rules, but the choice needs user review.
          </h4>

          <div className="review-reasons-list">
            <div className="review-reason-item">
              <span className="bullet-amber">●</span>
              <span>Nike Runner is ₹400 cheaper</span>
            </div>
            <div className="review-reason-item">
              <span className="bullet-amber">●</span>
              <span>Nike Runner arrives 2 days sooner</span>
            </div>
            <div className="review-reason-item">
              <span className="bullet-amber">●</span>
              <span>Nike Runner matches the preferred Nike brand</span>
            </div>
            <div className="review-reason-item">
              <span className="bullet-amber">●</span>
              <span>Selection changed after merchant content was removed</span>
            </div>
          </div>

          {/* Recommended Alternative Card */}
          <div className="recommended-alt-card">
            <div className="recommended-badge">
              <Sparkles size={13} className="text-indigo-600" />
              <span>Recommended Alternative</span>
            </div>
            <div className="recommended-main">
              <div>
                <h5 className="recommended-name">Nike Runner</h5>
                <p className="recommended-desc">
                  Save ₹400 · Arrives 2 days sooner · Nike preferred
                </p>
              </div>
              <div className="recommended-price">₹4,499</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="review-actions-group">
            <button
              type="button"
              className="btn btn-primary btn-sm w-full btn-glow"
              onClick={handleChooseRecommended}
            >
              <CheckCircle2 size={16} />
              Choose Nike Runner
            </button>

            <button
              type="button"
              className="btn btn-outline-amber btn-sm w-full"
              onClick={() => setShowOverrideModal(true)}
            >
              Continue with Premium X
            </button>

            <button
              type="button"
              className="btn-ghost-sm w-full text-center"
              onClick={onResetSession}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scenario 2: After user chooses recommended Nike Runner */}
      {currentScenario === 'scenario_2' &&
        decisionStatus === 'APPROVED' &&
        selectedProductId === 'prod_nike_runner' && (
          <div className="decision-box decision-box-approved">
            <div className="decision-header-row">
              <div className="status-badge-lg badge-approved">
                <CheckCircle2 size={20} />
                <span>APPROVED</span>
              </div>
              <span className="pill-badge pill-emerald text-xs">Alternative Selected</span>
            </div>

            <h4 className="decision-product-title">
              Nike Runner approved.
            </h4>
            <div className="audit-note-box bg-emerald-50 text-emerald-800 border-emerald-200">
              <CheckCircle2 size={15} />
              <span>User selected recommended alternative over initial agent nomination.</span>
            </div>

            {!isPermitIssued && (
              <button
                type="button"
                className="btn btn-emerald btn-lg w-full mt-4 btn-glow"
                onClick={onIssuePermit}
              >
                <ShieldCheck size={18} />
                Issue Payment Permit
              </button>
            )}
          </div>
        )}

      {/* Scenario 2: After user confirms override on Premium X */}
      {currentScenario === 'scenario_2' && decisionStatus === 'APPROVED_WITH_USER_OVERRIDE' && (
        <div className="decision-box decision-box-override">
          <div className="decision-header-row">
            <div className="status-badge-lg badge-override">
              <AlertTriangle size={18} />
              <span>APPROVED WITH USER OVERRIDE</span>
            </div>
          </div>

          <h4 className="decision-product-title">
            Premium X authorized via manual shopper override.
          </h4>

          <div className="audit-note-box bg-amber-50 text-amber-900 border-amber-200">
            <Info size={15} />
            <span>
              <strong>Audit Note:</strong> User explicitly approved Premium X after review.
            </span>
          </div>

          {!isPermitIssued && (
            <button
              type="button"
              className="btn btn-primary btn-lg w-full mt-4"
              onClick={onIssuePermit}
            >
              <ShieldCheck size={18} />
              Issue Exact Payment Permit (₹4,899)
            </button>
          )}
        </div>
      )}

      {/* =========================================================
          SCENARIO 3: MUTATED PAYMENT ATTACK STATE
          ========================================================= */}
      {currentScenario === 'scenario_3' && (
        <div className="scenario-3-container">
          {!isScenario3Mutated ? (
            <div className="decision-box decision-box-approved">
              <div className="decision-header-row">
                <div className="status-badge-lg badge-approved">
                  <CheckCircle2 size={18} />
                  <span>PREVIOUSLY APPROVED CART</span>
                </div>
                <span className="pill-badge pill-emerald text-xs">Locked v1</span>
              </div>

              <p className="text-xs text-slate-600 mb-3">
                Nike Runner was previously approved by ChoiceProof for payment.
              </p>

              <div className="approved-cart-summary">
                <div className="cart-summary-row">
                  <span className="text-slate-500">Approved SKU:</span>
                  <span className="font-mono font-medium">NIKE-RUN-01</span>
                </div>
                <div className="cart-summary-row">
                  <span className="text-slate-500">Merchant:</span>
                  <span className="font-medium">DemoSports</span>
                </div>
                <div className="cart-summary-row">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-bold text-slate-800">₹4,499</span>
                </div>
              </div>

              {/* Simulated Attack Mutation Trigger Box */}
              <div className="simulated-attack-card">
                <div className="attack-header">
                  <ShieldAlert size={16} className="text-red-600" />
                  <span className="attack-title">Demo: Changed Cart Attempt</span>
                </div>
                <p className="attack-sub">
                  Simulate an autonomous agent or rogue script attempting to modify the checkout payload at runtime.
                </p>

                <div className="attack-fields">
                  <div className="attack-field-row">
                    <span className="attack-k">Attempted SKU:</span>
                    <span className="attack-v font-mono text-red-600">PREMIUM-X-01</span>
                  </div>
                  <div className="attack-field-row">
                    <span className="attack-k">Attempted merchant:</span>
                    <span className="attack-v">DemoSports</span>
                  </div>
                  <div className="attack-field-row">
                    <span className="attack-k">Attempted amount:</span>
                    <span className="attack-v font-mono font-bold text-red-600">₹6,499</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-danger btn-sm w-full mt-3"
                  onClick={onTriggerScenario3Mutation}
                >
                  <ShieldAlert size={15} />
                  Submit Changed Cart
                </button>
              </div>
            </div>
          ) : (
            /* BLOCKED RESULT */
            <div className="decision-box decision-box-blocked">
              <div className="decision-header-row">
                <div className="status-badge-lg badge-blocked">
                  <XCircle size={20} />
                  <span>PAYMENT BLOCKED</span>
                </div>
                <span className="pill-badge pill-red text-xs">Integrity Breach</span>
              </div>

              <h4 className="decision-product-title text-red-900">
                The attempted payment does not match the exact cart approved by ChoiceProof.
              </h4>

              {/* Comparison Diff Table */}
              <div className="cart-diff-table">
                <div className="diff-col diff-approved">
                  <div className="diff-col-title">Approved Cart</div>
                  <div className="diff-field">
                    <span className="diff-k">SKU:</span>
                    <span className="diff-v font-mono">NIKE-RUN-01</span>
                  </div>
                  <div className="diff-field">
                    <span className="diff-k">Amount:</span>
                    <span className="diff-v font-bold">₹4,499</span>
                  </div>
                </div>

                <div className="diff-col diff-attempted">
                  <div className="diff-col-title text-red-700">Attempted Cart</div>
                  <div className="diff-field">
                    <span className="diff-k">SKU:</span>
                    <span className="diff-v font-mono text-red-600">PREMIUM-X-01 ⚠️</span>
                  </div>
                  <div className="diff-field">
                    <span className="diff-k">Amount:</span>
                    <span className="diff-v font-bold text-red-600">₹6,499 ⚠️</span>
                  </div>
                </div>
              </div>

              {/* Prominent Statement */}
              <div className="razorpay-blocked-statement">
                <span className="razorpay-no-badge">Razorpay Order Created: NO</span>
              </div>

              <div className="audit-note-box bg-red-50 text-red-900 border-red-200">
                <ShieldAlert size={16} className="text-red-600 flex-shrink-0" />
                <span>
                  Payment Guardian blocked the request before Razorpay order creation.
                </span>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm w-full mt-4"
                onClick={onResetSession}
              >
                <RefreshCw size={14} />
                Start New Session
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          STEP 4: PAYMENT GUARDIAN CARD (Appears after approval)
          ========================================================= */}
      {isPermitIssued && currentScenario !== 'scenario_3' && (
        <div className="step-4-guardian-card">
          <div className="guardian-card-top">
            <div className="flex items-center gap-2">
              <div className="guardian-icon-box">
                <CreditCard size={18} className="text-indigo-600" />
              </div>
              <div>
                <div className="step-badge step-badge-indigo">Step 5</div>
                <h4 className="guardian-card-title">Payment Guardian</h4>
              </div>
            </div>
            <span className="pill-badge pill-emerald text-xs">
              <CheckCircle2 size={12} />
              Execution Permit Issued
            </span>
          </div>

          <div className="guardian-product-summary">
            <div className="guardian-product-name">{selectedProduct.name}</div>
            <div className="guardian-product-price">
              ₹{selectedProduct.price.toLocaleString('en-IN')} INR
            </div>
          </div>

          {/* Bound Payload Fields */}
          <div className="guardian-fields-grid">
            <div className="guardian-field-item">
              <span className="g-field-k">SKU</span>
              <span className="g-field-v font-mono">{selectedProduct.sku}</span>
            </div>
            <div className="guardian-field-item">
              <span className="g-field-k">Merchant</span>
              <span className="g-field-v">{selectedProduct.merchant}</span>
            </div>
            <div className="guardian-field-item">
              <span className="g-field-k">Quantity</span>
              <span className="g-field-v">1</span>
            </div>
            <div className="guardian-field-item">
              <span className="g-field-k">Maximum payment</span>
              <span className="g-field-v font-semibold text-emerald-700">
                ₹{selectedProduct.price.toLocaleString('en-IN')} INR
              </span>
            </div>
            <div className="guardian-field-item">
              <span className="g-field-k">Single use</span>
              <span className="g-field-v text-indigo-700 font-medium">Yes</span>
            </div>
            <div className="guardian-field-item">
              <span className="g-field-k">Cart locked</span>
              <span className="g-field-v text-indigo-700 font-medium">Yes</span>
            </div>
            <div className="guardian-field-item col-span-2 bg-indigo-50/50 p-2 rounded-lg flex items-center justify-between">
              <span className="g-field-k flex items-center gap-1">
                <Clock size={13} className="text-indigo-600" />
                Expires in
              </span>
              <span className="g-field-v font-mono font-bold text-indigo-700">
                {formatCountdown(countdownSeconds)}
              </span>
            </div>
          </div>

          {/* Technical Cryptographic Details (Expandable) */}
          <div className="guardian-tech-details">
            <button
              type="button"
              className="tech-details-toggle"
              onClick={() => setShowTechDetails(!showTechDetails)}
            >
              <span>Technical cryptographic binding</span>
              {showTechDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showTechDetails && (
              <div className="tech-details-body font-mono text-xs">
                <div className="tech-row">
                  <span className="text-slate-500">Permit ID:</span>
                  <Tooltip content="Unique cryptographically signed execution authorization nonce">
                    <span className="text-indigo-700">cp_7f4a91b22e11...</span>
                  </Tooltip>
                </div>
                <div className="tech-row">
                  <span className="text-slate-500">Cart hash:</span>
                  <span className="text-slate-700">
                    {selectedProduct.id === 'prod_nike_runner' ? '5e9c...d2a' : '8b4c...401'}
                  </span>
                </div>
                <div className="tech-row">
                  <span className="text-slate-500">Offer set hash:</span>
                  <span className="text-slate-700">4ab1...9e2</span>
                </div>
                <div className="tech-row">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-700 font-bold">ISSUED</span>
                </div>
              </div>
            )}
          </div>

          {/* Razorpay Launch Button */}
          <button
            type="button"
            className="btn btn-primary btn-lg w-full mt-3 btn-glow"
            onClick={() => onOpenRazorpayModal(selectedProduct.price, selectedProduct)}
          >
            <CreditCard size={18} />
            Pay ₹{selectedProduct.price.toLocaleString('en-IN')} with Razorpay
          </button>
        </div>
      )}

      {/* =========================================================
          SCENARIO 2 OVERRIDE CONFIRMATION MODAL
          ========================================================= */}
      {showOverrideModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-icon-box bg-amber-100 text-amber-700">
                <AlertTriangle size={22} />
              </div>
              <h3 className="modal-title">Continue with reviewed choice?</h3>
            </div>

            <p className="modal-body-text">
              You are approving <strong>Premium X</strong> for <strong>₹4,899</strong> despite known review signals.
            </p>

            <div className="modal-signals-list">
              <div className="modal-signal-item">
                <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
                <span>A better matching observed product exists</span>
              </div>
              <div className="modal-signal-item">
                <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
                <span>The AI selection was unstable</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowOverrideModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-amber btn-sm"
                onClick={handleConfirmOverride}
              >
                Approve This Exact Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
