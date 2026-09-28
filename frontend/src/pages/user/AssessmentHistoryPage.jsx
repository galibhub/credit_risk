import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

import { getAssessmentHistory } from '../../services/assessmentService';
import './AssessmentHistoryPage.css';

const PAGE_SIZE = 10;

function getRows(payload) {
  const root = payload?.data ?? payload;

  if (Array.isArray(root)) return root;

  for (const key of ['items', 'assessments', 'results', 'history']) {
    if (Array.isArray(root?.[key])) return root[key];
  }

  return [];
}

function getTotal(payload) {
  const root = payload?.data ?? payload;

  const candidates = [
    root?.total,
    root?.total_count,
    root?.count,
    root?.pagination?.total,
    root?.meta?.total,
  ];

  for (const value of candidates) {
    if (value !== null && value !== undefined && value !== '') {
      const number = Number(value);
      if (Number.isFinite(number) && number >= 0) {
        return number;
      }
    }
  }

  return null;
}

function getId(item) {
  return item?.id ?? item?._id ?? item?.assessment_id ?? null;
}

function getProbability(item) {
  return (
    item?.probability ??
    item?.failure_probability ??
    item?.prediction?.probability ??
    item?.result?.probability ??
    null
  );
}

function formatPercent(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const number = Number(value);
  if (!Number.isFinite(number)) return '—';

  return `${(number > 1 ? number : number * 100).toFixed(2)}%`;
}

function getRisk(item) {
  const rawRisk =
    item?.risk ??
    item?.prediction?.risk ??
    item?.result?.risk;

  if (typeof rawRisk === 'string') {
    const normalized = rawRisk.toLowerCase();

    if (normalized.includes('high')) return 'High Risk';
    if (normalized.includes('low')) return 'Low Risk';
  }

  const rawPrediction =
    typeof item?.prediction === 'object' && item?.prediction !== null
      ? item.prediction.prediction ?? item.prediction.label
      : item?.prediction ?? item?.result?.prediction;

  if (
    rawPrediction === 1 ||
    rawPrediction === true ||
    ['1', 'true', 'high', 'high risk', 'default'].includes(
      String(rawPrediction).toLowerCase()
    )
  ) {
    return 'High Risk';
  }

  if (
    rawPrediction === 0 ||
    rawPrediction === false ||
    ['0', 'false', 'low', 'low risk', 'no default'].includes(
      String(rawPrediction).toLowerCase()
    )
  ) {
    return 'Low Risk';
  }

  return 'Unknown';
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join(', ');
  }

  if (typeof detail === 'string') return detail;

  return error?.message || 'Unable to load assessment history.';
}

