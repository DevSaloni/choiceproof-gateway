import { useMemo, useState } from 'react';
import { useGatewayDemo, type DemoStep } from './api/useGatewayDemo';
import { AI_SELECTION_BY_SCENARIO } from './data/mockData';
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
import { DemoStepper } from './components/DemoStepper';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { ArrowRight } from './components/Icons';

const STEP_ORDER: DemoStep[] = ['intent', 'catalog', 'selection', 'decision', 'payment', 'receipt'];

export function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard'>('landing');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const demo = useGatewayDemo();

  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
  };

  const unlocked = useMemo(() => {
    const currentIndex = STEP_ORDER.indexOf(demo.step);
    return STEP_ORDER.filter((_, index) => index <= currentIndex);
  }, [demo.step]);

  const goNext = () => {
    const index = STEP_ORDER.indexOf(demo.step);
    const next = STEP_ORDER[index + 1];
    if (!next) return;
    if (next === 'payment' && !demo.permit && demo.currentScenario !== 'scenario_3') {
      addToast('info', 'Issue a payment permit on the ChoiceProof step first.');
      demo.setStep('decision');
      return;
    }
    demo.setStep(next);
  };

  const handleIssuePermit = async () => {
    try {
      await demo.handleIssuePermit();
      addToast('success', 'Exact-cart payment permit issued');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Could not issue a permit.');
    }
  };

  const handlePay = async () => {
    try {
      const result = await demo.handlePay();
      if (result?.blocked) {
        addToast('error', 'Payment Guardian blocked a mutated cart');
        return;
      }
      addToast('success', 'Payment verified and receipt signed');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Payment failed.');
    }
  };

  const productName = (id?: string) =>
    demo.eligible.find((item) => item.id === id)?.name ||
    (id === 'prod_premium_x' ? 'Premium X' : 'Nike Runner');

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {currentPage === 'landing' ? (
        <LandingPage onStartDemo={() => setCurrentPage('dashboard')} />
      ) : (
        <div className="dashboard-root">
          <DashboardHeader
            onNewSession={() => void demo.handleResetSession((message) => addToast('info', message))}
            onGoToLanding={() => setCurrentPage('landing')}
            aiMode={demo.ready.aiMode}
            paymentMode={demo.ready.paymentMode}
            apiConnected={demo.ready.connected}
          />

          <main className="dashboard-main-content">
            {demo.bootError && (
              <div className="api-offline-banner">
                <div>
                  <strong>Backend not connected.</strong>
                  <p>{demo.bootError}</p>
                  <p className="api-offline-hint">Run `npm run dev` inside `server`, keep this app on port 5173, then retry.</p>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => void demo.retryBootstrap()}>
                  Retry connection
                </button>
              </div>
            )}

            <ScenarioSelector
              currentScenario={demo.currentScenario}
              onSelectScenario={(id) =>
                void demo.handleSelectScenario(id, (type, message) => addToast(type, message))
              }
            />

            <div className="demo-workspace">
              <DemoStepper current={demo.step} unlocked={unlocked} onSelect={demo.setStep} />

              <section className="demo-stage">
                {demo.busy && (
                  <div className="demo-busy-strip">
                    <div className="spinner-indigo" />
                    <span>{demo.busyLabel || 'Working…'}</span>
                  </div>
                )}

                {demo.step === 'intent' && (
                  <>
                    <IntentLockColumn
                      intentRules={demo.intentRules}
                      onUpdateRules={demo.setIntentRules}
                      onConfirmLock={async () => {
                        try {
                          await demo.handleConfirmIntent();
                          addToast('success', 'Intent confirmed. Catalog scanned on the server.');
                        } catch (error) {
                          addToast('error', error instanceof Error ? error.message : 'Intent confirmation failed.');
                        }
                      }}
                      onAnalyzePrompt={demo.handleAnalyze}
                      isBusy={demo.busy}
                    />
                    {demo.isIntentConfirmed && (
                      <div className="demo-stage-footer">
                        <button type="button" className="btn btn-primary" onClick={() => demo.setStep('catalog')}>
                          Continue to catalog
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    )}
                  </>
                )}

                {demo.step === 'catalog' && (
                  <>
                    <VerifiedOffersColumn
                      currentScenario={demo.currentScenario}
                      selectedProductId={demo.selectedProductId}
                      isIntentConfirmed
                      eligibleProducts={demo.eligible}
                      excludedProducts={demo.excluded}
                      scannedCount={demo.catalogSummary.scanned}
                    />
                    <div className="demo-stage-footer">
                      <button type="button" className="btn btn-outline" onClick={() => demo.setStep('intent')}>
                        Back
                      </button>
                      <button type="button" className="btn btn-primary" onClick={goNext}>
                        Continue to AI selection
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </>
                )}

                {demo.step === 'selection' && (
                  <>
                    <AIProductSelectionCard
                      currentScenario={demo.currentScenario}
                      isIntentConfirmed
                      eligibleCount={demo.eligible.length}
                      selectedProductOverride={demo.selectedProduct}
                      reasonOverride={
                        demo.normal?.reason || AI_SELECTION_BY_SCENARIO[demo.currentScenario].reason
                      }
                    />
                    <SelectionStabilityCard
                      currentScenario={demo.currentScenario}
                      normalProductName={productName(demo.evaluation?.stability.normalProductId || demo.normal?.productId)}
                      cleanProductName={productName(demo.evaluation?.stability.cleanProductId || demo.clean?.productId)}
                      stabilityStatus={demo.evaluation?.stability.status}
                    />
                    <div className="demo-stage-footer">
                      <button type="button" className="btn btn-outline" onClick={() => demo.setStep('catalog')}>
                        Back
                      </button>
                      <button type="button" className="btn btn-primary" onClick={goNext}>
                        Continue to ChoiceProof
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </>
                )}

                {demo.step === 'decision' && (
                  <>
                    <ChoiceProofDecisionColumn
                      currentScenario={demo.currentScenario}
                      selectedProductId={demo.selectedProductId}
                      isIntentConfirmed
                      decisionStatus={demo.decisionStatus}
                      onSetDecisionStatus={() => undefined}
                      onSelectProduct={() => undefined}
                      isPermitIssued={Boolean(demo.permit)}
                      onIssuePermit={handleIssuePermit}
                      onOpenRazorpayModal={() => setIsRazorpayModalOpen(true)}
                      onTriggerScenario3Mutation={async () => {
                        try {
                          await demo.handleMutateCart();
                          addToast('error', 'Payment Guardian blocked the mutated cart');
                        } catch (error) {
                          addToast('error', error instanceof Error ? error.message : 'Mutation check failed.');
                        }
                      }}
                      isScenario3Mutated={demo.isScenario3Mutated}
                      onResetSession={() => void demo.handleResetSession((message) => addToast('info', message))}
                      onChooseRecommended={async () => {
                        await demo.handleChooseAlternative();
                        addToast('success', 'Nike Runner selected as the recommended alternative');
                      }}
                      onConfirmOverride={async () => {
                        await demo.handleOverride();
                        addToast('warning', 'Premium X approved with user override');
                      }}
                      permitId={demo.permit?.id}
                      permitExpiresAt={demo.permit?.expiresAt}
                    />
                    <div className="demo-stage-footer">
                      <button type="button" className="btn btn-outline" onClick={() => demo.setStep('selection')}>
                        Back
                      </button>
                      {demo.permit && demo.currentScenario !== 'scenario_3' && (
                        <button type="button" className="btn btn-primary" onClick={() => demo.setStep('payment')}>
                          Continue to payment
                          <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                  </>
                )}

                {demo.step === 'payment' && (
                  <>
                    <ChoiceProofDecisionColumn
                      currentScenario={demo.currentScenario}
                      selectedProductId={demo.selectedProductId}
                      isIntentConfirmed
                      decisionStatus={demo.decisionStatus}
                      onSetDecisionStatus={() => undefined}
                      onSelectProduct={() => undefined}
                      isPermitIssued={Boolean(demo.permit)}
                      onIssuePermit={handleIssuePermit}
                      onOpenRazorpayModal={() => setIsRazorpayModalOpen(true)}
                      onTriggerScenario3Mutation={async () => {
                        try {
                          await demo.handleMutateCart();
                          addToast('error', 'Payment Guardian blocked the mutated cart');
                        } catch (error) {
                          addToast('error', error instanceof Error ? error.message : 'Mutation check failed.');
                        }
                      }}
                      isScenario3Mutated={demo.isScenario3Mutated}
                      onResetSession={() => void demo.handleResetSession((message) => addToast('info', message))}
                      permitId={demo.permit?.id}
                      permitExpiresAt={demo.permit?.expiresAt}
                    />
                    <div className="demo-stage-footer">
                      <button type="button" className="btn btn-outline" onClick={() => demo.setStep('decision')}>
                        Back
                      </button>
                    </div>
                  </>
                )}

                {demo.step === 'receipt' && (
                  <ReceiptSection
                    currentScenario={demo.currentScenario}
                    decisionStatus={demo.decisionStatus}
                    selectedProductId={demo.selectedProductId}
                    isScenario3Mutated={demo.isScenario3Mutated}
                    paymentComplete={demo.paymentComplete || demo.isScenario3Mutated}
                    receiptHash={demo.receipt?.receiptHash}
                    receiptSignature={demo.receipt?.receiptSignature}
                    permitId={demo.permit?.id}
                    orderId={demo.payment?.providerOrderId}
                    auditEvents={demo.audit}
                  />
                )}
              </section>
            </div>
          </main>

          <RazorpayModal
            isOpen={isRazorpayModalOpen}
            onClose={() => setIsRazorpayModalOpen(false)}
            product={demo.selectedProduct}
            amount={demo.selectedProduct.price}
            orderId={demo.payment?.providerOrderId}
            permitLabel={demo.permit?.id ? `${demo.permit.id.slice(0, 14)}…` : 'permit'}
            onPaymentSuccess={handlePay}
          />
        </div>
      )}
    </>
  );
}

export default App;
