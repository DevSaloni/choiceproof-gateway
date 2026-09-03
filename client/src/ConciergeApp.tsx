import { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, CreditCard, Lock, SearchCheck, ShieldCheck, Sparkles } from './components/Icons';
import { formatRupees, useConciergeSession } from './api/useConciergeSession';
import type { ApiProduct } from './api/types';

type Route = 'landing' | 'shop' | 'proof';

function navigate(path: string) { window.history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); }
function statusTone(status?: string) { return status === 'BLOCK' ? 'danger' : status === 'REVIEW' ? 'warning' : 'success'; }

function Brand() { return <button className="brand" onClick={() => navigate('/')}><span className="brand-mark"><ShieldCheck size={19} /></span><span>ChoiceProof <small>Concierge</small></span></button>; }

function SiteHeader() {
  return <header className="site-header"><div className="site-shell header-inner"><Brand /><nav aria-label="Main navigation"><button onClick={() => navigate('/shop')}>Shop with AI</button><button onClick={() => navigate('/lab')}>Proof Lab</button></nav><button className="button button-primary button-small" onClick={() => navigate('/shop')}>Start shopping <ArrowRight size={15} /></button></div></header>;
}

function LandingPage() {
  return <div className="public-page"><SiteHeader /><main>
    <section className="landing-hero site-shell">
      <div className="hero-copy"><p className="eyebrow"><ShieldCheck size={15} /> Shopping protection for AI agents</p><h1>Let AI shop.<br /><span>Keep the choice yours.</span></h1><p className="hero-lede">ChoiceProof checks that an AI recommendation still matches the shopping rules you confirmed, before an exact cart can reach Razorpay.</p><div className="hero-actions"><button className="button button-primary" onClick={() => navigate('/shop')}>Start shopping <ArrowRight size={17} /></button><button className="button button-secondary" onClick={() => navigate('/lab')}>Explore Proof Lab</button></div></div>
      <div className="hero-proof" aria-label="Example verified purchase"><div className="proof-topline"><span>Purchase review</span><span className="status success">Approved</span></div><div className="shoe-orb"><span>NIKE</span></div><h2>Nike Runner</h2><p>UK 8 · Delivered in 2 days</p><div className="proof-price"><strong>₹4,499</strong><span>within your ₹5,000 limit</span></div><div className="check-list"><span><CheckCircle2 size={16} /> Intent matched</span><span><CheckCircle2 size={16} /> No subscription</span><span><CheckCircle2 size={16} /> Exact cart locked</span></div></div>
    </section>
    <section className="site-shell value-band"><div><p className="eyebrow">A safer buying loop</p><h2>Four simple moments before money moves.</h2></div><ol className="steps"><li><b>01</b><span>Tell the concierge what you need.</span></li><li><b>02</b><span>Confirm the important rules.</span></li><li><b>03</b><span>See why one product was chosen.</span></li><li><b>04</b><span>Pay only for that exact cart.</span></li></ol></section>
    <section className="site-shell safety-grid"><article><Lock size={21} /><h3>Intent Lock</h3><p>Your budget, delivery, size, and subscription rules are confirmed before search begins.</p></article><article><SearchCheck size={21} /><h3>Independent proof</h3><p>ChoiceProof compares the recommendation against the verified offers the agent observed.</p></article><article><CreditCard size={21} /><h3>Exact-cart payment</h3><p>A short-lived permit binds payment to one product, one merchant, and one amount.</p></article></section>
    <section className="site-shell limitation"><AlertCircle size={18} /><p>ChoiceProof evaluates the recorded verified offer set. It does not claim to identify the best product on the entire internet.</p></section>
  </main><footer className="site-shell site-footer">ChoiceProof Gateway · Razorpay Buildathon 2026</footer></div>;
}

function ChatComposer({ onSend, disabled }: { onSend: (value: string) => void; disabled: boolean }) {
  const [value, setValue] = useState('');
  return <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); if (value.trim()) { onSend(value); setValue(''); } }}><textarea value={value} disabled={disabled} onChange={(event) => setValue(event.target.value)} placeholder="Tell the concierge what you want to buy..." rows={2} /><button aria-label="Send message" className="button button-primary button-icon" disabled={disabled || !value.trim()}><ArrowRight size={18} /></button></form>;
}