export default function AssessmentHistoryPage() {
  const [assessments, setAssessments] = useState([]);
  const [total, setTotal] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchHistory() {
      setLoading(true);
      setError('');

      try {
        const response = await getAssessmentHistory({
          limit: PAGE_SIZE,
          skip: page * PAGE_SIZE,
          signal: controller.signal,
        });

        setAssessments(getRows(response));
        setTotal(getTotal(response));
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(err));
          setAssessments([]);
          setTotal(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchHistory();

    return () => controller.abort();
  }, [page, refreshKey]);

  const start = page * PAGE_SIZE + 1;
  const end = page * PAGE_SIZE + assessments.length;

  const hasPrevious = page > 0;
  const hasNext =
    total !== null
      ? (page + 1) * PAGE_SIZE < total
      : assessments.length === PAGE_SIZE;

  return (
    <div className="ah-page">
      <div className="ah-heading">
        <div>
          <div className="ah-eyebrow">
            <ClipboardList size={15} />
            ASSESSMENT RECORDS
          </div>
          <h1>Assessment History</h1>
          <p>
            Review your previous credit risk assessments and their
            model-generated results.
          </p>
        </div>

        <button
          type="button"
          className="ah-refresh"
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? 'ah-spinning' : ''}
          />
          Refresh
        </button>
      </div>

      <div className="ah-overview">
        <div className="ah-overview-icon">
          <ShieldCheck size={22} />
        </div>
        <div>
          <span className="ah-overview-label">Your assessments</span>
          <strong className="ah-overview-value">
            {total !== null ? total.toLocaleString() : '—'}
          </strong>
        </div>
        <span className="ah-overview-note">
          {total !== null
            ? 'Total records'
            : 'Total count not provided by API'}
        </span>
      </div>

      <section className="ah-table-card">
        <div className="ah-table-heading">
          <div>
            <h2>All assessments</h2>
            <p>Each row represents a saved assessment.</p>
          </div>

          <span className="ah-page-indicator">
            Page {page + 1}
          </span>
        </div>

        {loading ? (
          <div className="ah-state">
            <div className="ah-loader" />
            <strong>Loading assessments</strong>
            <p>Fetching your assessment records...</p>
          </div>
        ) : error ? (
          <div className="ah-state ah-error-state">
            <div className="ah-state-icon ah-error-icon">
              !
            </div>
            <strong>Couldn't load assessments</strong>
            <p>{error}</p>
            <button
              type="button"
              className="ah-primary-button"
              onClick={() => setRefreshKey((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        ) : assessments.length === 0 ? (
          <div className="ah-state">
            <div className="ah-state-icon">
              <ClipboardList size={23} />
            </div>
            <strong>No assessments found</strong>
            <p>
              You haven't saved any assessments on this page yet.
            </p>
            {page > 0 ? (
              <button
                type="button"
                className="ah-primary-button"
                onClick={() => setPage(0)}
              >
                Back to first page
              </button>
            ) : (
              <Link
                to="/app/new-assessment"
                className="ah-primary-button"
              >
                Create assessment
                <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="ah-table-scroll">
              <table className="ah-table">
                <thead>
                  <tr>
                    <th>Assessment</th>
                    <th>Date & time</th>
                    <th>Risk level</th>
                    <th>Probability</th>
                    <th>Threshold</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>

                <tbody>
                  {assessments.map((item, index) => {
                    const id = getId(item);
                    const risk = getRisk(item);
                    const probability = getProbability(item);

                    return (
                      <tr key={id ?? `${page}-${index}`}>
                        <td>
                          <div className="ah-id-cell">
                            <div className="ah-row-icon">
                              <ClipboardList size={16} />
                            </div>
                            <div>
                              <strong>
                                {id
                                  ? `#${String(id).slice(-8)}`
                                  : `Assessment ${index + 1}`}
                              </strong>
                              <span>Credit risk analysis</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="ah-date">
                            {formatDate(
                              item?.created_at ??
                              item?.createdAt ??
                              item?.timestamp
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`ah-risk ${
                              risk === 'High Risk'
                                ? 'ah-risk-high'
                                : risk === 'Low Risk'
                                  ? 'ah-risk-low'
                                  : 'ah-risk-unknown'
                            }`}
                          >
                            <span className="ah-risk-dot" />
                            {risk}
                          </span>
                        </td>

                        <td>
                          <strong className="ah-probability">
                            {formatPercent(probability)}
                          </strong>
                        </td>

                        <td>
                          <span className="ah-threshold">
                            {formatPercent(item?.threshold)}
                          </span>
                        </td>

                        <td>
                          {id ? (
                            <Link
                              className="ah-view-link"
                              to={`/app/assessments/${encodeURIComponent(
                                String(id)
                              )}`}
                              aria-label={`View assessment ${id}`}
                            >
                              View
                              <ArrowUpRight size={15} />
                            </Link>
                          ) : (
                            <span className="ah-unavailable">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="ah-pagination">
              <span className="ah-pagination-info">
                {total !== null
                  ? `Showing ${assessments.length ? start : 0}–${end} of ${total}`
                  : `Showing ${assessments.length} records`}
              </span>

              <div className="ah-pagination-actions">
                <button
                  type="button"
                  className="ah-page-button"
                  onClick={() => setPage((value) => value - 1)}
                  disabled={!hasPrevious || loading}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="ah-page-number">{page + 1}</span>

                <button
                  type="button"
                  className="ah-page-button"
                  onClick={() => setPage((value) => value + 1)}
                  disabled={!hasNext || loading}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}