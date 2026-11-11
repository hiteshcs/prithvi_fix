import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck, Clock, FileText, Search, ChevronDown, ChevronUp,
  Zap, Flame, Fan, Wrench, Settings, Package, ArrowRight,
  IndianRupee, CheckCircle2, BadgePercent, Users, Heart,
  Sparkles, X, Info
} from 'lucide-react';
import {
  MODEL_9325,
  SURAKSHA_PROTECTION,
  RATE_CARD_TRADES,
  AC_RATE_CARD_SECTIONS,
  calculate9325Split
} from '../data/rateCardData';

const ICON_MAP = {
  ShieldCheck, ClockCheck: Clock, FileText,
  Zap, Flame, Fan, Wrench, Settings, Package
};

const SECTION_ICONS = {
  electrical_parts: Zap,
  gas_charging: Flame,
  fan_motors: Fan,
  service_installation: Settings,
  minor_repairs: Wrench,
  other_parts: Package
};

export default function RateCard() {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTrade, setActiveTrade] = useState('ac');
  const [expandedSections, setExpandedSections] = useState({});
  const [showSplitFor, setShowSplitFor] = useState(null);

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all = {};
    AC_RATE_CARD_SECTIONS.forEach(s => { all[s.id] = true; });
    setExpandedSections(all);
  };

  const collapseAll = () => setExpandedSections({});

  // Filter items across all sections based on search
  const filteredSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return AC_RATE_CARD_SECTIONS;

    return AC_RATE_CARD_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
      )
    })).filter(section => section.items.length > 0);
  }, [searchQuery]);

  const totalItems = AC_RATE_CARD_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const filteredCount = filteredSections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="rate-card-page">
      {/* ── Hero Section ── */}
      <section className="rc-hero">
        <div className="rc-container">
          <div className="rc-hero-badge">
            <ShieldCheck size={14} />
            <span>{t('rcBadge', 'Regulated Cooperative Tariffs')}</span>
          </div>
          <h1 className="rc-hero-title">
            {t('rcHeroTitle', 'Transparent Rate Card')}
          </h1>
          <p className="rc-hero-sub">
            {t('rcHeroSub', 'Fixed cooperative prices with the 93-2-5 model. No surge, no hidden fees.')}
          </p>
        </div>
      </section>

      {/* ── Suraksha Protection Cover (3 cards) ── */}
      <section className="rc-section">
        <div className="rc-container">
          <div className="rc-section-header">
            <span className="rc-label-badge">
              <ShieldCheck size={13} />
              {t('rcShramSuraksha', 'Prithvi Suraksha Cover')}
            </span>
            <h2 className="rc-section-title">{t('rcEndToEnd', 'End-to-End Service Protection')}</h2>
            <p className="rc-section-sub">{t('rcBacking', 'Every booking is backed by our cooperative safety net')}</p>
          </div>

          <div className="rc-cover-grid">
            {SURAKSHA_PROTECTION.cards.map((card) => {
              const IconComp = ICON_MAP[card.icon] || ShieldCheck;
              const colorMap = {
                warranty: { bg: '#ecfdf5', border: '#a7f3d0', icon: '#059669', badge: '#065f46' },
                verified_quotes: { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb', badge: '#1e40af' },
                rate_card: { bg: '#fffbeb', border: '#fde68a', icon: '#d97706', badge: '#92400e' }
              };
              const colors = colorMap[card.id] || colorMap.warranty;

              return (
                <div key={card.id} className="rc-cover-card" style={{ borderColor: colors.border }}>
                  <div className="rc-cover-card-header">
                    <div className="rc-cover-icon" style={{ background: colors.bg, color: colors.icon }}>
                      <IconComp size={20} />
                    </div>
                    <div>
                      <span className="rc-cover-badge" style={{ background: colors.bg, color: colors.badge }}>
                        {card.badge}
                      </span>
                      <h3 className="rc-cover-title">{card.title}</h3>
                    </div>
                  </div>
                  <ul className="rc-cover-features">
                    {card.features.map((f, i) => (
                      <li key={i}>
                        <CheckCircle2 size={14} style={{ color: colors.icon, flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <div className="rc-feature-title">{f.title}</div>
                          <div className="rc-feature-desc">{f.desc}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 93-2-5 Model Banner ── */}
      <section className="rc-model-banner">
        <div className="rc-container">
          <div className="rc-model-card">
            <div className="rc-model-header">
              <BadgePercent size={20} />
              <h3>93-2-5 Cooperative Tariff Model</h3>
            </div>
            <div className="rc-model-splits">
              <div className="rc-split-item rc-split-artisan">
                <div className="rc-split-pct">93%</div>
                <div className="rc-split-label">
                  <Users size={14} />
                  Direct to Artisan
                </div>
              </div>
              <div className="rc-split-item rc-split-platform">
                <div className="rc-split-pct">2%</div>
                <div className="rc-split-label">
                  <Settings size={14} />
                  Platform Ops
                </div>
              </div>
              <div className="rc-split-item rc-split-welfare">
                <div className="rc-split-pct">5%</div>
                <div className="rc-split-label">
                  <Heart size={14} />
                  Social Security
                </div>
              </div>
            </div>
            <div className="rc-model-notice">
              <Info size={14} />
              <span>Labour capped at ₹199–₹349 (vs ₹499 on commercial apps). Zero surge pricing.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Rate Card Section ── */}
      <section className="rc-section rc-rates-section">
        <div className="rc-container">
          <div className="rc-section-header">
            <h2 className="rc-section-title">Itemized Rate Card</h2>
            <p className="rc-section-sub">
              {totalItems} regulated items • ISI standard parts • Capped labour fees
            </p>
          </div>

          {/* Trade Tabs */}
          <div className="rc-trade-tabs">
            {RATE_CARD_TRADES.map(trade => (
              <button
                key={trade.id}
                className={`rc-trade-tab ${activeTrade === trade.id ? 'active' : ''} ${!trade.active && trade.id !== 'ac' ? 'disabled' : ''}`}
                onClick={() => trade.id === 'ac' && setActiveTrade(trade.id)}
                disabled={trade.id !== 'ac'}
              >
                {trade.name}
                {trade.id !== 'ac' && <span className="rc-coming-soon">Soon</span>}
              </button>
            ))}
          </div>

          {/* Search + Controls */}
          <div className="rc-search-bar">
            <div className="rc-search-input-wrap">
              <Search size={16} className="rc-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('rcSearchPlaceholder', 'Search parts, repairs, services...')}
                className="rc-search-input"
              />
              {searchQuery && (
                <button className="rc-search-clear" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="rc-search-controls">
              <button className="rc-control-btn" onClick={expandAll}>{t('rcExpandAll', 'Expand All')}</button>
              <button className="rc-control-btn" onClick={collapseAll}>{t('rcCollapseAll', 'Collapse All')}</button>
              {searchQuery && (
                <span className="rc-result-count">
                  {filteredCount} of {totalItems} items
                </span>
              )}
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="rc-accordion-list">
            {filteredSections.length === 0 ? (
              <div className="rc-empty-state">
                <Search size={32} />
                <p>No items match "<strong>{searchQuery}</strong>"</p>
                <button className="rc-control-btn" onClick={() => setSearchQuery('')}>Clear Search</button>
              </div>
            ) : (
              filteredSections.map(section => {
                const isOpen = expandedSections[section.id] || (searchQuery.length > 0);
                const SectionIcon = SECTION_ICONS[section.id] || Package;

                return (
                  <div key={section.id} className={`rc-accordion ${isOpen ? 'open' : ''}`}>
                    <button
                      className="rc-accordion-trigger"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="rc-accordion-left">
                        <SectionIcon size={18} />
                        <span className="rc-accordion-title">{section.title}</span>
                        <span className="rc-accordion-count">{section.items.length}</span>
                      </div>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {isOpen && (
                      <div className="rc-accordion-body">
                        {/* Desktop Table Header */}
                        <div className="rc-table-header">
                          <div className="rc-th rc-th-name">Service / Part</div>
                          <div className="rc-th rc-th-parts">Parts</div>
                          <div className="rc-th rc-th-labour">Labour</div>
                          <div className="rc-th rc-th-total">Coop Total</div>
                          <div className="rc-th rc-th-compare">Commercial</div>
                          <div className="rc-th rc-th-action"></div>
                        </div>

                        {section.items.map((item, idx) => {
                          const split = calculate9325Split(item.coopTotal);
                          const savings = item.commercialPrice - item.coopTotal;
                          const savingsPct = Math.round((savings / item.commercialPrice) * 100);
                          const isShowingSplit = showSplitFor === `${section.id}-${idx}`;

                          return (
                            <div key={idx} className="rc-item-row">
                              <div className="rc-item-main">
                                {/* Name & Description */}
                                <div className="rc-item-name-cell">
                                  <div className="rc-item-name">{item.name}</div>
                                  <div className="rc-item-desc">{item.desc}</div>
                                  <div className="rc-item-warranty">
                                    <ShieldCheck size={11} />
                                    {item.warranty} Warranty
                                  </div>
                                </div>

                                {/* Parts Price */}
                                <div className="rc-item-cell rc-cell-parts">
                                  <span className="rc-cell-label">Parts</span>
                                  <span className="rc-cell-value">₹{item.partPrice.toLocaleString()}</span>
                                </div>

                                {/* Labour Fee */}
                                <div className="rc-item-cell rc-cell-labour">
                                  <span className="rc-cell-label">Labour</span>
                                  <span className="rc-cell-value">
                                    {item.labourFee === 0 ? 'Free' : `₹${item.labourFee}`}
                                  </span>
                                </div>

                                {/* Cooperative Total */}
                                <div className="rc-item-cell rc-cell-total">
                                  <span className="rc-cell-label">Total</span>
                                  <span className="rc-cell-value rc-price-coop">
                                    ₹{item.coopTotal.toLocaleString()}
                                  </span>
                                </div>

                                {/* Commercial Comparison */}
                                <div className="rc-item-cell rc-cell-compare">
                                  <span className="rc-cell-label">Others</span>
                                  <span className="rc-cell-value">
                                    <span className="rc-price-strike">₹{item.commercialPrice.toLocaleString()}</span>
                                    <span className="rc-savings-badge">-{savingsPct}%</span>
                                  </span>
                                </div>

                                {/* Action */}
                                <div className="rc-item-cell rc-cell-action">
                                  <button
                                    className="rc-split-toggle"
                                    onClick={() => setShowSplitFor(isShowingSplit ? null : `${section.id}-${idx}`)}
                                    title="View 93-2-5 split"
                                  >
                                    <BadgePercent size={14} />
                                  </button>
                                  <Link to="/book-service" className="rc-book-btn">
                                    Book <ArrowRight size={13} />
                                  </Link>
                                </div>
                              </div>

                              {/* 93-2-5 Split Dropdown */}
                              {isShowingSplit && (
                                <div className="rc-split-detail">
                                  <div className="rc-split-row">
                                    <span>Artisan Wallet (93%)</span>
                                    <strong>₹{split.artisanShare.toLocaleString()}</strong>
                                  </div>
                                  <div className="rc-split-row">
                                    <span>Platform Operations (2%)</span>
                                    <strong>₹{split.platformFee.toLocaleString()}</strong>
                                  </div>
                                  <div className="rc-split-row">
                                    <span>Social Security Fund (5%)</span>
                                    <strong>₹{split.welfareFund.toLocaleString()}</strong>
                                  </div>
                                  <div className="rc-split-row rc-split-savings">
                                    <span>You Save vs Commercial</span>
                                    <strong className="rc-text-green">₹{savings.toLocaleString()}</strong>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom CTA */}
          <div className="rc-bottom-cta">
            <p>Can't find your service? Describe your issue and we'll match the right artisan.</p>
            <Link to="/book-service" className="rc-cta-btn">
              <Sparkles size={16} />
              Book a Service
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        /* ── Rate Card Page Styles ── */
        .rate-card-page {
          min-height: 100vh;
          background: #f8fafc;
        }

        .rc-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ── Hero ── */
        .rc-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 48px 0 40px;
          text-align: center;
        }

        .rc-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(16, 185, 129, 0.15);
          color: #6ee7b7;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 20px;
          border: 1px solid rgba(16, 185, 129, 0.25);
          margin-bottom: 16px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .rc-hero-title {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }

        .rc-hero-sub {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
          max-width: 460px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* ── Section Headers ── */
        .rc-section {
          padding: 40px 0;
        }

        .rc-section-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .rc-label-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          color: #059669;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 4px 12px;
          border-radius: 16px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .rc-section-title {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px;
        }

        .rc-section-sub {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        /* ── Suraksha Cover Grid ── */
        .rc-cover-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 768px) {
          .rc-cover-grid {
            grid-template-columns: 1fr;
          }
        }

        .rc-cover-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          transition: box-shadow 0.2s, transform 0.2s;
        }

        .rc-cover-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }

        .rc-cover-card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .rc-cover-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rc-cover-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 4px;
        }

        .rc-cover-title {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.3;
        }

        .rc-cover-features {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .rc-cover-features li {
          display: flex;
          gap: 8px;
          font-size: 12px;
          line-height: 1.4;
        }

        .rc-feature-title {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1px;
        }

        .rc-feature-desc {
          color: #64748b;
          font-size: 11px;
          line-height: 1.4;
        }

        /* ── 93-2-5 Model Banner ── */
        .rc-model-banner {
          padding: 0 0 20px;
        }

        .rc-model-card {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          border-radius: 14px;
          padding: 24px;
          color: #fff;
        }

        .rc-model-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          color: #fbbf24;
        }

        .rc-model-header h3 {
          font-size: 15px;
          font-weight: 700;
          margin: 0;
          color: #fff;
        }

        .rc-model-splits {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        @media (max-width: 480px) {
          .rc-model-splits { flex-direction: column; }
        }

        .rc-split-item {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 14px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .rc-split-pct {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -1px;
          line-height: 1;
          margin-bottom: 6px;
        }

        .rc-split-artisan .rc-split-pct { color: #34d399; }
        .rc-split-platform .rc-split-pct { color: #60a5fa; }
        .rc-split-welfare .rc-split-pct { color: #fbbf24; }

        .rc-split-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 11px;
          color: #94a3b8;
          font-weight: 600;
        }

        .rc-model-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #94a3b8;
          background: rgba(255,255,255,0.04);
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .rc-model-notice svg { color: #fbbf24; flex-shrink: 0; }

        /* ── Trade Tabs ── */
        .rc-rates-section {
          padding-top: 20px;
          padding-bottom: 60px;
        }

        .rc-trade-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 16px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .rc-trade-tab {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #475569;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }

        .rc-trade-tab.active {
          background: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }

        .rc-trade-tab.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rc-coming-soon {
          font-size: 9px;
          background: #fef3c7;
          color: #92400e;
          padding: 1px 6px;
          border-radius: 6px;
          font-weight: 800;
          text-transform: uppercase;
        }

        /* ── Search Bar ── */
        .rc-search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .rc-search-input-wrap {
          flex: 1;
          min-width: 240px;
          position: relative;
        }

        .rc-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .rc-search-input {
          width: 100%;
          padding: 10px 36px 10px 38px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13px;
          background: #fff;
          outline: none;
          transition: border-color 0.15s;
        }

        .rc-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .rc-search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: #f1f5f9;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
        }

        .rc-search-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rc-control-btn {
          font-size: 11px;
          font-weight: 600;
          color: #3b82f6;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }

        .rc-control-btn:hover {
          background: #dbeafe;
        }

        .rc-result-count {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
          white-space: nowrap;
        }

        /* ── Accordions ── */
        .rc-accordion-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rc-accordion {
          background: #fff;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }

        .rc-accordion.open {
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .rc-accordion-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          color: #1e293b;
          transition: background 0.1s;
        }

        .rc-accordion-trigger:hover {
          background: #f8fafc;
        }

        .rc-accordion-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .rc-accordion-left svg { color: #3b82f6; }

        .rc-accordion-title {
          font-weight: 700;
          font-size: 13px;
        }

        .rc-accordion-count {
          font-size: 10px;
          background: #f1f5f9;
          color: #64748b;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 700;
        }

        /* ── Table / Item Rows ── */
        .rc-accordion-body {
          border-top: 1px solid #f1f5f9;
        }

        .rc-table-header {
          display: grid;
          grid-template-columns: 1fr 80px 80px 95px 100px 90px;
          gap: 8px;
          padding: 8px 18px;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
        }

        @media (max-width: 768px) {
          .rc-table-header { display: none; }
        }

        .rc-th {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .rc-item-row {
          border-bottom: 1px solid #f8fafc;
          transition: background 0.1s;
        }

        .rc-item-row:last-child { border-bottom: none; }
        .rc-item-row:hover { background: #fafbfd; }

        .rc-item-main {
          display: grid;
          grid-template-columns: 1fr 80px 80px 95px 100px 90px;
          gap: 8px;
          padding: 12px 18px;
          align-items: center;
        }

        @media (max-width: 768px) {
          .rc-item-main {
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }
          .rc-item-name-cell {
            grid-column: 1 / -1;
          }
        }

        .rc-item-name {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .rc-item-desc {
          font-size: 11px;
          color: #94a3b8;
          line-height: 1.4;
          margin-bottom: 3px;
        }

        .rc-item-warranty {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          color: #059669;
          font-weight: 600;
        }

        .rc-item-cell {
          display: flex;
          flex-direction: column;
        }

        .rc-cell-label {
          display: none;
          font-size: 9px;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 1px;
        }

        @media (max-width: 768px) {
          .rc-cell-label { display: block; }
        }

        .rc-cell-value {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }

        .rc-price-coop {
          color: #059669;
          font-size: 15px;
          font-weight: 800;
        }

        .rc-price-strike {
          text-decoration: line-through;
          color: #94a3b8;
          font-weight: 500;
          font-size: 12px;
        }

        .rc-savings-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          color: #dc2626;
          background: #fef2f2;
          padding: 1px 5px;
          border-radius: 4px;
          margin-left: 4px;
        }

        .rc-cell-action {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-direction: row;
        }

        .rc-split-toggle {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.15s;
        }

        .rc-split-toggle:hover {
          background: #eff6ff;
          color: #3b82f6;
          border-color: #bfdbfe;
        }

        .rc-book-btn {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          background: #059669;
          padding: 6px 10px;
          border-radius: 6px;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.15s;
        }

        .rc-book-btn:hover {
          background: #047857;
        }

        /* ── Split Detail Row ── */
        .rc-split-detail {
          display: flex;
          gap: 0;
          padding: 8px 18px 12px;
          background: #f0f9ff;
          border-top: 1px solid #e0f2fe;
          flex-wrap: wrap;
        }

        .rc-split-row {
          flex: 1;
          min-width: 140px;
          display: flex;
          flex-direction: column;
          padding: 6px 12px;
          font-size: 11px;
        }

        .rc-split-row span {
          color: #64748b;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .rc-split-row strong {
          color: #1e293b;
          font-size: 14px;
        }

        .rc-split-savings strong {
          color: #059669;
        }

        .rc-text-green { color: #059669 !important; }

        /* ── Empty State ── */
        .rc-empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #94a3b8;
        }

        .rc-empty-state p {
          margin: 12px 0 16px;
          font-size: 14px;
          color: #64748b;
        }

        /* ── Bottom CTA ── */
        .rc-bottom-cta {
          text-align: center;
          margin-top: 32px;
          padding: 24px;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .rc-bottom-cta p {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 12px;
        }

        .rc-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #059669, #047857);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 24px;
          border-radius: 10px;
          text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .rc-cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(5,150,105,0.3);
        }
      `}</style>
    </div>
  );
}
