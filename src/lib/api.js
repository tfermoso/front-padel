const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function setAccessToken(token) {
  localStorage.setItem("access_token", token);
}

export function clearAccessToken() {
  localStorage.removeItem("access_token");
}

export async function apiFetch(path, { method = "GET", body, headers } = {}) {
  if (!BASE_URL) {
    throw new Error("Falta VITE_API_BASE_URL en .env");
  }

  const token = getAccessToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Intenta parsear JSON si existe
  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else {
    const text = await res.text().catch(() => "");
    data = text ? { message: text } : null;
  }

  if (!res.ok) {
    // Mejor esfuerzo para mostrar mensaje del backend
    const msg =
      data?.message ||
      data?.error ||
      data?.msg ||
      `Error HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
