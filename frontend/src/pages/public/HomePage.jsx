import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Check,
  Database,
  FileSearch,
  Gauge,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

const features = [
  {
    number: "01",
    title: "Credit Risk Assessment",
    description:
      "Submit applicant financial details and receive an ML-based risk prediction.",
    icon: Gauge,
    color: "blue",
  },
  {
    number: "02",
    title: "Explainable Predictions",
    description:
      "Explore local SHAP explanations to understand which features influenced a prediction.",
    icon: FileSearch,
    color: "coral",
  },
  {
    number: "03",
    title: "Model Insights",
    description:
      "Explore global SHAP feature importance and understand overall model behavior.",
    icon: BarChart3,
    color: "green",
  },
];

const steps = [
  {
    number: "01",
    title: "Enter Applicant Data",
    description: "Provide the applicant's financial and credit information.",
  },
  {
    number: "02",
    title: "Generate Prediction",
    description: "The trained ML model evaluates the supplied information.",
  },
  {
    number: "03",
    title: "Explore Explanations",
    description: "Inspect the key features contributing to the prediction.",
  },
];

const platformItems = [
  { icon: BrainCircuit, value: "ML", title: "Prediction", desc: "Machine learning" },
  { icon: FileSearch, value: "SHAP", title: "Local explanations", desc: "Per-assessment" },
  { icon: BarChart3, value: "SHAP", title: "Global insights", desc: "Model-level" },
  { icon: ShieldCheck, value: "RBAC", title: "Secure access", desc: "User & Admin" },
];

