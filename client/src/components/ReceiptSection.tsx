import React from 'react';
import type {
  ChoiceProofStatus,
  ScenarioId,
} from '../types/choiceproof';
import {
  MOCK_PRODUCTS,
  OFFER_SET_HASH,
  NIKE_CART_HASH,
  PREMIUM_X_CART_HASH,
  MUTATED_CART_HASH,
} from '../data/mockData';
import { Tooltip } from './Tooltip';
import {
  CheckCircle2,
  Download,
  ShieldAlert,
  Clock,
} from './Icons';

interface ReceiptSectionProps {
  currentScenario: ScenarioId;
  decisionStatus: ChoiceProofStatus;
  selectedProductId: string;
  isScenario3Mutated: boolean;
  paymentComplete: boolean;
  receiptHash?: string;
  receiptSignature?: string;
  permitId?: string;
  orderId?: string;
  auditEvents?: { at: string; event: string; actor: string }[];
}

export const ReceiptSection: React.FC<ReceiptSectionProps> = ({
  currentScenario,
  decisionStatus,
  selectedProductId,
  isScenario3Mutated,
  paymentComplete,
  receiptHash,
  receiptSignature,
  permitId,
  orderId,
  auditEvents,
}) => {
  // Only render if payment is complete OR if scenario 3 is in blocked state
  const isBlockedReceipt = currentScenario === 'scenario_3' && isScenario3Mutated;
  if (!paymentComplete && !isBlockedReceipt) return null;

  const selectedProduct =
    MOCK_PRODUCTS.find((p) => p.id === selectedProductId) || MOCK_PRODUCTS[0];

  const receiptData = {
    receiptId: isBlockedReceipt ? 'rec_block_99182a' : 'rec_7c91e8f001b2',
    timestamp: new Date().toISOString(),
    status: isBlockedReceipt ? 'Payment Blocked' : 'Payment Verified',
    intentLock: {
      category: 'Running shoes',
      size: 'UK 8',
      budget: '≤ ₹5,000',
      delivery: '≤ 4 days',
      subscription: 'Not allowed',
      brandPreference: 'Nike preferred',
    },
    aiSelection: {
      productName: isBlockedReceipt ? 'Premium X (Mutated)' : selectedProduct.name,
      sku: isBlockedReceipt ? 'PREMIUM-X-01' : selectedProduct.sku,
      merchant: selectedProduct.merchant,
      amount: isBlockedReceipt ? 6499 : selectedProduct.price,
    },
    choiceProofDecision: {
      status: isBlockedReceipt ? 'PAYMENT_BLOCKED' : decisionStatus,
      summary: isBlockedReceipt
        ? 'Payment Guardian blocked mutated cart before Razorpay order creation.'
        : decisionStatus === 'APPROVED_WITH_USER_OVERRIDE'
        ? 'User explicitly approved Premium X after review.'
        : 'Nike Runner matches the confirmed shopping requirements.',
      hardRequirementsPassed: true,
      stabilityVerified: !isBlockedReceipt && decisionStatus !== 'APPROVED_WITH_USER_OVERRIDE',
    },
    paymentGuardian: {
      permitId: isBlockedReceipt ? 'NONE (DENIED)' : permitId || 'cp_7f4a91b22e11',
      singleUse: true,
      cartLocked: true,
      expiry: '5 minutes',
    },
    razorpay: {
      orderCreated: !isBlockedReceipt,
      orderId: isBlockedReceipt ? 'NONE' : orderId || 'order_Q3xDemo123',
      paymentId: isBlockedReceipt ? 'NONE' : 'pay_Q3xDemo456',
      paymentSignature: isBlockedReceipt ? 'N/A' : 'Verified (HMAC-SHA256)',
      mode: 'Test Mode',
    },
    integrity: {
      offerSetHash: OFFER_SET_HASH,
      cartHash: isBlockedReceipt
        ? MUTATED_CART_HASH
        : selectedProduct.id === 'prod_nike_runner'
        ? NIKE_CART_HASH
        : PREMIUM_X_CART_HASH,
      receiptHash: receiptHash || (isBlockedReceipt
        ? 'sha256:bb9104fa281c900e'
        : 'sha256:7c91e8f23901b22a'),
      receiptSignature: receiptSignature || 'Valid (HMAC-SHA256)',
    },
  };

  const handleDownloadJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(receiptData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `choiceproof-receipt-${receiptData.receiptId}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <section className="receipt-container" id="receipt-section">
      <div className="receipt-card">
        {/* Receipt Header */}
        <div className="receipt-header-row">
          <div className="receipt-brand-left">
            <div className="flex items-center gap-2">
              <div
                className={`receipt-status-icon ${
                  isBlockedReceipt ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {isBlockedReceipt ? <ShieldAlert size={22} /> : <CheckCircle2 size={22} />}
              </div>
              <div>
                <h3 className="receipt-title">
                  {isBlockedReceipt ? 'ChoiceProof Decision Receipt' : 'ChoiceProof Receipt'}
                </h3>
                <div className="receipt-status-pill">
                  {isBlockedReceipt ? (
                    <span className="text-red-700 font-bold text-xs">
                      Payment blocked — no Razorpay order created
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Payment Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="receipt-actions-right">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleDownloadJSON}
            >
              <Download size={14} />
              Download JSON
            </button>
          </div>
        </div>

        {/* 6 Numbered Sections Grid */}
        <div className="receipt-sections-grid">
          {/* 1. User Intent Lock */}
          <div className="receipt-section-box">
            <div className="receipt-section-num">1</div>
            <div className="receipt-section-content">
              <h5 className="r-sec-title">User Intent Lock</h5>
              <div className="r-sec-body">
                <div className="r-sec-row">
                  <span className="r-k">Target:</span>
                  <span className="r-v font-medium">Nike running shoes, UK 8</span>
                </div>
                <div className="r-sec-row">
                  <span className="r-k">Budget:</span>
                  <span className="r-v">≤ ₹5,000</span>
                </div>
                <div className="r-sec-row">
                  <span className="r-k">Delivery:</span>
                  <span className="r-v">≤ 4 days</span>
                </div>
                <div className="r-sec-row">
                  <span className="r-k">Subscription:</span>
                  <span className="r-v">No subscription</span>
                </div>
                <div className="r-sec-row">
                  <span className="r-k">Brand:</span>
                  <span className="r-v">Nike preferred</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. AI Selection */}
          <div className="receipt-section-box">
            <div className="receipt-section-num">2</div>
            <div className="receipt-section-content">
              <h5 className="r-sec-title">AI Selection</h5>
              <div className="r-sec-body">
                <div className="r-sec-row">
                  <span className="r-k">Product:</span>
                  <span className="r-v font-semibold">
                    {isBlockedReceipt ? 'Premium X (Mutated)' : selectedProduct.name}
                  </span>
                </div>
                <div className="r-sec-row">
                  <span className="r-k">SKU:</span>
                  <span className="r-v font-mono text-xs">
                    {isBlockedReceipt ? 'PREMIUM-X-01' : selectedProduct.sku}
                  </span>
                </div>
                <div className="r-sec-row">
                  <span className="r-k">Merchant:</span>
                  <span className="r-v">{selectedProduct.merchant}</span>
                </div>
                <div className="r-sec-row">
                  <span className="r-k">Amount:</span>
                  <span className="r-v font-bold">
                    ₹{(isBlockedReceipt ? 6499 : selectedProduct.price).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ChoiceProof Result */}
          <div className="receipt-section-box">
            <div className="receipt-section-num">3</div>
            <div className="receipt-section-content">
              <h5 className="r-sec-title">ChoiceProof Result</h5>
              <div className="r-sec-body">
                {isBlockedReceipt ? (
                  <div>
                    <span className="pill-badge pill-red font-bold">PAYMENT BLOCKED</span>
                    <p className="text-xs text-red-700 mt-1.5">
                      Attempted checkout SKU/amount does not match locked permit.
                    </p>
                  </div>
                ) : decisionStatus === 'APPROVED_WITH_USER_OVERRIDE' ? (
                  <div>
                    <span className="pill-badge pill-amber font-bold">
                      APPROVED WITH USER OVERRIDE
                    </span>
                    <p className="text-xs text-amber-900 mt-1.5 font-medium">
                      “User explicitly continued with Premium X after review.”
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="pill-badge pill-emerald font-bold">APPROVED</span>
                    <div className="text-xs text-slate-600 mt-1.5 space-y-0.5">
                      <div>✓ All hard requirements passed</div>
                      <div>✓ No clearly better observed offer</div>
                      <div>✓ Selection stable</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Payment Guardian */}
          <div className="receipt-section-box">
            <div className="receipt-section-num">4</div>
            <div className="receipt-section-content">
              <h5 className="r-sec-title">Payment Guardian</h5>
              <div className="r-sec-body">
                <div className="r-sec-row">
                  <span className="r-k">Permit:</span>
                  <span className="r-v font-mono text-xs text-indigo-700">
                    {isBlockedReceipt ? 'NONE (DENIED)' : (permitId ? `${permitId.slice(0, 14)}…` : 'cp_7f4...a91')}
                  </span>
                </div>
                <div className="r-sec-row">
                  <span className="r-k">Single use:</span>
                  <span className="r-v">Yes</span>
                </div>
                <div className="r-sec-row">
                  <span className="r-k">Cart locked:</span>
                  <span className="r-v">Yes</span>
                </div>
                <div className="r-sec-row">
                  <span className="r-k">Expiry:</span>
                  <span className="r-v">5 minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Razorpay */}
          <div className="receipt-section-box">
            <div className="receipt-section-num">5</div>
            <div className="receipt-section-content">
              <h5 className="r-sec-title">Razorpay</h5>
              <div className="r-sec-body">
                {isBlockedReceipt ? (
                  <div>
                    <div className="r-sec-row">
                      <span className="r-k">Order Created:</span>
                      <span className="r-v text-red-600 font-bold">NO</span>
                    </div>
                    <div className="r-sec-row">
                      <span className="r-k">Execution:</span>
                      <span className="r-v text-slate-500">Halted before API call</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="r-sec-row">
                      <span className="r-k">Order ID:</span>
                      <span className="r-v font-mono text-xs">{receiptData.razorpay.orderId}</span>
                    </div>
                    <div className="r-sec-row">
                      <span className="r-k">Payment ID:</span>
                      <span className="r-v font-mono text-xs">pay_Q3xDemo456</span>
                    </div>
                    <div className="r-sec-row">
                      <span className="r-k">Payment signature:</span>
                      <span className="r-v text-emerald-700 font-medium">Verified</span>
                    </div>
                    <div className="r-sec-row">
                      <span className="r-k">Mode:</span>
                      <span className="r-v">Test Mode</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 6. Integrity */}
          <div className="receipt-section-box">
            <div className="receipt-section-num">6</div>
            <div className="receipt-section-content">
              <h5 className="r-sec-title">Integrity (Cryptographic Proof)</h5>
              <div className="r-sec-body font-mono text-xs space-y-1">
                <div className="r-sec-row">
                  <span className="r-k text-slate-500">Offer set hash:</span>
                  <Tooltip content="Computed server-side across all observed products in this query">
                    <span className="r-v text-slate-700">sha256:4ab1...9e2</span>
                  </Tooltip>
                </div>
                <div className="r-sec-row">
                  <span className="r-k text-slate-500">Cart hash:</span>
                  <Tooltip content="Deterministic SHA-256 digest of SKU + Merchant + Max Amount">
                    <span className="r-v text-slate-700">sha256:5e9c...d2a</span>
                  </Tooltip>
                </div>
                <div className="r-sec-row">
                  <span className="r-k text-slate-500">Receipt hash:</span>
                  <span className="r-v text-slate-700">{receiptData.integrity.receiptHash.slice(0, 22)}…</span>
                </div>
                <div className="r-sec-row">
                  <span className="r-k text-slate-500">Receipt signature:</span>
                  <span className="r-v text-emerald-700 font-semibold">Valid</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="receipt-timeline-card">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-indigo-600" />
            <h5 className="font-semibold text-slate-800 text-sm">Audit Timeline</h5>
          </div>

          <div className="timeline-items-list">
            {auditEvents && auditEvents.length > 0 ? (
              auditEvents.map((event) => (
                <div className="timeline-item" key={`${event.at}-${event.event}`}>
                  <span className="t-time">
                    {new Date(event.at).toLocaleTimeString('en-IN', { hour12: false })}
                  </span>
                  <span className={`t-dot ${/BLOCK|MUTATION/.test(event.event) ? 'dot-red' : ''}`}></span>
                  <span className="t-desc">
                    {event.actor}: {event.event.replace(/_/g, ' ')}
                  </span>
                </div>
              ))
            ) : (
              <>
            <div className="timeline-item">
              <span className="t-time">11:00:01</span>
              <span className="t-dot"></span>
              <span className="t-desc">User entered shopping request</span>
            </div>
            <div className="timeline-item">
              <span className="t-time">11:00:03</span>
              <span className="t-dot"></span>
              <span className="t-desc">Intent Lock confirmed</span>
            </div>
            <div className="timeline-item">
              <span className="t-time">11:00:04</span>
              <span className="t-dot"></span>
              <span className="t-desc">
                {isBlockedReceipt
                  ? 'AI nominated initial Nike Runner'
                  : `AI selected ${selectedProduct.name}`}
              </span>
            </div>
            <div className="timeline-item">
              <span className="t-time">11:00:04</span>
              <span className="t-dot"></span>
              <span className="t-desc">
                {decisionStatus === 'APPROVED_WITH_USER_OVERRIDE'
                  ? 'ChoiceProof flagged review → User confirmed manual override'
                  : 'ChoiceProof approved selection'}
              </span>
            </div>
            <div className="timeline-item">
              <span className="t-time">11:00:05</span>
              <span className="t-dot"></span>
              <span className="t-desc">
                {isBlockedReceipt
                  ? 'Payment permit issued for NIKE-RUN-01'
                  : 'Payment permit issued'}
              </span>
            </div>

            {isBlockedReceipt ? (
              <>
                <div className="timeline-item">
                  <span className="t-time">11:00:06</span>
                  <span className="t-dot dot-red"></span>
                  <span className="t-desc text-red-600 font-semibold">
                    Agent attempted payment mutation to PREMIUM-X-01 (₹6,499)
                  </span>
                </div>
                <div className="timeline-item">
                  <span className="t-time">11:00:06</span>
                  <span className="t-dot dot-red"></span>
                  <span className="t-desc text-red-700 font-bold">
                    Payment Guardian blocked mutated cart before order creation.
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="timeline-item">
                  <span className="t-time">11:00:07</span>
                  <span className="t-dot dot-emerald"></span>
                  <span className="t-desc">Razorpay order created</span>
                </div>
                <div className="timeline-item">
                  <span className="t-time">11:00:15</span>
                  <span className="t-dot dot-emerald"></span>
                  <span className="t-desc">Payment signature verified</span>
                </div>
                <div className="timeline-item">
                  <span className="t-time">11:00:15</span>
                  <span className="t-dot dot-emerald"></span>
                  <span className="t-desc">Receipt generated</span>
                </div>
              </>
            )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
