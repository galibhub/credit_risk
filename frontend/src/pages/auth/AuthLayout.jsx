import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BrainCircuit, ShieldCheck } from 'lucide-react';
import Logo from '../../components/common/Logo';
import './AuthPages.css';

export default function AuthLayout({
  title,
  subtitle,
  eyebrow,
  children,
  footerText,
  footerLinkText,
  footerLink,
}) {
  return (
    <main className="auth-page">
      <div className="auth-topbar">
        <Logo />
        <Link to="/" className="auth-back-link">
          <ArrowRight size={15} className="back-arrow" />
          Back to home
        </Link>
      </div>

      <div className="auth-container">
        <section className="auth-promo">
          <div className="auth-promo-orbit auth-orbit-one" />
          <div className="auth-promo-orbit auth-orbit-two" />

          <div className="auth-promo-content">
            <span className="auth-eyebrow">
              <span className="auth-eyebrow-dot" />
              CREDIT INTELLIGENCE WORKSPACE
            </span>

            <h1>
              Understand risk.
              <br />
              <span>Make sense</span> of every prediction.
            </h1>

            <p>
              A unified workspace for machine learning-based
              credit risk assessment and explainable insights.
            </p>

            <div className="auth-benefits">
              <div>
                <span className="auth-benefit-icon">
                  <ShieldCheck size={17} />
                </span>
                <span>
                  <strong>Explainable predictions</strong>
                  <small>Understand the factors behind results.</small>
                </span>
              </div>

              <div>
                <span className="auth-benefit-icon">
                  <BrainCircuit size={17} />
                </span>
                <span>
                  <strong>Machine learning insights</strong>
                  <small>Explore local and global explanations.</small>
                </span>
              </div>

              <div>
                <span className="auth-benefit-icon">
                  <BarChart3 size={17} />
                </span>
                <span>
                  <strong>Assessment workspace</strong>
                  <small>Review and manage your assessments.</small>
                </span>
              </div>
            </div>
          </div>

          <div className="auth-promo-footer">
            <ShieldCheck size={14} />
            Explainability at every step
          </div>
        </section>

        <section className="auth-form-area">
          <div className="auth-form-card">
            <span className="auth-form-eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
            <p className="auth-form-subtitle">{subtitle}</p>

            {children}

            <div className="auth-switch">
              <span>{footerText}</span>
              <Link to={footerLink}>{footerLinkText}</Link>
            </div>
          </div>
        </section>
      </div>

      <div className="auth-bottom">
        <span>© {new Date().getFullYear()} CredLens</span>
        <span>Explainable Credit Risk Assessment</span>
      </div>
    </main>
  );
}