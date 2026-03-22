const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lyzsrft5zd.execute-api.us-east-1.amazonaws.com/prod';
const API_ROUTE = '/interaction';

/**
 * Normalize DynamoDB records: maps uppercase `ID` to lowercase `id`
 * and removes internal fields like `record_type`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRecord(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(normalizeRecord);
  }
  if (obj !== null && typeof obj === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'ID' && !('id' in obj)) {
        result['id'] = value;
      } else if (key === 'record_type') {
        continue; // skip internal DynamoDB field
      } else {
        result[key] = normalizeRecord(value);
      }
    }
    return result;
  }
  return obj;
}

export async function apiCall<T>(action: string, data: Record<string, unknown> = {}): Promise<T> {
  const url = `${API_BASE_URL}${API_ROUTE}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, ...data }),
  });

  const responseBody = await res.json();

  if (!res.ok) {
    throw new Error(responseBody.error || `API error: ${res.status}`);
  }

  return normalizeRecord(responseBody) as T;
}
