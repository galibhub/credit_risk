import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FilePlus2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  getDashboardSummary,
  getRecentAssessments,
} from '../../services/dashboardService';
import getApiError from '../../utils/getApiError';
import './DashboardPage.css';

function formatPercent(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${(number * 100).toFixed(2)}%` : '—';
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

function getRiskClass(risk) {
  const value = String(risk || '').toLowerCase();

  if (value.includes('high')) return 'risk-high';
  if (value.includes('medium')) return 'risk-medium';
  return 'risk-low';
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ label, value, icon: Icon, type, description }) {
  return (
    <article className="dash-stat-card">
      <div className="dash-stat-top">
        <span className={`dash-stat-icon ${type}`}>
          <Icon size={19} strokeWidth={1.8} />
        </span>
        <span className="dash-stat-label">{label}</span>
      </div>

      <strong className="dash-stat-value">{value}</strong>
      <span className="dash-stat-description">{description}</span>
    </article>
  );
}

function EmptyAssessments() {
  return (
    <div className="dash-empty">
      <span className="dash-empty-icon">
        <Clock3 size={23} />
      </span>
      <strong>No assessments yet</strong>
      <p>Your recent assessments will appear here.</p>
      <Link to="/app/new-assessment" className="dash-inline-link">
        Create your first assessment <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function RiskDistribution({ total, low, high }) {
  const lowValue = Number(low) || 0;
  const highValue = Number(high) || 0;
  const totalValue = Number(total) || 0;
  const lowWidth =
    totalValue > 0 ? Math.min((lowValue / totalValue) * 100, 100) : 0;
  const highWidth =
    totalValue > 0 ? Math.min((highValue / totalValue) * 100, 100) : 0;

  return (
    <article className="dash-panel distribution-panel">
      <div className="dash-panel-heading">
        <div>
          <h2>Risk distribution</h2>
          <p>Breakdown of your assessment results</p>
        </div>
        <span className="dash-panel-heading-icon">
          <Activity size={18} />
        </span>
      </div>

      {totalValue === 0 ? (
        <div className="distribution-empty">
          No risk data available yet.
        </div>
      ) : (
        <>
          <div
            className="distribution-bar"
            role="img"
            aria-label={`${lowValue} low-risk and ${highValue} high-risk assessments`}
          >
            <span
              className="distribution-low"
              style={{ width: `${lowWidth}%` }}
            />
            <span
              className="distribution-high"
              style={{ width: `${highWidth}%` }}
            />
          </div>

          <div className="distribution-legend">
            <div>
              <span className="legend-dot legend-low" />
              <span>Low Risk</span>
              <strong>{lowValue}</strong>
            </div>
            <div>
              <span className="legend-dot legend-high" />
              <span>High Risk</span>
              <strong>{highValue}</strong>
            </div>
          </div>
        </>
      )}

      <div className="distribution-foot">
        <span>Total assessments</span>
        <strong>{totalValue}</strong>
      </div>
    </article>
  );
}

function LatestAssessment({ assessment }) {
  return (
    <article className="dash-panel latest-panel">
      <div className="dash-panel-heading">
        <div>
          <h2>Latest assessment</h2>
          <p>Your most recent prediction</p>
        </div>
        <span className="dash-panel-heading-icon">
          <ShieldCheck size={18} />
        </span>
      </div>

      {!assessment ? (
        <div className="distribution-empty">
          No recent assessment found.
        </div>
      ) : (
        <>
          <div className="latest-result">
            <div>
              <span className="latest-caption">Risk probability</span>
              <strong>{formatPercent(assessment.probability)}</strong>
            </div>
            <span className={`risk-badge ${getRiskClass(assessment.risk)}`}>
              {assessment.risk || 'Unknown'}
            </span>
          </div>

          <div className="latest-meta">
            <div>
              <span>Prediction</span>
              <strong>{assessment.prediction ?? '—'}</strong>
            </div>
            <div>
              <span>Threshold</span>
              <strong>{formatPercent(assessment.threshold)}</strong>
            </div>
            <div>
              <span>Date</span>
              <strong>{formatDate(assessment.created_at)}</strong>
            </div>
          </div>

          <Link
            className="dash-inline-link"
            to={`/app/assessments/${assessment.id}`}
          >
            View assessment details <ArrowRight size={15} />
          </Link>
        </>
      )}
    </article>
  );
}

function RecentAssessments({ assessments }) {
  return (
    <article className="dash-panel recent-panel">
      <div className="dash-panel-heading recent-heading">
        <div>
          <h2>Recent assessments</h2>
          <p>Your latest credit risk predictions</p>
        </div>
        <Link to="/app/history" className="dash-view-all">
          View all <ArrowUpRight size={15} />
        </Link>
      </div>

      {assessments.length === 0 ? (
        <EmptyAssessments />
      ) : (
        <div className="recent-table-wrap">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Probability</th>
                <th>Risk</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {assessments.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="recent-date">
                      <span className="recent-date-icon">
                        <Clock3 size={15} />
                      </span>
                      <span>
                        <strong>{formatDate(item.created_at)}</strong>
                        <small>ID: {String(item.id).slice(-8)}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong className="recent-probability">
                      {formatPercent(item.probability)}
                    </strong>
                  </td>
                  <td>
                    <span className={`risk-badge ${getRiskClass(item.risk)}`}>
                      {item.risk || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/app/assessments/${item.id}`}
                      className="recent-view"
                      aria-label="View assessment"
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const [summaryData, historyData] = await Promise.all([
          getDashboardSummary(controller.signal),
          getRecentAssessments({
            limit: 5,
            skip: 0,
            signal: controller.signal,
          }),
        ]);

        setSummary(summaryData);
        setAssessments(
          Array.isArray(historyData.assessments)
            ? historyData.assessments
            : []
        );
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(getApiError(err));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => controller.abort();
  }, [refreshKey]);

  const total = Number(summary?.total_assessments) || 0;
  const low = Number(summary?.low_risk) || 0;
  const high = Number(summary?.high_risk) || 0;

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">YOUR WORKSPACE</span>
          <h2>{getGreeting()}, welcome back.</h2>
          <p>
            Here is an overview of your credit risk assessments.
          </p>
        </div>

        <div className="dashboard-welcome-actions">
          <button
            type="button"
            className="dash-refresh-button"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={loading}
          >
            <RefreshCw
              size={15}
              className={loading ? 'refresh-spinning' : ''}
            />
            Refresh
          </button>

          <Link to="/app/new-assessment" className="dash-new-button">
            <FilePlus2 size={16} />
            New assessment
          </Link>
        </div>
      </section>

      {error && (
        <div className="dash-error" role="alert">
          <AlertTriangle size={17} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Retry
          </button>
        </div>
      )}

      <section className="dash-stats-grid" aria-label="Assessment statistics">
        <StatCard
          label="Total assessments"
          value={loading ? '—' : total}
          icon={Activity}
          type="blue"
          description="All your recorded assessments"
        />

        <StatCard
          label="Low risk"
          value={loading ? '—' : low}
          icon={CheckCircle2}
          type="green"
          description="Predictions classified as low risk"
        />

        <StatCard
          label="High risk"
          value={loading ? '—' : high}
          icon={AlertTriangle}
          type="coral"
          description="Predictions classified as high risk"
        />
      </section>

      {loading && !summary ? (
        <div className="dash-loading" role="status">
          <span className="dash-spinner" />
          Loading your dashboard...
        </div>
      ) : (
        <>
          <section className="dash-overview-grid">
            <RiskDistribution total={total} low={low} high={high} />
            <LatestAssessment assessment={summary?.latest_assessment} />
          </section>

          <RecentAssessments assessments={assessments} />
        </>
      )}

      <div className="dashboard-disclaimer">
        <ShieldCheck size={15} />
        <span>
          Model predictions are estimates and should not be treated as
          the sole basis for a lending decision.
        </span>
      </div>
    </div>
  );
}