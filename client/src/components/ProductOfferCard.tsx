import React, { useState } from 'react';
import type { ProductOffer, ProductBadgeKind, ScenarioId } from '../types/choiceproof';
import { MERCHANT_CONTENT_HIGHLIGHT_PHRASES } from '../data/mockData';
import {
  ShieldCheck,
  Star,
  Truck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from './Icons';

interface ProductOfferCardProps {
  product: ProductOffer;
  badges: ProductBadgeKind[];
  currentScenario: ScenarioId;
  defaultExpanded?: boolean;
}

function highlightMerchantContent(text: string): React.ReactNode {
  const needles = MERCHANT_CONTENT_HIGHLIGHT_PHRASES.filter(Boolean);
  const escaped = needles.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'g');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const isHighlight = needles.includes(part);
    if (isHighlight) {
      return (
        <mark key={`${part}-${index}`} className="injection-highlight">
          {part}
        </mark>
      );
    }
    return <React.Fragment key={`t-${index}`}>{part}</React.Fragment>;
  });
}

const BadgeChip: React.FC<{ kind: ProductBadgeKind }> = ({ kind }) => {
  if (kind === 'eligible') {
    return <span className="badge-eligible">Eligible</span>;
  }
  if (kind === 'ai-selected') {
    return (
      <span className="badge-ai-selected">
        <Sparkles size={12} />
        AI Selected
      </span>
    );
  }
  if (kind === 'better-match') {
    return (
      <span className="badge-better-match">
        <CheckCircle2 size={12} />
        Better Match
      </span>
    );
  }
  if (kind === 'content-risk') {
    return (
      <span className="badge-risk">
        <AlertTriangle size={11} />
        Content Risk
      </span>
    );
  }
  if (kind === 'approved-cart') {
    return (
      <span className="badge-approved-cart">
        <ShieldCheck size={12} />
        Approved Cart
      </span>
    );
  }
  return <span className="badge-nike-preferred">Nike Preferred</span>;
};

export const ProductOfferCard: React.FC<ProductOfferCardProps> = ({
  product,
  badges,
  currentScenario,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isNike = product.id === 'prod_nike_runner';
  const isPremiumX = product.id === 'prod_premium_x';
  const isSelected = badges.includes('ai-selected') || badges.includes('approved-cart');
  const showContentRisk = badges.includes('content-risk');

  let cardBorderClass = 'border-slate-200';
  if (isSelected) {
    if (currentScenario === 'scenario_1') cardBorderClass = 'border-indigo-500 ring-2 ring-indigo-50';
    if (currentScenario === 'scenario_2' && isPremiumX) cardBorderClass = 'border-amber-400 ring-2 ring-amber-50';
    if (currentScenario === 'scenario_3' && isNike) cardBorderClass = 'border-emerald-500 ring-2 ring-emerald-50';
  } else if (showContentRisk) {
    cardBorderClass = 'border-amber-400';
  }

  return (
    <div className={`product-card ${cardBorderClass} ${showContentRisk ? 'product-card-risk' : ''}`}>
      <div className="product-top-row">
        <div>
          <div className="product-title-group">
            <h4 className="product-name">{product.name}</h4>
            <span className="product-brand-tag">{product.brand}</span>
          </div>
          <div className="product-meta-sub">
            <span>ID: {product.catalogId}</span>
            <span className="dot-sep">·</span>
            <span>SKU: {product.sku}</span>
            <span className="dot-sep">·</span>
            <span>Merchant: {product.merchant}</span>
            <span className="dot-sep">·</span>
            <span className="text-emerald-700 font-medium">{product.sizeAvailable}</span>
          </div>
        </div>

        <div className="product-status-badges">
          {badges.map((badge) => (
            <BadgeChip key={badge} kind={badge} />
          ))}
        </div>
      </div>

      <div className="product-metrics-grid product-metrics-grid-extended">
        <div className="metric-box">
          <span className="metric-label">Price</span>
          <span className="metric-value font-semibold">₹{product.price.toLocaleString('en-IN')}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Delivery</span>
          <span className="metric-value flex items-center gap-1">
            <Truck size={13} className="text-slate-500" />
            {product.deliveryDays} days
          </span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Subscription</span>
          <span className="metric-value">{product.subscription ? 'Yes' : 'No'}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Rating</span>
          <span className="metric-value flex items-center gap-1 text-amber-600">
            <Star size={13} />
            {product.rating}
          </span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Warranty</span>
          <span className="metric-value">{product.warrantyMonths} months</span>
        </div>
      </div>

      {currentScenario === 'scenario_1' && isNike && (
        <div className="scenario-feature-pills">
          <span className="pill-badge pill-emerald text-xs">Within Budget</span>
          <span className="pill-badge pill-emerald text-xs">Fast Delivery (2d)</span>
          <span className="pill-badge pill-indigo text-xs">Nike Preferred</span>
        </div>
      )}

      {currentScenario === 'scenario_2' && isNike && (
        <div className="better-match-highlight">
          <span className="better-match-text">
            ⚡ <strong>₹400 cheaper</strong> · <strong>2 days faster</strong> · Matches Nike preference
          </span>
        </div>
      )}

      {isPremiumX && (
        <div className="merchant-content-section">
          <button
            type="button"
            className="merchant-content-toggle"
            onClick={() => setIsExpanded((open) => !open)}
          >
            <span>View Merchant Content</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {isExpanded && (
            <div className={`merchant-content-body ${showContentRisk ? 'merchant-content-untrusted' : ''}`}>
              <div className="merchant-untrusted-label">Merchant Content — Untrusted</div>
              <p className="merchant-desc-text">{highlightMerchantContent(product.description)}</p>
              <div className="untrusted-data-notice">
                <AlertTriangle size={13} className="text-amber-700 flex-shrink-0" />
                <span>Instruction-like merchant content detected. This is treated as untrusted data.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {!isPremiumX && (
        <div className="merchant-content-section">
          <button
            type="button"
            className="merchant-content-toggle"
            onClick={() => setIsExpanded((open) => !open)}
          >
            <span>View Merchant Content</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {isExpanded && (
            <div className="merchant-content-body">
              <p className="merchant-desc-text">{product.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
