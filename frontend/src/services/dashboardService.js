import api from '../api/client';

export async function getDashboardSummary(signal) {
  const { data } = await api.get('/dashboard/summary', { signal });
  return data;
}

export async function getRecentAssessments({
  limit = 5,
  skip = 0,
  signal,
} = {}) {
  const { data } = await api.get('/assessment/history', {
    params: { limit, skip },
    signal,
  });


  
  return data;
}

// Fetch global SHAP model insights
export async function getModelInsights({ signal } = {}) {
  const { data } = await api.get('/dashboard/model-insights', {
    signal,
  });

  return data;
}