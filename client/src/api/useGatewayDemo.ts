import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_USER_REQUEST, INITIAL_INTENT_RULES, MOCK_PRODUCTS } from '../data/mockData';
import type {
  ChoiceProofStatus,
  IntentLockRules,
  ProductOffer,
  ScenarioId,
} from '../types/choiceproof';
import * as gateway from './gateway';
import { pingReady } from './http';
import { GatewayApiError } from './types';
import { mapApiProduct, mapExcludedProduct, mapIntent } from './mappers';
import type {
  ApiAgentDecision,
  ApiAuditEvent,
  ApiCatalogResponse,
  ApiEvaluation,
  ApiPayment,
  ApiPermit,
  ApiReceipt,
} from './types';
import type { ExcludedProduct } from '../types/choiceproof';

export type DemoStep = 'intent' | 'catalog' | 'selection' | 'decision' | 'payment' | 'receipt';

export interface ReadyState {
  connected: boolean;
  aiMode: string;
  paymentMode: string;
}

function mapDecision(decision?: string): ChoiceProofStatus {
  if (decision === 'REVIEW') return 'REVIEW_REQUIRED';
  if (decision === 'APPROVE_WITH_OVERRIDE') return 'APPROVED_WITH_USER_OVERRIDE';
  if (decision === 'BLOCK') return 'PAYMENT_BLOCKED';
  return 'APPROVED';
}

