
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Database,
  Info,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getModelInsights } from '../../services/dashboardService';
import './ModelInsightsPage.css';

function formatFeatureName(value) {
  return String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatShap(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return '—';

  if (number !== 0 && Math.abs(number) < 0.0001) {
    return number.toExponential(2);
  }

  return number.toLocaleString('en-US', {
    maximumSignificantDigits: 5,
  });
}

function extractFeatures(response) {
  const list = Array.isArray(response?.features)
    ? response.features
    : Array.isArray(response?.data?.features)
      ? response.data.features
      : [];

  return list
    .filter(
      (item) =>
        typeof item?.feature === 'string' &&
        item.feature.trim() !== '' &&
        item.mean_abs_shap !== null &&
        item.mean_abs_shap !== undefined &&
        item.mean_shap !== null &&
        item.mean_shap !== undefined &&
        Number.isFinite(Number(item.mean_abs_shap)) &&
        Number.isFinite(Number(item.mean_shap))
    )
    .map((item) => ({
      feature: item.feature,
      label: formatFeatureName(item.feature),
      mean_abs_shap: Number(item.mean_abs_shap),
      mean_shap: Number(item.mean_shap),
    }))
    .sort((a, b) => b.mean_abs_shap - a.mean_abs_shap);
}

function getApiError(error) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join(', ');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  return error?.message || 'Unable to load model insights.';
}

function ShapTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="mi-tooltip">
      <span>{label}</span>
      <strong>{formatShap(payload[0].value)}</strong>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, description }) {
  return (
    <article className="mi-metric-card">
      <div className="mi-metric-header">
        <span>{label}</span>
        <div className="mi-metric-icon">
          <Icon size={18} />
        </div>
      </div>
      <strong className="mi-metric-value">{value}</strong>
      <p>{description}</p>
    </article>
  );
}

