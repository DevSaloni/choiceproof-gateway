import { useCallback, useEffect, useMemo, useState } from 'react';
import * as gateway from './gateway';
import { pingReady } from './http';
import type { ApiChatMessage, ApiEvaluation, ApiIntent, ApiIntentDraft, ApiPayment, ApiPermit, ApiProduct, ApiReceipt, ApiSession } from './types';

const examplePrompt = 'I need Nike running shoes in UK 8, under ₹5,000, delivered within 4 days, with no subscription.';

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      theme: { color: string };
      handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
      modal: { ondismiss: () => void };
    }) => { open: () => void };
  }
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-choiceproof-razorpay]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Razorpay Checkout could not be loaded.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.dataset.choiceproofRazorpay = 'true';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay Checkout could not be loaded.'));
    document.head.appendChild(script);
  });
}

export function formatRupees(paise?: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((paise ?? 0) / 100);
}

export function useConciergeSession(initialSessionId?: string) {
  const [sessionId, setSessionId] = useState(initialSessionId ?? localStorage.getItem('choiceproof-session') ?? '');
  const [messages, setMessages] = useState<ApiChatMessage[]>([]);
  const [intent, setIntent] = useState<ApiIntent | undefined>();
  const [intentDraft, setIntentDraft] = useState<ApiIntentDraft | undefined>();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [evaluation, setEvaluation] = useState<ApiEvaluation | undefined>();
  const [permit, setPermit] = useState<ApiPermit | undefined>();
  const [payment, setPayment] = useState<ApiPayment | undefined>();
  const [receipt, setReceipt] = useState<ApiReceipt | undefined>();
  const [audit, setAudit] = useState<ApiSession['audit']>([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  const hydrate = useCallback((view: ApiSession) => {
    setSessionId(view.id);
    localStorage.setItem('choiceproof-session', view.id);
    setMessages(view.messages ?? []);
    setIntent(view.intent);
    setIntentDraft(view.intentDraft);
    setProducts(view.offerSetState?.eligible ?? view.offerSet ?? []);
    setEvaluation(view.evaluation);
    setPermit(view.permit);
    setPayment(view.payments.at(-1));
    setAudit(view.audit ?? []);
  }, []);

  const open = useCallback(async (id?: string) => {
    setError('');
    setBusy('Preparing your shopping session');
    try {
      await gateway.demoLogin();
      const target = id || localStorage.getItem('choiceproof-session') || '';
      if (target) {
        hydrate(await gateway.fetchSessionView(target));
      } else {
        hydrate(await gateway.createSession(null));
      }
      setConnected(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not connect to ChoiceProof.');
    } finally {
      setBusy('');
    }
  }, [hydrate]);

  useEffect(() => { void pingReady().then(() => open(initialSessionId)).catch(() => setError('Start the ChoiceProof server, then retry.')); }, [initialSessionId, open]);

  const send = useCallback(async (text: string) => {
    if (!sessionId || !text.trim()) return;
    setBusy('Understanding what you need');
    setError('');
    try {
      const reply = await gateway.sendMessage(sessionId, text.trim(), crypto.randomUUID());
      setMessages((previous) => [...previous, reply.userMessage, reply.assistantMessage]);
      setIntentDraft(reply.intentDraft);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your message could not be sent.');
    } finally {
      setBusy('');
    }
  }, [sessionId]);

  const confirm = useCallback(async () => {
    if (!sessionId) return;
    setBusy('Locking your requirements');
    setError('');
    try {
      const confirmed = await gateway.confirmIntent(sessionId);
      setIntent(confirmed);
      setIntentDraft(undefined);
      const result = await gateway.runAgent(sessionId);
      setEvaluation(result.evaluation);
      setProducts((await gateway.fetchSessionView(sessionId)).offerSetState?.eligible ?? []);
      setMessages((previous) => [...previous, { id: `local_${Date.now()}`, role: 'ASSISTANT', kind: 'RECOMMENDATION', text: result.normal.reason }]);
      setAudit(await gateway.fetchAudit(sessionId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not verify this shopping request.');
    } finally {
      setBusy('');
    }
  }, [sessionId]);

  const chooseReplacement = useCallback(async (productId: string) => {
    if (!evaluation) return;
    setBusy('Applying the safe replacement');
    try {
      const next = await gateway.resolveReview(evaluation.id, 'CHOOSE_REPLACEMENT', productId);
      setEvaluation(next);
      setAudit(await gateway.fetchAudit(sessionId));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not apply the replacement.'); }
    finally { setBusy(''); }
  }, [evaluation, sessionId]);

  const override = useCallback(async () => {
    if (!evaluation) return;
    setBusy('Recording your confirmation');
    try { setEvaluation(await gateway.resolveReview(evaluation.id, 'CONTINUE_WITH_SELECTED')); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not record your confirmation.'); }
    finally { setBusy(''); }
  }, [evaluation]);

  const issuePermit = useCallback(async () => {
    if (!evaluation) return;
    setBusy('Creating your exact-cart permit');
    try { setPermit(await gateway.issuePermit(evaluation.id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not issue a payment permit.'); }
    finally { setBusy(''); }
  }, [evaluation]);

  const pay = useCallback(async () => {
    if (!permit) return;
    setBusy('Creating your protected payment order');
    try {
      const result = await gateway.createOrder(permit.id, permit.cart, crypto.randomUUID());
      if ('razorpayOrderCreated' in result) { setReceipt(result.receipt); return; }
      setPayment(result);
      if (result.provider === 'mock') {
        const captured = await gateway.mockCompletePayment(result.providerOrderId);
        setPayment(captured.payment);
        setReceipt(captured.receipt);
        setAudit(await gateway.fetchAudit(sessionId));
        return;
      }

      if (!result.keyId) throw new Error('Razorpay key ID is missing from the protected order.');
      await loadRazorpayCheckout();
      if (!window.Razorpay) throw new Error('Razorpay Checkout did not initialise.');
      setBusy('Complete the secure Razorpay checkout');
      const checkout = new window.Razorpay({
        key: result.keyId,
        amount: result.amountPaise,
        currency: result.currency,
        name: 'ChoiceProof Concierge',
        description: 'Exact-cart payment protected by ChoiceProof',
        order_id: result.providerOrderId,
        theme: { color: '#0f766e' },
        modal: { ondismiss: () => setBusy('') },
        handler: async (response) => {
          setBusy('Verifying your Razorpay payment');
          try {
            const verified = await gateway.verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
            setPayment(verified.payment);
            setReceipt(verified.receipt);
            setAudit(await gateway.fetchAudit(sessionId));
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Payment verification could not be completed.');
          } finally {
            setBusy('');
          }
        },
      });
      checkout.open();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Payment could not be completed.'); }
    finally { setBusy(''); }
  }, [permit, sessionId]);

  const selected = useMemo(() => products.find((product) => product.id === evaluation?.selectedProductId), [products, evaluation]);
  const reset = useCallback(() => { localStorage.removeItem('choiceproof-session'); setSessionId(''); setMessages([]); setIntent(undefined); setIntentDraft(undefined); setProducts([]); setEvaluation(undefined); setPermit(undefined); setPayment(undefined); setReceipt(undefined); void open(''); }, [open]);

  return { sessionId, messages, intent, intentDraft, products, selected, evaluation, permit, payment, receipt, audit, busy, error, connected, examplePrompt, open, send, confirm, chooseReplacement, override, issuePermit, pay, reset };
}