export function useGatewayDemo() {
  const [ready, setReady] = useState<ReadyState>({ connected: false, aiMode: 'fixture', paymentMode: 'mock' });
  const [bootError, setBootError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState('');
  const [currentScenario, setCurrentScenario] = useState<ScenarioId>('scenario_1');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [intentRules, setIntentRules] = useState<IntentLockRules>({
    ...INITIAL_INTENT_RULES,
    status: 'parsed',
  });
  const [prompt, setPrompt] = useState(DEFAULT_USER_REQUEST);
  const [step, setStep] = useState<DemoStep>('intent');
  const [eligible, setEligible] = useState<ProductOffer[]>(MOCK_PRODUCTS);
  const [excluded, setExcluded] = useState<ExcludedProduct[]>([]);
  const [offerSetHash, setOfferSetHash] = useState('');
  const [normal, setNormal] = useState<ApiAgentDecision | null>(null);
  const [clean, setClean] = useState<ApiAgentDecision | null>(null);
  const [evaluation, setEvaluation] = useState<ApiEvaluation | null>(null);
  const [permit, setPermit] = useState<ApiPermit | null>(null);
  const [payment, setPayment] = useState<ApiPayment | null>(null);
  const [receipt, setReceipt] = useState<ApiReceipt | null>(null);
  const [audit, setAudit] = useState<ApiAuditEvent[]>([]);
  const [isScenario3Mutated, setIsScenario3Mutated] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const selectedProductId =
    evaluation?.selectedProductId ||
    normal?.productId ||
    eligible[0]?.id ||
    MOCK_PRODUCTS[0]?.id;

  const selectedProduct =
    eligible.find((p) => p.id === selectedProductId) || MOCK_PRODUCTS.find((p) => p.id === selectedProductId) || MOCK_PRODUCTS[0];

  const decisionStatus: ChoiceProofStatus = isScenario3Mutated
    ? 'PAYMENT_BLOCKED'
    : mapDecision(evaluation?.decision);

  const run = useCallback(async <T,>(label: string, fn: () => Promise<T>): Promise<T> => {
    setBusy(true);
    setBusyLabel(label);
    try {
      return await fn();
    } finally {
      setBusy(false);
      setBusyLabel('');
    }
  }, []);

  const ensureAuthAndSession = useCallback(
    async (scenarioId: ScenarioId) => {
      await gateway.demoLogin();
      const session = await gateway.createSession(scenarioId);
      setSessionId(session.id);
      return session.id;
    },
    []
  );

  const bootstrap = useCallback(async () => {
    try {
      const status = await pingReady();
      setReady({
        connected: true,
        aiMode: status.aiMode || 'fixture',
        paymentMode: status.paymentMode || 'mock',
      });
      setBootError(null);
      await gateway.demoLogin();
      const session = await gateway.createSession(currentScenario);
      setSessionId(session.id);
    } catch (error) {
      setReady((prev) => ({ ...prev, connected: false }));
      setBootError(
        error instanceof GatewayApiError
          ? error.message
          : 'Cannot reach the ChoiceProof API. Start the server on port 3000, then refresh.'
      );
    }
  }, [currentScenario]);

  useEffect(() => {
    // This legacy Proof Lab deliberately starts its API demo once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetLocalPipeline = () => {
    setEligible(MOCK_PRODUCTS);
    setExcluded([]);
    setOfferSetHash('');
    setNormal(null);
    setClean(null);
    setEvaluation(null);
    setPermit(null);
    setPayment(null);
    setReceipt(null);
    setAudit([]);
    setIsScenario3Mutated(false);
    setPaymentComplete(false);
    setStep('intent');
    setIntentRules({ ...INITIAL_INTENT_RULES, status: 'parsed' });
    setPrompt(DEFAULT_USER_REQUEST);
  };

  const handleSelectScenario = async (scenarioId: ScenarioId, onToast?: (type: 'info' | 'warning', message: string) => void) => {
    setCurrentScenario(scenarioId);
    resetLocalPipeline();
    try {
      await run('Opening session', async () => {
        const id = await ensureAuthAndSession(scenarioId);
        setSessionId(id);
      });
      onToast?.(
        scenarioId === 'scenario_2' ? 'warning' : 'info',
        scenarioId === 'scenario_1'
          ? 'Loaded Scenario 1: Clean Approval'
          : scenarioId === 'scenario_2'
            ? 'Loaded Scenario 2: Questionable Choice'
            : 'Loaded Scenario 3: Mutated Payment'
      );
    } catch (error) {
      setBootError(error instanceof Error ? error.message : 'Could not open a session.');
    }
  };

  const handleResetSession = async (onToast?: (message: string) => void) => {
    resetLocalPipeline();
    setCurrentScenario('scenario_1');
    try {
      await run('Resetting session', async () => {
        const id = await ensureAuthAndSession('scenario_1');
        setSessionId(id);
      });
      onToast?.('Session reset to a clean initial state.');
    } catch (error) {
      setBootError(error instanceof Error ? error.message : 'Could not reset the session.');
    }
  };

  const handleAnalyze = async (text: string) => {
    const activeSession = sessionId || (await ensureAuthAndSession(currentScenario));
    setPrompt(text);
    setIntentRules((prev) => ({ ...prev, status: 'analyzing' }));
    const parsed = await run('Parsing intent', () => gateway.parseIntent(activeSession, text));
    setIntentRules(mapIntent(parsed));
  };

  const handleConfirmIntent = async () => {
    const activeSession = sessionId || (await ensureAuthAndSession(currentScenario));
    await run('Confirming intent and scanning catalog', async () => {
      await gateway.parseIntent(activeSession, prompt);
      const confirmed = await gateway.confirmIntent(activeSession);
      setIntentRules(mapIntent(confirmed));
      const catalog: ApiCatalogResponse = await gateway.fetchCatalog(activeSession);
      setOfferSetHash(catalog.offerSetHash);
      setEligible(catalog.eligible.map(mapApiProduct));
      setExcluded(
        catalog.excluded.map((item) =>
          mapExcludedProduct(item.product, item.reasonCode, confirmed.maxAmountPaise)
        )
      );
      const selection = await gateway.selectProducts(activeSession);
      setNormal(selection.normal);
      setClean(selection.clean);
      const nextEvaluation = await gateway.evaluateSession(activeSession);
      setEvaluation(nextEvaluation);
      const nextAudit = await gateway.fetchAudit(activeSession);
      setAudit(nextAudit);
      setStep('catalog');
    });
  };

  const handleIssuePermit = async () => {
    if (!evaluation) throw new Error('Evaluate the selection before issuing a permit.');
    const nextPermit = await run('Issuing payment permit', () => gateway.issuePermit(evaluation.id));
    setPermit(nextPermit);
    setStep('payment');
    return nextPermit;
  };

  const handleChooseAlternative = async () => {
    if (!evaluation) return;
    const replacements = await gateway.fetchReplacements(evaluation.id);
    const replacementId = replacements.replacements?.[0]?.productId || evaluation.dominance?.[0]?.productId;
    if (!replacementId) throw new Error('ChoiceProof did not return a safe replacement for this review.');
    const next = await run('Applying recommended alternative', () =>
      gateway.resolveReview(evaluation.id, 'CHOOSE_ALTERNATIVE', replacementId)
    );
    setEvaluation(next);
  };

  const handleOverride = async () => {
    if (!evaluation) return;
    const next = await run('Recording user override', () =>
      gateway.resolveReview(evaluation.id, 'CONTINUE_WITH_SELECTED')
    );
    setEvaluation(next);
  };

  const handlePay = async () => {
    if (!permit) throw new Error('Issue a payment permit first.');
    const order = await gateway.createOrder(permit.id, permit.cart, crypto.randomUUID());
    if ('razorpayOrderCreated' in order && order.razorpayOrderCreated === false) {
      setReceipt(order.receipt);
      setIsScenario3Mutated(true);
      setStep('receipt');
      return { blocked: true as const };
    }
    const paymentResult = order as ApiPayment;
    setPayment(paymentResult);
    if (ready.paymentMode === 'mock') {
      const captured = await gateway.mockCompletePayment(paymentResult.providerOrderId);
      setPayment(captured.payment);
      setReceipt(captured.receipt);
      setPaymentComplete(true);
      setStep('receipt');
      return { blocked: false as const, receipt: captured.receipt };
    }
    setPaymentComplete(true);
    setStep('receipt');
    return { blocked: false as const };
  };

  const handleMutateCart = async () => {
    let activePermit = permit;
    if (!activePermit && evaluation) {
      activePermit = await gateway.issuePermit(evaluation.id);
      setPermit(activePermit);
    }
    if (!activePermit) throw new Error('No permit is available to mutate.');
    const result = await run('Submitting changed cart', () =>
      gateway.createOrder(activePermit!.id, {
        merchant: 'DemoSports',
        sku: 'PREMIUM-X-01',
        quantity: 1,
        itemAmountPaise: 649900,
        shippingAmountPaise: 0,
        taxAmountPaise: 0,
        addOns: [],
        subscription: false,
        amountPaise: 649900,
        currency: 'INR',
      }, crypto.randomUUID())
    );
    if ('receipt' in result) {
      setReceipt(result.receipt);
    }
    setIsScenario3Mutated(true);
    setStep('receipt');
  };

  const catalogSummary = useMemo(
    () => ({
      scanned: eligible.length + excluded.length || 10,
      eligible: eligible.length || 3,
      excluded: excluded.length || 7,
    }),
    [eligible.length, excluded.length]
  );

  return {
    ready,
    bootError,
    busy,
    busyLabel,
    currentScenario,
    sessionId,
    intentRules,
    setIntentRules,
    prompt,
    setPrompt,
    step,
    setStep,
    eligible,
    excluded,
    offerSetHash,
    normal,
    clean,
    evaluation,
    permit,
    payment,
    receipt,
    audit,
    isScenario3Mutated,
    paymentComplete,
    selectedProductId,
    selectedProduct,
    decisionStatus,
    isIntentConfirmed: intentRules.status === 'confirmed',
    catalogSummary,
    handleSelectScenario,
    handleResetSession,
    handleAnalyze,
    handleConfirmIntent,
    handleIssuePermit,
    handleChooseAlternative,
    handleOverride,
    handlePay,
    handleMutateCart,
    retryBootstrap: bootstrap,
  };
}