function HeroDashboard() {
  return (
    <div className="hero-visual">
      <div className="visual-orbit orbit-one" />
      <div className="visual-orbit orbit-two" />
      <div className="visual-grid" />

      <div className="floating-card floating-risk">
        <span className="floating-label">SAMPLE PROBABILITY</span>
        <strong>1.74%</strong>
        <span className="risk-chip"><Check size={12} /> Low Risk</span>
      </div>

      <div className="dashboard-preview">
        <div className="dashboard-top">
          <div className="preview-logo">
            <span><ShieldCheck size={17} /></span>
            <strong>CredLens</strong>
          </div>
          <span className="preview-avatar">JD</span>
        </div>

        <div className="preview-layout">
          <div className="preview-sidebar">
            <span className="side-active"><Gauge size={13} /> Overview</span>
            <span><FileSearch size={13} /> Assessment</span>
            <span><BarChart3 size={13} /> Insights</span>
            <span><Database size={13} /> History</span>
          </div>

          <div className="preview-content">
            <div className="preview-content-heading">
              <div>
                <span>ASSESSMENT RESULT</span>
                <strong>Credit risk overview</strong>
              </div>
              <span className="sample-label">SAMPLE</span>
            </div>

            <div className="preview-probability-card">
              <div className="probability-ring">
                <div>
                  <strong>1.74%</strong>
                  <span>Probability</span>
                </div>
              </div>
              <div className="probability-info">
                <span className="risk-chip"><Check size={12} /> Low Risk</span>
                <small>Prediction result</small>
              </div>
            </div>

            <div className="preview-factor-card">
              <div className="preview-factor-heading">
                <strong>Top contributing factors</strong>
                <span>SHAP</span>
              </div>
              {[
                { label: "Income", width: "82%", color: "green" },
                { label: "Loan ratio", width: "66%", color: "blue" },
                { label: "Interest rate", width: "45%", color: "coral" },
              ].map((item) => (
                <div className="mini-factor" key={item.label}>
                  <span>{item.label}</span>
                  <div className="mini-track">
                    <span className={item.color} style={{ width: item.width }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="preview-bottom">
              <span><BrainCircuit size={12} /> ML prediction</span>
              <span><ShieldCheck size={12} /> Explainable</span>
            </div>
          </div>
        </div>
      </div>

      <div className="floating-card floating-shap">
        <span className="shap-icon"><Sparkles size={19} /></span>
        <div>
          <strong>Explainable by SHAP</strong>
          <small>Understand prediction drivers</small>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ feature }) {
  const Icon = feature.icon;

  return (
    <article className="feature-card">
      <div className={`feature-icon ${feature.color}`}>
        <Icon size={24} strokeWidth={1.8} />
      </div>
      <span className="feature-number">{feature.number}</span>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
      <a href="#how-it-works" aria-label={`Learn about ${feature.title}`}>
        Explore <ArrowUpRight size={15} />
      </a>
    </article>
  );
}

function ProcessSection() {
  return (
    <section className="process-section" id="how-it-works">
      <div className="container process-inner">
        <div className="process-heading">
          <span className="section-kicker dark-kicker">
            <Workflow size={14} /> THE ASSESSMENT WORKFLOW
          </span>
          <h2>From applicant data to <span>explainable decisions.</span></h2>
          <p>
            A structured workflow that turns applicant information
            into an interpretable credit risk prediction.
          </p>
        </div>

        <div className="process-grid">
          {steps.map((step, index) => (
            <article className="process-card" key={step.number}>
              <span className="process-number">{step.number}</span>
              <div className="process-card-icon">
                {index === 0 && <Database size={22} />}
                {index === 1 && <BrainCircuit size={22} />}
                {index === 2 && <FileSearch size={22} />}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {index < steps.length - 1 && (
                <span className="process-arrow"><ArrowRight size={16} /></span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformStrip() {
  return (
    <section className="container platform-strip">
      {platformItems.map((item) => {
        const Icon = item.icon;
        return (
          <div className="platform-item" key={item.title}>
            <span className="platform-icon"><Icon size={23} /></span>
            <div>
              <strong>{item.value}</strong>
              <span>{item.title}</span>
              <small>{item.desc}</small>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function InsightsSection() {
  return (
    <section className="container insights-section" id="insights">
      <div className="insights-copy">
        <span className="section-kicker">
          <Sparkles size={14} /> MODEL TRANSPARENCY
        </span>
        <h2>See beyond the <span>risk label.</span></h2>
        <p>
          CredLens combines prediction results with feature-level
          explanations, helping users explore what contributes
          to an individual model output.
        </p>
        <a className="btn btn-primary" href="/login">
          Explore the workspace <ArrowRight size={16} />
        </a>
      </div>

      <div className="insights-preview">
        <div className="insights-widget score-widget">
          <span className="widget-title">Risk assessment</span>
          <strong className="widget-value">1.74%</strong>
          <span className="widget-caption">Illustrative probability</span>
          <div className="widget-progress"><span /></div>
          <span className="risk-chip"><Check size={12} /> Low Risk</span>
        </div>

        <div className="insights-widget shap-widget">
          <div className="widget-title-row">
            <span className="widget-title">Feature contribution</span>
            <span className="sample-label">SAMPLE</span>
          </div>
          {[
            { label: "Income", value: 80, color: "green" },
            { label: "Loan ratio", value: 62, color: "blue" },
            { label: "Interest rate", value: 39, color: "coral" },
            { label: "Employment", value: 31, color: "blue" },
          ].map((item) => (
            <div className="shap-row" key={item.label}>
              <span>{item.label}</span>
              <div className="shap-track">
                <span className={item.color} style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="insights-widget summary-widget">
          <span className="widget-title">Assessment summary</span>
          {[
            ["Risk classification", "Low Risk"],
            ["Prediction", "0"],
            ["Explanation", "Local SHAP"],
          ].map(([label, value]) => (
            <div className="summary-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      <p className="insights-note">
        Preview values are illustrative, not live applicant results.
      </p>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="container cta-section" id="get-started">
      <div className="cta-content">
        <span className="section-kicker dark-kicker">
          <ShieldCheck size={14} /> CREDLENS WORKSPACE
        </span>
        <h2>Make every prediction <span>understandable.</span></h2>
        <p>
          Explore machine learning-based credit risk assessment
          and explainable model insights in one workspace.
        </p>
        <a href="/register" className="btn btn-accent">
          Get started <ArrowRight size={16} />
        </a>
      </div>
      <div className="cta-art" aria-hidden="true">
        <div className="cta-orbit" />
        <div className="cta-shield"><ShieldCheck size={65} /></div>
        <div className="cta-mini-card"><BarChart3 size={22} /></div>
        <div className="cta-mini-dot" />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="container hero-wrap" id="top">
        <div className="hero">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="hero-content">
            <span className="hero-kicker">
              <span className="hero-kicker-dot" />
              EXPLAINABLE CREDIT RISK
            </span>

            <h1>
              Credit risk,
              <br />
              explained <span>clearly.</span>
            </h1>

            <p>
              Assess credit risk using machine learning.
              Understand the factors behind every prediction
              with transparent SHAP explanations.
            </p>

            <div className="hero-actions">
              <a href="/register" className="btn btn-accent btn-large">
                Start assessment <ArrowRight size={17} />
              </a>
              <a href="#how-it-works" className="btn btn-dark-outline btn-large">
                How it works <ArrowUpRight size={16} />
              </a>
            </div>

            <div className="hero-trust">
              <span><Check size={15} /> Explainable AI</span>
              <span><Check size={15} /> Local & global SHAP</span>
              <span><Check size={15} /> Secure access</span>
            </div>
          </div>

          <HeroDashboard />
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">
              <ShieldCheck size={14} /> THE CREDLENS PLATFORM
            </span>
            <h2>Credit intelligence, built around you.</h2>
            <p>
              A single workspace for prediction, explanation
              and model-level insights.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <FeatureCard key={feature.number} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <ProcessSection />
      <PlatformStrip />
      <InsightsSection />
      <FinalCTA />
    </>
  );
}