import { useState } from 'react';
import {
  ArrowRight,
  Check,
  FileSearch,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createAssessment } from '../../services/assessmentService';
import getApiError from '../../utils/getApiError';
import './NewAssessmentPage.css';

const INITIAL_FORM = {
  person_age: '',
  person_income: '',
  person_emp_length: '',
  loan_amnt: '',
  loan_int_rate: '',
  loan_percent_income: '',
  cb_person_cred_hist_length: '',
  person_home_ownership: 'RENT',
  loan_intent: 'EDUCATION',
  loan_grade: 'B',
  cb_person_default_on_file: 'N',
};

function TextField({
  label,
  name,
  value,
  onChange,
  type = 'number',
  placeholder,
  min,
  step = 'any',
  required = true,
  suffix,
  hint,
}) {
  return (
    <label className="assessment-field">
      <span className="assessment-label">
        {label}
        {required && <span className="required-mark">*</span>}
        {!required && <span className="optional-mark">Optional</span>}
      </span>

      <span className={`assessment-input-wrap ${suffix ? 'has-suffix' : ''}`}>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          step={step}
          required={required}
          autoComplete="off"
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </span>

      {hint && <small className="field-hint">{hint}</small>}
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="assessment-field">
      <span className="assessment-label">
        {label}
        <span className="required-mark">*</span>
      </span>

      <span className="assessment-select-wrap">
        <select name={name} value={value} onChange={onChange} required>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

function FormSection({ number, title, description, children }) {
  return (
    <section className="assessment-form-section">
      <div className="assessment-section-heading">
        <span className="assessment-section-number">{number}</span>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div className="assessment-fields-grid">{children}</div>
    </section>
  );
}

function formatFeatureName(rawName) {
  return String(rawName || 'Unknown feature')
    .replace(/^(num__|cat__)/, '')
    .replaceAll('_', ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return '—';

  return `${(number * 100).toFixed(2)}%`;
}

function getRiskClass(risk) {
  const normalized = String(risk || '').toLowerCase();

  if (normalized.includes('high')) return 'assessment-risk-high';
  if (normalized.includes('medium')) return 'assessment-risk-medium';

  return 'assessment-risk-low';
}

function AssessmentResult({ result }) {
  const shapItems = Array.isArray(result.shap) ? result.shap : [];

  const maxAbs = Math.max(
    0,
    ...shapItems.map((item) => Math.abs(Number(item.shap_value) || 0))
  );

  return (
    <section className="assessment-result" aria-live="polite">
      <div className="result-header">
        <div>
          <span className="result-eyebrow">ASSESSMENT COMPLETED</span>
          <h2>Prediction result</h2>
          <p>Your applicant assessment has been processed.</p>
        </div>

        <span className="result-check-icon">
          <Check size={22} />
        </span>
      </div>

      <div className="result-main">
        <div className="result-probability-card">
          <span className="result-label">Model-estimated probability</span>
          <strong className="result-probability">
            {formatPercent(result.probability)}
          </strong>
          <div className="result-progress">
            <span
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, Number(result.probability) * 100 || 0)
                )}%`,
              }}
            />
          </div>
          <small>Probability returned by the model</small>
        </div>

        <div className="result-classification-card">
          <span className="result-label">Risk classification</span>
          <span className={`result-risk-badge ${getRiskClass(result.risk)}`}>
            {result.risk || 'Unknown'}
          </span>

          <div className="result-detail-row">
            <span>Prediction</span>
            <strong>{result.prediction ?? '—'}</strong>
          </div>

          <div className="result-detail-row">
            <span>Decision threshold</span>
            <strong>{formatPercent(result.threshold)}</strong>
          </div>
        </div>
      </div>

      <div className="shap-result">
        <div className="shap-result-heading">
          <div>
            <span className="result-eyebrow">MODEL EXPLANATION</span>
            <h3>Local SHAP explanation</h3>
            <p>
              Features with the largest absolute contributions returned
              for this prediction.
            </p>
          </div>
          <span className="shap-result-icon">
            <FileSearch size={20} />
          </span>
        </div>

        {shapItems.length === 0 ? (
          <div className="shap-empty">No SHAP explanation returned.</div>
        ) : (
          <div className="shap-feature-list">
            {shapItems.map((item, index) => {
              const value = Number(item.shap_value) || 0;
              const width = maxAbs > 0 ? (Math.abs(value) / maxAbs) * 100 : 0;

              return (
                <div
                  className="shap-feature-row"
                  key={`${item.feature}-${index}`}
                >
                  <div className="shap-feature-name">
                    {formatFeatureName(item.feature)}
                  </div>

                  <div className="shap-feature-track">
                    <span
                      className={`shap-feature-bar ${
                        value >= 0 ? 'shap-positive' : 'shap-negative'
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>

                  <span
                    className={`shap-feature-value ${
                      value >= 0 ? 'shap-positive-text' : 'shap-negative-text'
                    }`}
                  >
                    {value > 0 ? '+' : ''}
                    {value.toFixed(4)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <p className="shap-explanation-note">
          Positive SHAP values increase the explained model output, while
          negative values decrease it. The direction refers to the model
          output, not necessarily a direct approval decision.
        </p>
      </div>

      <div className="result-actions">
        <Link className="result-history-link" to="/app/history">
          View assessment history <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

export default function NewAssessmentPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setResult(null);
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setResult(null);

    const payload = {
      person_age: Number(form.person_age),
      person_income: Number(form.person_income),
      person_emp_length:
        form.person_emp_length === ''
          ? null
          : Number(form.person_emp_length),
      loan_amnt: Number(form.loan_amnt),
      loan_int_rate:
        form.loan_int_rate === ''
          ? null
          : Number(form.loan_int_rate),
      loan_percent_income: Number(form.loan_percent_income) / 100,
      cb_person_cred_hist_length: Number(
        form.cb_person_cred_hist_length
      ),
      person_home_ownership: form.person_home_ownership,
      loan_intent: form.loan_intent,
      loan_grade: form.loan_grade,
      cb_person_default_on_file: form.cb_person_default_on_file,
    };

    const numericValues = [
      payload.person_age,
      payload.person_income,
      payload.loan_amnt,
      payload.loan_percent_income,
      payload.cb_person_cred_hist_length,
    ];

    if (
      numericValues.some((value) => !Number.isFinite(value)) ||
      (payload.person_emp_length !== null &&
        !Number.isFinite(payload.person_emp_length)) ||
      (payload.loan_int_rate !== null &&
        !Number.isFinite(payload.loan_int_rate))
    ) {
      setError('Please provide valid numerical values in all required fields.');
      return;
    }

    if (!Number.isInteger(payload.person_age) || payload.person_age < 18) {
      setError('Applicant age must be a whole number of at least 18.');
      return;
    }

    if (
      payload.person_income <= 0 ||
      payload.loan_amnt <= 0 ||
      payload.loan_percent_income < 0 ||
      payload.cb_person_cred_hist_length < 0 ||
      (payload.person_emp_length !== null &&
        payload.person_emp_length < 0) ||
      (payload.loan_int_rate !== null && payload.loan_int_rate < 0)
    ) {
      setError('Please check the minimum values of the entered fields.');
      return;
    }

    setSubmitting(true);

    try {
      const data = await createAssessment(payload);
      setResult(data);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.detail
          ? Array.isArray(requestError.response.data.detail)
            ? requestError.response.data.detail
                .map((item) => item.msg)
                .join(', ')
            : String(requestError.response.data.detail)
          : requestError.message === 'Network Error'
            ? 'Could not connect to the API. Check that your backend is running.'
            : 'Assessment failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setResult(null);
    setError('');
  }

  return (
    <div className="assessment-page">
      <section className="assessment-page-heading">
        <div>
          <span className="assessment-eyebrow">CREDIT EVALUATION</span>
          <h2>New credit assessment</h2>
          <p>
            Enter applicant information to generate a credit risk
            prediction with an explanation.
          </p>
        </div>

        <button
          className="assessment-reset-button"
          type="button"
          onClick={resetForm}
          disabled={submitting}
        >
          <RefreshCw size={14} />
          Reset form
        </button>
      </section>

      <div className="assessment-layout">
        <form className="assessment-form-card" onSubmit={handleSubmit}>
          <div className="assessment-form-header">
            <span className="assessment-form-icon">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h3>Applicant information</h3>
              <p>Fields marked with * are required.</p>
            </div>
          </div>

          <FormSection
            number="01"
            title="Personal profile"
            description="Basic applicant and employment details."
          >
            <TextField
              label="Applicant age"
              name="person_age"
              value={form.person_age}
              onChange={handleChange}
              placeholder="e.g. 25"
              min="18"
              step="1"
              suffix="years"
            />

            <TextField
              label="Annual income"
              name="person_income"
              value={form.person_income}
              onChange={handleChange}
              placeholder="e.g. 50000"
              min="0.01"
              step="any"
            />

            <TextField
              label="Employment length"
              name="person_emp_length"
              value={form.person_emp_length}
              onChange={handleChange}
              placeholder="e.g. 3"
              min="0"
              required={false}
              suffix="years"
              hint="Leave blank if unknown."
            />

            <TextField
              label="Credit history length"
              name="cb_person_cred_hist_length"
              value={form.cb_person_cred_hist_length}
              onChange={handleChange}
              placeholder="e.g. 4"
              min="0"
              suffix="years"
            />
          </FormSection>

          <FormSection
            number="02"
            title="Loan details"
            description="Requested loan information and repayment ratio."
          >
            <TextField
              label="Loan amount"
              name="loan_amnt"
              value={form.loan_amnt}
              onChange={handleChange}
              placeholder="e.g. 10000"
              min="0.01"
            />

            <TextField
              label="Interest rate"
              name="loan_int_rate"
              value={form.loan_int_rate}
              onChange={handleChange}
              placeholder="e.g. 10.5"
              min="0"
              suffix="%"
              required={false}
              hint="Leave blank if unknown."
            />

            <TextField
              label="Loan-to-income ratio"
              name="loan_percent_income"
              value={form.loan_percent_income}
              onChange={handleChange}
              placeholder="e.g. 20"
              min="0"
              suffix="%"
              hint="Enter 20 for a 20% ratio."
            />
          </FormSection>

          <FormSection
            number="03"
            title="Credit profile"
            description="Select the applicant's loan and credit categories."
          >
            <SelectField
              label="Home ownership"
              name="person_home_ownership"
              value={form.person_home_ownership}
              onChange={handleChange}
              options={[
                { label: 'Rent', value: 'RENT' },
                { label: 'Own', value: 'OWN' },
                { label: 'Mortgage', value: 'MORTGAGE' },
                { label: 'Other', value: 'OTHER' },
              ]}
            />

            <SelectField
              label="Loan purpose"
              name="loan_intent"
              value={form.loan_intent}
              onChange={handleChange}
              options={[
                { label: 'Education', value: 'EDUCATION' },
                { label: 'Personal', value: 'PERSONAL' },
                { label: 'Medical', value: 'MEDICAL' },
                { label: 'Venture', value: 'VENTURE' },
                { label: 'Home improvement', value: 'HOMEIMPROVEMENT' },
                {
                  label: 'Debt consolidation',
                  value: 'DEBTCONSOLIDATION',
                },
              ]}
            />

            <SelectField
              label="Loan grade"
              name="loan_grade"
              value={form.loan_grade}
              onChange={handleChange}
              options={['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(
                (value) => ({
                  label: `Grade ${value}`,
                  value,
                })
              )}
            />

            <SelectField
              label="Previous default on file"
              name="cb_person_default_on_file"
              value={form.cb_person_default_on_file}
              onChange={handleChange}
              options={[
                { label: 'No', value: 'N' },
                { label: 'Yes', value: 'Y' },
              ]}
            />
          </FormSection>

          {error && (
            <div className="assessment-error" role="alert">
              {error}
            </div>
          )}

          <div className="assessment-form-actions">
            <button
              type="submit"
              className="assessment-submit"
              disabled={submitting}
            >
              {submitting ? 'Evaluating applicant...' : 'Generate prediction'}
              {!submitting && <ArrowRight size={17} />}
            </button>
            <p>
              <ShieldCheck size={14} />
              Your assessment is processed through the protected API.
            </p>
          </div>
        </form>

        <aside className="assessment-side-panel">
          <div className="assessment-side-icon">
            <FileSearch size={22} />
          </div>
          <h3>Explainable assessment</h3>
          <p>
            Each prediction includes the model's probability, decision
            threshold, risk classification and local SHAP explanations.
          </p>

          <div className="assessment-side-steps">
            <div>
              <span>01</span>
              <p>Enter applicant information</p>
            </div>
            <div>
              <span>02</span>
              <p>Generate the ML prediction</p>
            </div>
            <div>
              <span>03</span>
              <p>Explore the SHAP explanation</p>
            </div>
          </div>

          <div className="assessment-side-note">
            The model output is an estimate and should be reviewed
            alongside other relevant information.
          </div>
        </aside>
      </div>

      {result && <AssessmentResult result={result} />}
    </div>
  );
}