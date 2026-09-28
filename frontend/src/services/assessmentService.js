import api from '../api/client';

// Create a new credit risk assessment
export async function createAssessment(payload) {
  const { data } = await api.post('/assessment/predict', payload);
  return data;
}

// Get paginated assessment history
export async function getAssessmentHistory({
  limit = 10,
  skip = 0,
  signal,
} = {}) {
  const { data } = await api.get('/assessment/history', {
    params: { limit, skip },
    signal,
  });

  return data;
}

// Get a single assessment by ID
export async function getAssessmentDetail(id, signal) {
  const { data } = await api.get(
    `/assessment/${encodeURIComponent(id)}`,
    { signal }
  );

  return data;
}