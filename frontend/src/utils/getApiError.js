export default function getApiError(error) {
  const detail = error.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = item.loc?.slice(1).join('.');
        return field ? `${field}: ${item.msg}` : item.msg;
      })
      .join(', ');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }

  if (!error.response) {
    return 'Unable to connect to the server. Please try again.';
  }

  return 'Something went wrong. Please try again.';
}