export default function ModelInsightsPage() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchInsights() {
      setLoading(true);
      setError('');

      try {
        const response = await getModelInsights({
          signal: controller.signal,
        });

        setFeatures(extractFeatures(response));
      } catch (err) {
        if (!controller.signal.aborted) {
          setFeatures([]);
          setError(getApiError(err));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchInsights();

    return () => controller.abort();
  }, [refreshKey]);

  const topFeatures = useMemo(
    () => features.slice(0, 10),
    [features]
  );

  const summary = useMemo(() => {
    if (!features.length) {
      return {
        count: 0,
        topName: '—',
        topValue: '—',
        average: '—',
      };
    }

    const average =
      features.reduce(
        (sum, item) => sum + item.mean_abs_shap,
        0
      ) / features.length;

    return {
      count: features.length,
      topName: features[0].label,
      topValue: formatShap(features[0].mean_abs_shap),
      average: formatShap(average),
    };
  }, [features]);

  const maxMeanMagnitude = Math.max(
    ...topFeatures.map((item) => Math.abs(item.mean_shap)),
    0.000001
  );

  const maxImportance = Math.max(
    ...features.map((item) => item.mean_abs_shap),
    0
  );

  if (loading) {
    return (
      <main className="mi-page">
        <div className="mi-state">
          <div className="mi-loader" />
          <strong>Loading model insights</strong>
          <p>Fetching global SHAP feature information...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mi-page">
        <div className="mi-heading">
          <div>
            <span className="mi-eyebrow">
              <BarChart3 size={15} />
              MODEL EXPLAINABILITY
            </span>
            <h1>Model Insights</h1>
          </div>
        </div>

        <div className="mi-state mi-error-state">
          <div className="mi-state-icon mi-error-icon">!</div>
          <strong>Unable to load model insights</strong>
          <p>{error}</p>
          <button
            type="button"
            className="mi-primary-button"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mi-page">
      <header className="mi-heading">
        <div>
          <span className="mi-eyebrow">
            <BarChart3 size={15} />
            MODEL EXPLAINABILITY
          </span>
          <h1>Model Insights</h1>
          <p>
            Explore global feature importance and SHAP
            contributions from the credit risk model.
          </p>
        </div>

        <button
          type="button"
          className="mi-refresh"
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      {features.length === 0 ? (
        <section className="mi-state mi-empty-state">
          <div className="mi-state-icon">
            <Database size={22} />
          </div>
          <strong>No feature insights available</strong>
          <p>
            The API returned no valid SHAP feature records.
          </p>
          <button
            type="button"
            className="mi-primary-button"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            <RefreshCw size={15} />
            Refresh data
          </button>
        </section>
      ) : (
        <>
          <section className="mi-metrics">
            <MetricCard
              icon={Database}
              label="Features analyzed"
              value={summary.count.toLocaleString('en-US')}
              description="Number of valid features returned by the API"
            />

            <MetricCard
              icon={Activity}
              label="Highest importance"
              value={summary.topValue}
              description={summary.topName}
            />

            <MetricCard
              icon={BarChart3}
              label="Average importance"
              value={summary.average}
              description="Mean of all mean absolute SHAP values"
            />
          </section>

          <section className="mi-chart-grid">
            <article className="mi-card">
              <div className="mi-card-heading">
                <div>
                  <h2>Global feature importance</h2>
                  <p>
                    Features ranked by mean absolute SHAP value.
                  </p>
                </div>
                <span className="mi-chart-tag">TOP 10</span>
              </div>

              <div className="mi-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topFeatures}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 20,
                      left: 12,
                      bottom: 5,
                    }}
                    barCategoryGap={11}
                  >
                    <CartesianGrid
                      horizontal={false}
                      stroke="#edf0f4"
                    />
                    <XAxis
                      type="number"
                      tickFormatter={formatShap}
                      tick={{
                        fill: '#9299a5',
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={135}
                      tick={{
                        fill: '#697281',
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <Tooltip
                      cursor={{ fill: '#f7f8fa' }}
                      content={<ShapTooltip />}
                    />
                    <Bar
                      dataKey="mean_abs_shap"
                      name="Mean absolute SHAP"
                      radius={[0, 5, 5, 0]}
                      barSize={15}
                    >
                      {topFeatures.map((item) => (
                        <Cell
                          key={item.feature}
                          fill="#f06453"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mi-chart-footer">
                A larger value indicates a greater average
                contribution magnitude.
              </div>
            </article>

            <article className="mi-card">
              <div className="mi-card-heading">
                <div>
                  <h2>Mean SHAP contribution</h2>
                  <p>
                    Average signed contribution for the most
                    important features.
                  </p>
                </div>
                <span className="mi-chart-tag">TOP 10</span>
              </div>

              <div className="mi-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topFeatures}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 20,
                      left: 12,
                      bottom: 5,
                    }}
                    barCategoryGap={11}
                  >
                    <CartesianGrid
                      horizontal={false}
                      stroke="#edf0f4"
                    />
                    <XAxis
                      type="number"
                      domain={[
                        -maxMeanMagnitude,
                        maxMeanMagnitude,
                      ]}
                      tickFormatter={formatShap}
                      tick={{
                        fill: '#9299a5',
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={135}
                      tick={{
                        fill: '#697281',
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <ReferenceLine
                      x={0}
                      stroke="#8c95a3"
                      strokeDasharray="3 3"
                    />
                    <Tooltip
                      cursor={{ fill: '#f7f8fa' }}
                      content={<ShapTooltip />}
                    />
                    <Bar
                      dataKey="mean_shap"
                      name="Mean SHAP"
                      radius={[4, 4, 4, 4]}
                      barSize={15}
                    >
                      {topFeatures.map((item) => (
                        <Cell
                          key={item.feature}
                          fill={
                            item.mean_shap >= 0
                              ? '#e66a5d'
                              : '#5e91dc'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mi-chart-legend">
                <span>
                  <i className="mi-positive-dot" />
                  <TrendingUp size={13} />
                  Positive mean SHAP
                </span>
                <span>
                  <i className="mi-negative-dot" />
                  <TrendingDown size={13} />
                  Negative mean SHAP
                </span>
              </div>
            </article>
          </section>

          <section className="mi-card mi-table-card">
            <div className="mi-card-heading">
              <div>
                <h2>Feature importance details</h2>
                <p>
                  Complete feature ranking from the global SHAP API.
                </p>
              </div>
              <span className="mi-total-tag">
                {features.length} features
              </span>
            </div>

            <div className="mi-table-scroll">
              <table className="mi-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Feature</th>
                    <th>Relative bar</th>
                    <th>Mean |SHAP|</th>
                    <th>Mean SHAP</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((item, index) => {
                    const width =
                      maxImportance > 0
                        ? Math.max(
                            0,
                            (item.mean_abs_shap / maxImportance) * 100
                          )
                        : 0;

                    return (
                      <tr key={item.feature}>
                        <td>
                          <span className="mi-rank">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </td>
                        <td>
                          <strong className="mi-feature-name">
                            {item.label}
                          </strong>
                        </td>
                        <td className="mi-bar-cell">
                          <div className="mi-mini-track">
                            <div
                              className="mi-mini-bar"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </td>
                        <td>
                          <strong className="mi-numeric">
                            {formatShap(item.mean_abs_shap)}
                          </strong>
                        </td>
                        <td>
                          <strong
                            className={`mi-numeric ${
                              item.mean_shap > 0
                                ? 'mi-text-positive'
                                : item.mean_shap < 0
                                  ? 'mi-text-negative'
                                  : ''
                            }`}
                          >
                            {item.mean_shap > 0 ? '+' : ''}
                            {formatShap(item.mean_shap)}
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mi-information">
            <Info size={16} />
            <p>
              <strong>How to interpret this page:</strong>
              Mean absolute SHAP represents average contribution
              magnitude, while mean SHAP represents the signed
              average. Positive or negative direction refers to
              the explained model output. Its exact interpretation
              for default risk depends on the model output and
              explained class. SHAP values describe model
              contributions, not proof of causation.
            </p>
          </div>
        </>
      )}
    </main>
  );
}