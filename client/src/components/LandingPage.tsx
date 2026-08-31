import React from 'react';
import {
  ShieldCheck,
  Lock,
  SearchCheck,
  CreditCard,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Shield,
  ArrowUpRight,
} from './Icons';

interface LandingPageProps {
  onStartDemo: () => void;
  onScrollToWorkflow?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDemo }) => {
  const scrollToFlow = () => {
    const el = document.getElementById('how-it-works-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      {/* Top Navigation */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="brand-group">
            <div className="brand-icon-wrapper">
              <ShieldCheck size={22} className="text-indigo-600" />
            </div>
            <div className="brand-text">
              <span className="brand-name">ChoiceProof Gateway</span>
              <span className="brand-category">Agentic Commerce Verification</span>
            </div>
            <div className="hackathon-badge">
              <span className="pulse-dot"></span>
              Razorpay Buildathon
            </div>
          </div>

          <div className="nav-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={scrollToFlow}
            >
              How It Works
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm btn-glow"
              onClick={onStartDemo}
            >
              Try Demo
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-hero">
        <div className="hero-badge">
          <Sparkles size={14} className="text-indigo-500" />
          <span>Pre-Payment Verification Layer for AI Shopping Agents</span>
        </div>

        <h1 className="hero-title">
          AI agents can shop. <br />
          <span className="text-gradient">ChoiceProof makes sure they pay for the right cart.</span>
        </h1>

        <p className="hero-subtitle">
          Verify an AI agent’s product choice against confirmed user requirements,
          then bind Razorpay payment to the exact approved product, merchant, and amount.
        </p>

        <div className="hero-cta-group">
          <button
            type="button"
            className="btn btn-primary btn-lg btn-glow"
            onClick={onStartDemo}
          >
            Try Demo
            <ArrowRight size={18} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={scrollToFlow}
          >
            See How It Works
          </button>
        </div>

        {/* 3 Core Feature Cards */}
        <div className="hero-feature-grid">
          <div className="feature-card">
            <div className="feature-icon-box icon-indigo">
              <Lock size={22} />
            </div>
            <h3 className="feature-title">1. Intent Lock</h3>
            <p className="feature-text">
              Turn user instructions into confirmed shopping rules.
            </p>
            <div className="feature-tag">Rules Enforcement</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box icon-amber">
              <SearchCheck size={22} />
            </div>
            <h3 className="feature-title">2. Choice Audit</h3>
            <p className="feature-text">
              Verify the selected product against observed offers.
            </p>
            <div className="feature-tag">Stability & Ranking</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box icon-emerald">
              <CreditCard size={22} />
            </div>
            <h3 className="feature-title">3. Payment Guardian</h3>
            <p className="feature-text">
              Allow payment only for the approved cart.
            </p>
            <div className="feature-tag">Razorpay Cryptographic Binding</div>
          </div>
        </div>

        {/* Interactive Flow Diagram Section */}
        <div id="how-it-works-section" className="flow-section-wrapper">
          <div className="section-header-pill">
            <Zap size={14} className="text-indigo-600" />
            <span>Architecture & Verification Pipeline</span>
          </div>
          <h2 className="flow-title">How ChoiceProof Secures Agentic Commerce</h2>
          <p className="flow-subtitle">
            Autonomous AI shopping agents operate in untrusted web environments. ChoiceProof introduces an immutable verification barrier before money moves.
          </p>

          <div className="flow-diagram-card">
            <div className="flow-step">
              <div className="flow-step-num">1</div>
              <div className="flow-step-icon bg-slate-100 text-slate-700">
                <Lock size={18} />
              </div>
              <div className="flow-step-body">
                <span className="flow-step-name">User Intent</span>
                <span className="flow-step-desc">Budget, brand & hard delivery limits</span>
              </div>
            </div>

            <div className="flow-arrow">
              <ArrowRight size={18} />
            </div>

            <div className="flow-step">
              <div className="flow-step-num">2</div>
              <div className="flow-step-icon bg-blue-100 text-blue-700">
                <Sparkles size={18} />
              </div>
              <div className="flow-step-body">
                <span className="flow-step-name">AI Choice</span>
                <span className="flow-step-desc">Agent browses & nominates SKU</span>
              </div>
            </div>

            <div className="flow-arrow">
              <ArrowRight size={18} />
            </div>

            <div className="flow-step highlighted-step">
              <div className="flow-step-num highlight-num">3</div>
              <div className="flow-step-icon bg-indigo-600 text-white">
                <ShieldCheck size={18} />
              </div>
              <div className="flow-step-body">
                <span className="flow-step-name">ChoiceProof</span>
                <span className="flow-step-desc">Rules · Stability · Best offer audit</span>
              </div>
            </div>

            <div className="flow-arrow">
              <ArrowRight size={18} />
            </div>

            <div className="flow-step">
              <div className="flow-step-num">4</div>
              <div className="flow-step-icon bg-emerald-100 text-emerald-700">
                <Shield size={18} />
              </div>
              <div className="flow-step-body">
                <span className="flow-step-name">Payment Permit</span>
                <span className="flow-step-desc">Single-use signed cryptographic permit</span>
              </div>
            </div>

            <div className="flow-arrow">
              <ArrowRight size={18} />
            </div>

            <div className="flow-step">
              <div className="flow-step-num">5</div>
              <div className="flow-step-icon bg-indigo-900 text-white">
                <CreditCard size={18} />
              </div>
              <div className="flow-step-body">
                <span className="flow-step-name">Razorpay</span>
                <span className="flow-step-desc">Strict order validation & test execution</span>
              </div>
            </div>
          </div>

          {/* Key Value Propositions Pill Grid */}
          <div className="value-props-grid">
            <div className="value-prop-item">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>Protects against prompt injections in product catalogs</span>
            </div>
            <div className="value-prop-item">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>Verifies stability by stripping untrusted merchant claims</span>
            </div>
            <div className="value-prop-item">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>Prevents cart mutation attacks before payment creation</span>
            </div>
          </div>
        </div>

        {/* Quick Demo Launch CTA */}
        <div className="demo-banner">
          <div className="demo-banner-content">
            <h3>Ready to see ChoiceProof in action?</h3>
            <p>Explore 3 interactive scenarios: Clean Approval, Questionable Choice review, and Cart Mutation block.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-lg btn-glow"
            onClick={onStartDemo}
          >
            Launch Interactive Dashboard
            <ArrowUpRight size={18} />
          </button>
        </div>

        {/* Disclaimer Footer */}
        <footer className="landing-footer">
          <p className="disclaimer-text">
            Demo prototype. ChoiceProof provides verification signals based on confirmed requirements and observed offers;
            it does not guarantee universal product quality or detect every manipulation attempt.
          </p>
          <div className="footer-credits">
            <span>ChoiceProof Gateway · Razorpay Buildathon 2026</span>
            <span className="footer-dot">·</span>
            <span>AI Growth & Agentic Commerce</span>
          </div>
        </footer>
      </main>
    </div>
  );
};
