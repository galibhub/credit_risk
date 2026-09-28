import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  Info,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

import { getAssessmentDetail } from '../../services/assessmentService';
import './AssessmentDetailsPage.css';

const INPUT_FIELDS = {
  person_age: 'Applicant age',
  person_income: 'Annual income',
  person_emp_length: 'Employment length',
  loan_amnt: 'Loan amount',
  loan_int_rate: 'Interest rate',
  loan_percent_income: 'Loan / income ratio',
  cb_person_cred_hist_length: 'Credit history length',
  person_home_ownership: 'Home ownership',
  loan_intent: 'Loan purpose',
  loan_grade: 'Loan grade',
  cb_person_default_on_file: 'Previous default',
};

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join(', ');
  }

  if (typeof detail === 'string') return detail;

  return error?.message || 'Unable to load assessment details.';
}

function formatPercent(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const number = Number(value);
  if (!Number.isFinite(number)) return '—';

  return `${(number > 1 ? number : number * 100).toFixed(2)}%`;
}

function getPredictionValue(record) {
  const raw = record?.prediction;

  if (raw && typeof raw === 'object') {
    return raw.prediction ?? raw.label ?? raw.class ?? null;
  }

  return raw ?? record?.result?.prediction ?? null;
}

function getRisk(record) {
  const raw =
    record?.risk ??
    record?.result?.risk ??
    record?.prediction?.risk;

  if (typeof raw === 'string') {
    const normalized = raw.toLowerCase();

    if (normalized.includes('high')) return 'High Risk';
    if (normalized.includes('low')) return 'Low Risk';
  }

  const prediction = getPredictionValue(record);

  if (
    prediction === 1 ||
    prediction === true ||
    ['1', 'true', 'high', 'high risk', 'default'].includes(
      String(prediction).toLowerCase()
    )
  ) {
    return 'High Risk';
  }

  if (
    prediction === 0 ||
    prediction === false ||
    ['0', 'false', 'low', 'low risk', 'no default'].includes(
      String(prediction).toLowerCase()
    )
  ) {
    return 'Low Risk';
  }

  return 'Unknown';
}

function getInput(record) {
  return (
    record?.input ??
    record?.inputs ??
    record?.features ??
    record?.input_data ??
    {}
  );
}

function getShap(record) {
  const value =
    record?.shap ??
    record?.shap_values ??
    record?.explanation?.shap ??
    record?.explanation?.shap_values ??
    [];

  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      feature: item?.feature ?? item?.feature_name ?? item?.name,
      value: Number(item?.shap_value ?? item?.value ?? item?.contribution),
    }))
    .filter(
      (item) =>
        typeof item.feature === 'string' &&
        Number.isFinite(item.value)
    )
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatFeatureName(value) {
  if (INPUT_FIELDS[value]) return INPUT_FIELDS[value];

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatInputValue(key, value) {
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }

  if (key === 'loan_int_rate' || key === 'loan_percent_income') {
    return formatPercent(value);
  }

  if (
    key === 'person_age' ||
    key === 'person_emp_length' ||
    key === 'cb_person_cred_hist_length'
  ) {
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value);

    const unit =
      key === 'person_age'
        ? 'years'
        : 'years';

    return `${number.toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })} ${unit}`;
  }

  if (typeof value === 'number') {
    return value.toLocaleString('en-US', {
      maximumFractionDigits: 4,
    });
  }

  return String(value).replace(/_/g, ' ');
}

function getShapWidth(value, maxValue) {
  if (maxValue <= 0) return 0;
  return (Math.abs(value) / maxValue) * 100;
}

function MetricCard({ icon: Icon, label, value, description }) {
  return (
    <div className="ad-metric-card">
      <div className="ad-metric-top">
        <span>{label}</span>
        <div className="ad-metric-icon">
          <Icon size={17} />
        </div>
      </div>
      <strong className="ad-metric-value">{value}</strong>
      {description && (
        <span className="ad-metric-description">{description}</span>
      )}
    </div>
  );
}

