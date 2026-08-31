import { useState } from 'react';
import type {
  ScenarioId,
  IntentLockRules,
  ChoiceProofStatus,
  ProductOffer,
} from './types/choiceproof';
import {
  INITIAL_INTENT_RULES,
  MOCK_PRODUCTS,
} from './data/mockData';
import { LandingPage } from './components/LandingPage';
import { DashboardHeader } from './components/DashboardHeader';
import { ScenarioSelector } from './components/ScenarioSelector';
import { IntentLockColumn } from './components/IntentLockColumn';
import { VerifiedOffersColumn } from './components/VerifiedOffersColumn';
import { AIProductSelectionCard } from './components/AIProductSelectionCard';
import { SelectionStabilityCard } from './components/SelectionStabilityCard';
import { ChoiceProofDecisionColumn } from './components/ChoiceProofDecisionColumn';
import { RazorpayModal } from './components/RazorpayModal';
import { ReceiptSection } from './components/ReceiptSection';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';

export function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard'>('landing');
  const [currentScenario, setCurrentScenario] = useState<ScenarioId>('scenario_1');
  const [intentRules, setIntentRules] = useState<IntentLockRules>(INITIAL_INTENT_RULES);
  const [selectedProductId, setSelectedProductId] = useState<string>('prod_nike_runner');
  const [decisionStatus, setDecisionStatus] = useState<ChoiceProofStatus>('APPROVED');
  const [isPermitIssued, setIsPermitIssued] = useState<boolean>(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(4499);
  const [paymentProduct, setPaymentProduct] = useState<ProductOffer>(MOCK_PRODUCTS[0]);
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false);
  const [isScenario3Mutated, setIsScenario3Mutated] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'warning' | 'info' | 'error', message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Switch Scenario handler
  const handleSelectScenario = (scenarioId: ScenarioId) => {
    setCurrentScenario(scenarioId);
    setIsPermitIssued(false);
    setPaymentComplete(false);
    setIsScenario3Mutated(false);

    if (scenarioId === 'scenario_1') {
      setSelectedProductId('prod_nike_runner');
      setDecisionStatus('APPROVED');
      addToast('info', 'Loaded Scenario 1: Clean Approval fixture');
    } else if (scenarioId === 'scenario_2') {
      setSelectedProductId('prod_premium_x');
      setDecisionStatus('REVIEW_REQUIRED');
      addToast('warning', 'Loaded Scenario 2: Questionable Choice review fixture');
    } else if (scenarioId === 'scenario_3') {
      setSelectedProductId('prod_nike_runner');
      setDecisionStatus('APPROVED');
      addToast('info', 'Loaded Scenario 3: Mutated Payment fixture');
    }
  };

  // Reset Session
  const handleResetSession = () => {
    setIntentRules(INITIAL_INTENT_RULES);
    setCurrentScenario('scenario_1');
    setSelectedProductId('prod_nike_runner');
    setDecisionStatus('APPROVED');
    setIsPermitIssued(false);
    setIsRazorpayModalOpen(false);
    setPaymentComplete(false);
    setIsScenario3Mutated(false);
    addToast('info', 'Session reset to clean initial state');
  };

  // Confirm Intent Lock
  const handleConfirmIntentLock = () => {
    setIntentRules({
      ...intentRules,
      status: 'confirmed',
    });
    addToast('success', 'Intent Lock v1 confirmed and signed');
  };

  // Issue Payment Permit
  const handleIssuePermit = () => {
    setIsPermitIssued(true);
    addToast('success', 'Cryptographic Payment Permit cp_7f4...a91 issued');
  };

  // Open Razorpay Modal
  const handleOpenRazorpayModal = (amount: number, product: ProductOffer) => {
    setPaymentAmount(amount);
    setPaymentProduct(product);
    setIsRazorpayModalOpen(true);
  };

  // Handle Payment Complete
  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    addToast('success', 'Razorpay test payment verified successfully!');
    setTimeout(() => {
      const receiptEl = document.getElementById('receipt-section');
      if (receiptEl) {
        receiptEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  // Trigger Scenario 3 Attack
  const handleTriggerScenario3Mutation = () => {
    setIsScenario3Mutated(true);
    setDecisionStatus('PAYMENT_BLOCKED');
    addToast('error', 'Payment Guardian blocked mutated cart payload!');
    setTimeout(() => {
      const receiptEl = document.getElementById('receipt-section');
      if (receiptEl) {
        receiptEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  const isIntentConfirmed = intentRules.status === 'confirmed';

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {currentPage === 'landing' ? (
        <LandingPage onStartDemo={() => setCurrentPage('dashboard')} />
      ) : (
        <div className="dashboard-root">
          {/* Top Header */}
          <DashboardHeader
            onNewSession={handleResetSession}
            onGoToLanding={() => setCurrentPage('landing')}
          />

          {/* Main Dashboard Workspace */}
          <main className="dashboard-main-content">
            {/* Scenario Selector */}
            <ScenarioSelector
              currentScenario={currentScenario}
              onSelectScenario={handleSelectScenario}
            />

            {/* 3 Responsive Columns */}
            <div className="dashboard-columns-grid">
              {/* Step 1: Intent Lock */}
              <IntentLockColumn
                intentRules={intentRules}
                onUpdateRules={setIntentRules}
                onConfirmLock={handleConfirmIntentLock}
              />

              {/* Step 2: AI Catalog Filter → Step 3: AI Selection → Stability */}
              <div className="dashboard-middle-stack">
                <VerifiedOffersColumn
                  currentScenario={currentScenario}
                  selectedProductId={selectedProductId}
                  isIntentConfirmed={isIntentConfirmed}
                />
                <AIProductSelectionCard
                  currentScenario={currentScenario}
                  isIntentConfirmed={isIntentConfirmed}
                />
                <div className={!isIntentConfirmed ? 'opacity-60 pointer-events-none' : ''}>
                  <SelectionStabilityCard currentScenario={currentScenario} />
                </div>
              </div>

              {/* ChoiceProof Decision & Payment Guardian */}
              <ChoiceProofDecisionColumn
                currentScenario={currentScenario}
                selectedProductId={selectedProductId}
                isIntentConfirmed={isIntentConfirmed}
                decisionStatus={decisionStatus}
                onSetDecisionStatus={(st) => {
                  setDecisionStatus(st);
                  if (st === 'APPROVED') {
                    addToast('success', 'Nike Runner selected as recommended alternative');
                  }
                }}
                onSelectProduct={setSelectedProductId}
                isPermitIssued={isPermitIssued}
                onIssuePermit={handleIssuePermit}
                onOpenRazorpayModal={handleOpenRazorpayModal}
                onTriggerScenario3Mutation={handleTriggerScenario3Mutation}
                isScenario3Mutated={isScenario3Mutated}
                onResetSession={handleResetSession}
              />
            </div>

            {/* Payment Success / Blocked Full-Width Receipt Section */}
            <ReceiptSection
              currentScenario={currentScenario}
              decisionStatus={decisionStatus}
              selectedProductId={selectedProductId}
              isScenario3Mutated={isScenario3Mutated}
              paymentComplete={paymentComplete}
            />
          </main>

          {/* Razorpay Test Mode Checkout Sheet Modal */}
          <RazorpayModal
            isOpen={isRazorpayModalOpen}
            onClose={() => setIsRazorpayModalOpen(false)}
            product={paymentProduct}
            amount={paymentAmount}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </div>
      )}
    </>
  );
}

export default App;
