import React, { useEffect, useState } from 'react';
import type { ExcludedProduct, ProductOffer, ScenarioId } from '../types/choiceproof';
import {
  CATALOG_SCAN_SUMMARY,
  EXCLUDED_PRODUCTS,
  HARD_REQUIREMENT_CHIPS,
  MOCK_PRODUCTS,
  getEligibleProductBadges,
} from '../data/mockData';
import { ProductOfferCard } from './ProductOfferCard';
import {
  ArrowDown,
  Ban,
  ListFilter,
  Package,
  ScanSearch,
  SlidersHorizontal,
  Sparkles,
  XCircle,
} from './Icons';

interface VerifiedOffersColumnProps {
  currentScenario: ScenarioId;
  selectedProductId: string;
  isIntentConfirmed: boolean;
  eligibleProducts?: ProductOffer[];
  excludedProducts?: ExcludedProduct[];
  scannedCount?: number;
}

type CatalogTab = 'eligible' | 'excluded';

export const VerifiedOffersColumn: React.FC<VerifiedOffersColumnProps> = ({
  currentScenario,
  selectedProductId,
  isIntentConfirmed,
  eligibleProducts = MOCK_PRODUCTS,
  excludedProducts = EXCLUDED_PRODUCTS,
  scannedCount,
}) => {
  const [activeTab, setActiveTab] = useState<CatalogTab>('eligible');
  const eligibleCount = eligibleProducts.length;
  const excludedCount = excludedProducts.length;
  const scanned = scannedCount || eligibleCount + excludedCount || CATALOG_SCAN_SUMMARY.scanned;

  useEffect(() => {
    setActiveTab('eligible');
  }, [currentScenario]);

  return (
    <div className={`column-card step-card ${!isIntentConfirmed ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="step-card-header">
        <div className="step-badge">Step 2</div>
        <h3 className="step-title">AI Catalog Filter</h3>
      </div>
      <p className="step-subtitle">
        AI first filters the full catalog using confirmed hard requirements before choosing a product.
      </p>

      <div className="catalog-analysis-card">
        <div className="catalog-analysis-header">
          <div className="catalog-analysis-icon">
            <ScanSearch size={16} className="text-indigo-600" />
          </div>
          <h4 className="catalog-analysis-title">Catalog Analysis</h4>
        </div>
        <div className="catalog-analysis-stats">
          <div className="catalog-stat">
            <span className="catalog-stat-value">{scanned}</span>
            <span className="catalog-stat-label">products scanned</span>
          </div>
          <div className="catalog-stat catalog-stat-eligible">
            <span className="catalog-stat-value">{eligibleCount}</span>
            <span className="catalog-stat-label">products eligible</span>
          </div>
          <div className="catalog-stat catalog-stat-excluded">
            <span className="catalog-stat-value">{excludedCount}</span>
            <span className="catalog-stat-label">products excluded</span>
          </div>
        </div>

        <div className="catalog-filter-chips">
          {HARD_REQUIREMENT_CHIPS.map((chip) => (
            <span key={chip.id} className="catalog-filter-chip">
              <ListFilter size={12} />
              {chip.label}
            </span>
          ))}
        </div>
        <p className="catalog-filter-caption">
          AI applied your confirmed hard requirements before comparing products.
        </p>
      </div>

      <div className="catalog-pipeline" aria-label="Catalog filtering pipeline">
        <div className="pipeline-node">
          <Package size={14} />
          <span className="pipeline-node-title">Full Catalog</span>
          <span className="pipeline-node-sub">{scanned} products</span>
        </div>
        <div className="pipeline-arrow">
          <ArrowDown size={14} />
        </div>
        <div className="pipeline-node pipeline-node-filter">
          <SlidersHorizontal size={14} />
          <span className="pipeline-node-title">Hard Requirement Filter</span>
          <span className="pipeline-node-sub">Budget · Size · Delivery · Subscription</span>
        </div>
        <div className="pipeline-arrow">
          <ArrowDown size={14} />
        </div>
        <div className="pipeline-node pipeline-node-eligible">
          <ListFilter size={14} />
          <span className="pipeline-node-title">Eligible Offers</span>
          <span className="pipeline-node-sub">{eligibleCount} products</span>
        </div>
        <div className="pipeline-arrow">
          <ArrowDown size={14} />
        </div>
        <div className="pipeline-node">
          <Sparkles size={14} />
          <span className="pipeline-node-title">AI compares preferences</span>
          <span className="pipeline-node-sub">Brand · Price · Delivery · Rating · Warranty</span>
        </div>
        <div className="pipeline-arrow">
          <ArrowDown size={14} />
        </div>
        <div className="pipeline-node pipeline-node-select">
          <Sparkles size={14} />
          <span className="pipeline-node-title">AI Selection</span>
        </div>
      </div>

      <div className="catalog-tabs" role="tablist" aria-label="Catalog product tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'eligible'}
          className={`catalog-tab ${activeTab === 'eligible' ? 'catalog-tab-active' : ''}`}
          onClick={() => setActiveTab('eligible')}
        >
          Eligible Products ({eligibleCount})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'excluded'}
          className={`catalog-tab ${activeTab === 'excluded' ? 'catalog-tab-active' : ''}`}
          onClick={() => setActiveTab('excluded')}
        >
          Excluded Products ({excludedCount})
        </button>
      </div>

      {activeTab === 'eligible' && (
        <div className="catalog-tab-panel">
          <h4 className="catalog-panel-title">Eligible Offers</h4>
          <p className="catalog-panel-sub">{eligibleCount} products match your confirmed hard requirements.</p>
          <div className="products-list">
            {eligibleProducts.map((prod) => (
              <ProductOfferCard
                key={`${prod.id}-${currentScenario}-${selectedProductId}`}
                product={prod}
                badges={getEligibleProductBadges(currentScenario, prod.id)}
                currentScenario={currentScenario}
                defaultExpanded={
                  currentScenario === 'scenario_2' && prod.id === 'prod_premium_x'
                }
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'excluded' && (
        <div className="catalog-tab-panel">
          <h4 className="catalog-panel-title">Excluded Products</h4>
          <p className="catalog-panel-sub">{excludedCount} products did not meet confirmed hard requirements.</p>
          <div className="excluded-products-list">
            {excludedProducts.map((prod) => (
              <div key={prod.id} className="excluded-product-card">
                <div className="excluded-product-top">
                  <div>
                    <div className="product-title-group">
                      <h5 className="excluded-product-name">{prod.name}</h5>
                      <span className="product-brand-tag">{prod.brand}</span>
                    </div>
                    <div className="product-meta-sub">
                      <span>SKU: {prod.sku}</span>
                      <span className="dot-sep">·</span>
                      <span>₹{prod.price.toLocaleString('en-IN')}</span>
                      <span className="dot-sep">·</span>
                      <span>{prod.deliveryDays} days</span>
                      <span className="dot-sep">·</span>
                      <span>Sub: {prod.subscription ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <span className="badge-excluded">
                    <Ban size={12} />
                    {prod.exclusionBadge}
                  </span>
                </div>
                <div className="excluded-reason">
                  <XCircle size={14} />
                  <span>{prod.exclusionReason}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="excluded-footer-note">
            Excluded products are not considered for autonomous payment because they violate confirmed hard requirements.
          </p>
        </div>
      )}
    </div>
  );
};
