import React, { useState } from 'react';
import type { ProductOffer } from '../types/choiceproof';
import {
  Lock,
  X,
  ShieldCheck,
} from './Icons';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductOffer;
  amount: number;
  onPaymentSuccess: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  product,
  amount,
  onPaymentSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('demo.shopper@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop">
      <div className="razorpay-sheet-card">
        {/* Razorpay Top Bar */}
        <div className="razorpay-sheet-header">
          <div className="razorpay-brand">
            <div className="razorpay-logo-symbol">R</div>
            <div className="razorpay-title-group">
              <span className="razorpay-brand-name">Razorpay</span>
              <span className="razorpay-badge-test">Test Mode</span>
            </div>
          </div>

          <button
            type="button"
            className="razorpay-close-btn"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close payment modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Merchant & Order Info Banner */}
        <div className="razorpay-order-banner">
          <div className="flex justify-between items-center mb-1">
            <span className="razorpay-merchant-name">{product.merchant}</span>
            <span className="razorpay-order-id font-mono text-xs">order_Q3xDemo123</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="razorpay-item-name">{product.name} (UK 8)</span>
            <span className="razorpay-item-amount font-bold">
              ₹{amount.toLocaleString('en-IN')}.00
            </span>
          </div>
        </div>

        {/* ChoiceProof Signed Guard Banner */}
        <div className="razorpay-guard-badge">
          <ShieldCheck size={14} className="text-indigo-600" />
          <span>Bound to ChoiceProof Permit cp_7f4...a91 (Cart Locked)</span>
        </div>

        {/* Processing State */}
        {isProcessing ? (
          <div className="razorpay-processing-state">
            <div className="spinner-indigo mb-3" />
            <h4 className="font-semibold text-slate-800 text-sm">
              Verifying payment signature…
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Confirming HMAC SHA256 against ChoiceProof cryptographic token
            </p>
          </div>
        ) : (
          <div className="razorpay-payment-body">
            {/* Payment Method Tabs */}
            <div className="razorpay-tabs">
              <button
                type="button"
                className={`razorpay-tab ${activeTab === 'upi' ? 'razorpay-tab-active' : ''}`}
                onClick={() => setActiveTab('upi')}
              >
                UPI / QR
              </button>
              <button
                type="button"
                className={`razorpay-tab ${activeTab === 'card' ? 'razorpay-tab-active' : ''}`}
                onClick={() => setActiveTab('card')}
              >
                Cards
              </button>
              <button
                type="button"
                className={`razorpay-tab ${activeTab === 'netbanking' ? 'razorpay-tab-active' : ''}`}
                onClick={() => setActiveTab('netbanking')}
              >
                Netbanking
              </button>
            </div>

            {/* UPI Tab View */}
            {activeTab === 'upi' && (
              <div className="razorpay-tab-content">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  className="form-input text-xs"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@okhdfcbank"
                />
                <div className="upi-apps-row mt-3 flex items-center gap-2">
                  <span className="upi-pill">Google Pay</span>
                  <span className="upi-pill">PhonePe</span>
                  <span className="upi-pill">Paytm</span>
                  <span className="upi-pill">CRED</span>
                </div>
              </div>
            )}

            {/* Card Tab View */}
            {activeTab === 'card' && (
              <div className="razorpay-tab-content space-y-2">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Card Number</label>
                  <input
                    type="text"
                    className="form-input text-xs font-mono"
                    defaultValue="4111 2222 3333 4444"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Expiry</label>
                    <input
                      type="text"
                      className="form-input text-xs font-mono"
                      defaultValue="12/28"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">CVV</label>
                    <input
                      type="password"
                      className="form-input text-xs font-mono"
                      defaultValue="123"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Netbanking Tab View */}
            {activeTab === 'netbanking' && (
              <div className="razorpay-tab-content">
                <span className="text-xs text-slate-600 mb-2 block">Popular Banks:</span>
                <div className="grid grid-cols-3 gap-1.5 text-xs text-center">
                  <div className="p-2 border border-slate-200 rounded hover:border-indigo-500 cursor-pointer bg-slate-50">
                    HDFC Bank
                  </div>
                  <div className="p-2 border border-slate-200 rounded hover:border-indigo-500 cursor-pointer bg-slate-50">
                    ICICI Bank
                  </div>
                  <div className="p-2 border border-slate-200 rounded hover:border-indigo-500 cursor-pointer bg-slate-50">
                    SBI
                  </div>
                </div>
              </div>
            )}

            {/* Action CTA */}
            <div className="razorpay-footer-cta mt-4">
              <button
                type="button"
                className="btn btn-razorpay w-full btn-lg font-semibold"
                onClick={handlePay}
              >
                Complete Test Payment (₹{amount.toLocaleString('en-IN')})
              </button>
              <div className="razorpay-security-note">
                <Lock size={12} />
                <span>Simulated Sandbox Environment · 256-bit TLS Encrypted</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
