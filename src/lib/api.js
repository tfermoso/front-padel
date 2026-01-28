const API_URL = import.meta.env.VITE_API_BASE_URL;

// Token en memoria + persistencia
let accessToken = localStorage.getItem("access_token");

export function setAccessToken(token) {
  accessToken = token || null;
  if (accessToken) localStorage.setItem("access_token", accessToken);
  else localStorage.removeItem("access_token");
}

export function getAccessToken() {
  return accessToken;
}

export async function apiFetch(path, options = {}) {
  const { method = "GET", body, headers, ...rest } = options;

  const finalHeaders = {
    "Content-Type": "application/json",
    ...(headers || {}),
  };

  if (accessToken) {
    finalHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Error ${res.status}: ${res.statusText}`;
    throw new Error(msg);
  }

  return data;
}