export default function AssessmentDetailsPage() {
  const { assessmentId } = useParams();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDetails() {
      setLoading(true);
      setError('');
      setAssessment(null);

      try {
        const response = await getAssessmentDetail(
          assessmentId,
          controller.signal
        );

        const record =
          response?.assessment ??
          response?.result ??
          response?.data ??
          response;

        setAssessment(record);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (assessmentId) fetchDetails();

    return () => controller.abort();
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="ad-page">
        <div className="ad-state">
          <div className="ad-loader" />
          <strong>Loading assessment details</strong>
          <p>Retrieving the saved assessment and its model output...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="ad-page">
        <Link to="/app/history" className="ad-back-link">
          <ArrowLeft size={16} />
          Back to history
        </Link>

        <div className="ad-state ad-error-state">
          <div className="ad-error-icon">!</div>
          <strong>Assessment unavailable</strong>
          <p>
            {error || 'No assessment data was returned by the API.'}
          </p>
        </div>
      </div>
    );
  }

  const probability =
    assessment?.probability ??
    assessment?.failure_probability ??
    assessment?.prediction?.probability ??
    assessment?.result?.probability;

  const threshold =
    assessment?.threshold ??
    assessment?.prediction?.threshold ??
    assessment?.result?.threshold;

  const risk = getRisk(assessment);
  const isHighRisk = risk === 'High Risk';
  const input = getInput(assessment);
  const shap = getShap(assessment);

  const maxShap = Math.max(
    ...shap.map((item) => Math.abs(item.value)),
    0
  );

  const inputEntries = Object.entries(input).sort(([a], [b]) => {
    const keys = Object.keys(INPUT_FIELDS);
    return keys.indexOf(a) - keys.indexOf(b);
  });

  const createdAt =
    assessment?.created_at ??
    assessment?.createdAt ??
    assessment?.timestamp;

  const id =
    assessment?.id ??
    assessment?._id ??
    assessment?.assessment_id ??
    assessmentId;

  return (
    <div className="ad-page">
      <Link to="/app/history" className="ad-back-link">
        <ArrowLeft size={16} />
        Back to history
      </Link>

      <div className="ad-heading">
        <div>
          <div className="ad-eyebrow">
            <Database size={14} />
            SAVED ASSESSMENT
          </div>
          <h1>Assessment Details</h1>
          <p>
            Detailed input, prediction results and model explanation.
          </p>
        </div>
      </div>

      <section
        className={`ad-result-banner ${
          isHighRisk ? 'ad-result-high' : 'ad-result-low'
        }`}
      >
        <div className="ad-result-main">
          <div className="ad-result-icon">
            {isHighRisk ? (
              <ShieldAlert size={23} />
            ) : risk === 'Low Risk' ? (
              <ShieldCheck size={23} />
            ) : (
              <Info size={23} />
            )}
          </div>

          <div>
            <span className="ad-result-label">MODEL PREDICTION</span>
            <h2>{risk}</h2>
            <p>
              {risk === 'High Risk'
                ? 'The model predicted the positive/default class.'
                : risk === 'Low Risk'
                  ? 'The model predicted the negative/non-default class.'
                  : 'The response did not contain a recognizable risk label.'}
            </p>
          </div>
        </div>

        <div className="ad-result-side">
          <span>Assessment ID</span>
          <strong title={String(id)}>
            {String(id).length > 18
              ? `…${String(id).slice(-12)}`
              : String(id)}
          </strong>
        </div>
      </section>

      <div className="ad-metrics">
        <MetricCard
          icon={SlidersHorizontal}
          label="Model probability"
          value={formatPercent(probability)}
          description="Probability returned by the model"
        />

        <MetricCard
          icon={CheckCircle2}
          label="Decision threshold"
          value={formatPercent(threshold)}
          description="Threshold used by the backend"
        />

        <MetricCard
          icon={CalendarDays}
          label="Created at"
          value={formatDate(createdAt)}
          description="Saved assessment date and time"
        />
      </div>

      <div className="ad-content-grid">
        <section className="ad-card ad-input-card">
          <div className="ad-section-heading">
            <div className="ad-section-icon">
              <Database size={18} />
            </div>
            <div>
              <h2>Applicant & loan information</h2>
              <p>Input values saved with this assessment.</p>
            </div>
          </div>

          {inputEntries.length === 0 ? (
            <div className="ad-inline-empty">
              Input details were not included in the API response.
            </div>
          ) : (
            <div className="ad-input-grid">
              {inputEntries.map(([key, value]) => (
                <div className="ad-input-item" key={key}>
                  <span>{formatFeatureName(key)}</span>
                  <strong>{formatInputValue(key, value)}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="ad-card ad-shap-card">
          <div className="ad-section-heading">
            <div className="ad-section-icon ad-shap-icon">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h2>SHAP explanation</h2>
              <p>Feature contributions returned by the model.</p>
            </div>
          </div>

          <div className="ad-shap-legend">
            <span>
              <i className="ad-legend-positive" />
              Positive contribution
            </span>
            <span>
              <i className="ad-legend-negative" />
              Negative contribution
            </span>
          </div>

          {shap.length === 0 ? (
            <div className="ad-inline-empty">
              SHAP values were not included in this API response.
            </div>
          ) : (
            <div className="ad-shap-list">
              {shap.map((item, index) => {
                const positive = item.value >= 0;
                const width = getShapWidth(item.value, maxShap);

                return (
                  <div
                    className="ad-shap-item"
                    key={`${item.feature}-${index}`}
                  >
                    <div className="ad-shap-meta">
                      <span title={item.feature}>
                        {formatFeatureName(item.feature)}
                      </span>
                      <strong
                        className={
                          positive
                            ? 'ad-shap-value-positive'
                            : 'ad-shap-value-negative'
                        }
                      >
                        {positive ? '+' : ''}
                        {item.value.toFixed(5)}
                      </strong>
                    </div>

                    <div className="ad-shap-track">
                      <div
                        className={`ad-shap-bar ${
                          positive
                            ? 'ad-shap-bar-positive'
                            : 'ad-shap-bar-negative'
                        }`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="ad-shap-note">
            <Info size={14} />
            The sign represents the contribution direction in the model's
            SHAP output. It does not, by itself, establish causation.
          </div>
        </section>
      </div>

      <div className="ad-bottom-note">
        <Clock3 size={15} />
        This page displays the saved assessment response. It does not
        rerun the prediction.
      </div>
    </div>
  );
}