function ProductCard({ product, selected }: { product: ApiProduct; selected: boolean }) {
  return <article className={`offer-card ${selected ? 'selected' : ''}`}><div className="offer-thumb">{product.brand.slice(0, 1)}</div><div className="offer-main"><div className="offer-title"><strong>{product.name}</strong>{selected && <span className="selected-label">AI pick</span>}</div><span>{product.brand} · {product.deliveryDays}-day delivery</span><span>UK sizes: {product.availableSizes.join(', ')}</span></div><div className="offer-price"><strong>{formatRupees(product.pricePaise + product.shippingPaise + product.taxPaise)}</strong><span>{product.subscription ? 'Subscription' : 'No subscription'}</span></div></article>;
}

function IntentPanel({ draft, intent, onConfirm, busy }: { draft: ReturnType<typeof useConciergeSession>['intentDraft']; intent: ReturnType<typeof useConciergeSession>['intent']; onConfirm: () => void; busy: string }) {
  const view = intent ?? draft;
  const fields = [['Category', view?.category], ['Size', view?.size], ['Budget', view?.maxAmountPaise ? formatRupees(view.maxAmountPaise) : undefined], ['Delivery', view?.maxDeliveryDays ? `${view.maxDeliveryDays} days` : undefined], ['Subscription', view?.subscriptionAllowed === undefined ? undefined : view.subscriptionAllowed ? 'Allowed' : 'Not allowed'], ['Brand', view?.brandPreference]];
  const missing = draft?.missingFields ?? [];
  return <section className="side-panel"><div className="panel-heading"><span className="panel-icon"><Lock size={17} /></span><div><h2>Intent Lock</h2><p>{intent?.confirmed ? 'Confirmed shopping rules' : 'Your editable requirements'}</p></div></div>{view ? <><dl className="intent-list">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Still needed'}</dd></div>)}</dl>{!intent?.confirmed && <><p className="helper-text">{missing.length ? `Still needed: ${missing.join(', ')}` : 'Everything looks ready to confirm.'}</p><button className="button button-primary button-full" disabled={Boolean(missing.length) || Boolean(busy)} onClick={onConfirm}>Confirm requirements</button></>}</> : <div className="empty-copy">Tell the concierge what you are shopping for. It will ask only for missing essentials.</div>}</section>;
}

function DecisionPanel({ session }: { session: ReturnType<typeof useConciergeSession> }) {
  const { evaluation, selected, products, permit, payment, receipt, busy, issuePermit, pay, chooseReplacement, override, reset } = session;
  if (!evaluation) return <section className="side-panel decision-empty"><Sparkles size={21} /><h2>ChoiceProof is ready</h2><p>After you confirm your rules, we will independently check the agent's recommendation.</p></section>;
  const tone = statusTone(evaluation.decision);
  const replacementProducts = (evaluation.replacements ?? []).map((entry) => products.find((product) => product.id === entry.productId)).filter(Boolean) as ApiProduct[];
  return <section className={`side-panel decision-panel ${tone}`}><div className="decision-heading"><div><span className={`status ${tone}`}>{evaluation.decision === 'REVIEW' ? 'Review needed' : evaluation.decision === 'BLOCK' ? 'Blocked' : 'Approved'}</span><h2>{selected?.name ?? 'Product decision'}</h2></div><ShieldCheck size={24} /></div><ul className="reason-list">{evaluation.hardRuleResults.filter((rule) => rule.passed).slice(0, 4).map((rule) => <li key={rule.code}><CheckCircle2 size={15} />{rule.message}</li>)}{evaluation.reasonCodes.filter((code) => code !== 'ALL_HARD_RULES_PASSED').map((code) => <li key={code}><AlertCircle size={15} />{code.replaceAll('_', ' ').toLowerCase()}</li>)}</ul>
    {evaluation.decision === 'REVIEW' && <div className="review-box"><h3>A safer choice is available</h3>{replacementProducts.map((product) => <button key={product.id} className="replacement-option" onClick={() => chooseReplacement(product.id)}><span><b>{product.name}</b><small>{formatRupees(product.pricePaise)} · {product.deliveryDays} days</small></span><ArrowRight size={16} /></button>)}<button className="button button-secondary button-full" onClick={override}>Continue with selected choice</button></div>}
    {evaluation.decision === 'BLOCK' && <button className="button button-secondary button-full" onClick={reset}>Start a safer search</button>}
    {['APPROVE', 'APPROVE_WITH_OVERRIDE'].includes(evaluation.decision) && !permit && <button className="button button-primary button-full" disabled={Boolean(busy)} onClick={issuePermit}>Issue permit for {selected ? formatRupees(selected.pricePaise + selected.shippingPaise + selected.taxPaise) : 'this cart'}</button>}
    {permit && <div className="permit-box"><span>Payment Guardian permit</span><b>{permit.cart.sku} · {formatRupees(permit.cart.amountPaise)}</b><small>Single use · expires {new Date(permit.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>{!receipt && <button className="button button-primary button-full" disabled={Boolean(busy)} onClick={pay}>{payment ? 'Finish payment' : 'Pay protected amount'}</button>}</div>}
    {receipt && <div className="receipt-mini"><CheckCircle2 size={18} /><div><b>{receipt.kind === 'PAYMENT_BLOCKED' ? 'Payment stopped safely' : 'Signed receipt ready'}</b><small>Audit evidence is available in the proof view.</small></div></div>}
  </section>;
}

function ShopPage({ proofOnly = false, initialSessionId }: { proofOnly?: boolean; initialSessionId?: string }) {
  const session = useConciergeSession(initialSessionId);
  const { messages, intentDraft, intent, selected, products, busy, error, send, confirm, sessionId } = session;
  return <div className="app-page"><SiteHeader /><main className="shop-shell"><div className="shop-title"><div><p className="eyebrow">Buyer concierge</p><h1>{proofOnly ? 'Your ChoiceProof record' : 'Shop with an AI that can explain itself.'}</h1></div>{sessionId && <button className="text-button" onClick={() => navigate(`/proof/${sessionId}`)}>Open proof record</button>}</div>{error && <div className="inline-error"><AlertCircle size={17} />{error}<button onClick={() => session.open(sessionId)}>Retry</button></div>}
    <div className="concierge-layout"><section className="chat-panel"><div className="chat-panel-head"><div><span className="live-indicator" />ChoiceProof Concierge</div><small>{busy || (session.connected ? 'Connected to verification service' : 'Connecting')}</small></div><div className="chat-scroll">{messages.length ? messages.map((message) => <article key={message.id} className={`message ${message.role === 'USER' ? 'buyer' : 'assistant'}`}><span>{message.role === 'USER' ? 'You' : 'ChoiceProof'}</span><p>{message.text}</p></article>) : <div className="chat-welcome"><Sparkles size={25} /><h2>What would you like to buy?</h2><p>I will turn your request into clear rules before any AI recommendation is allowed.</p><button className="suggestion" disabled={Boolean(busy)} onClick={() => send(session.examplePrompt)}>{session.examplePrompt}</button></div>}{busy && <div className="message assistant loading-message"><span>ChoiceProof</span><p>{busy}<i /><i /><i /></p></div>}{selected && <div className="chat-recommendation"><p>Recommended product</p><ProductCard product={selected} selected /></div>}</div>{!proofOnly && <ChatComposer onSend={send} disabled={Boolean(busy)} />}</section>
      <aside className="evidence-rail"><IntentPanel draft={intentDraft} intent={intent} onConfirm={confirm} busy={busy} /><DecisionPanel session={session} /></aside></div>
    {products.length > 0 && <section className="offers-section"><div><p className="eyebrow">Recorded offer set</p><h2>Products the concierge was allowed to consider</h2></div><div className="offers-list">{products.map((product) => <ProductCard key={product.id} product={product} selected={product.id === selected?.id} />)}</div></section>}
  </main></div>;
}

export function ConciergeApp({ route, sessionId }: { route: Route; sessionId?: string }) {
  if (route === 'landing') return <LandingPage />;
  return <ShopPage proofOnly={route === 'proof'} initialSessionId={sessionId} />;
}
