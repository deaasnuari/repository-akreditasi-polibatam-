const API_BASE = "http://localhost:5000/api/relevansi-pkm";

// Helper: Convert camelCase to snake_case for database
function camelToSnake(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const converted: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = obj[key];
  }
  return converted;
}

// Helper: Convert snake_case to camelCase for frontend
function snakeToCamel(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  const converted: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    converted[camelKey] = obj[key];
  }
  return converted;
}

/**
 * Ambil user_id dari localStorage. Hanya bisa di client-side.
 */
function getUserId() {
  if (typeof window === "undefined") {
    throw new Error("Harus di client-side. Tunggu sampai browser mount.");
  }

  // Coba ambil dari localStorage dulu
  const idStr = localStorage.getItem("user_id");
  if (idStr) {
    const id = Number(idStr);
    if (!Number.isNaN(id)) return id;
  }

  // Jika tidak ada, coba ambil dari sessionStorage (untuk sementara)
  const sessionIdStr = sessionStorage.getItem("user_id");
  if (sessionIdStr) {
    const id = Number(sessionIdStr);
    if (!Number.isNaN(id)) return id;
  }

  throw new Error("User ID tidak ditemukan. Pastikan sudah login.");
}

// =======================
// 🔹 GET data per subtab
// =======================
export async function getRelevansiPkm(subtab: string) {
  const user_id = getUserId();
  const res = await fetch(`${API_BASE}?subtab=${subtab}&user_id=${user_id}`, {
    credentials: 'include'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const data = json.data ?? json;
  // Convert snake_case to camelCase for frontend
  return Array.isArray(data) ? data.map(snakeToCamel) : snakeToCamel(data);
}

// =======================
// 🔹 POST data baru
// =======================
export async function saveRelevansiPkm(subtab: string, payload: any) {
  const user_id = getUserId();
  const converted = camelToSnake(payload);
  const res = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({ ...converted, subtab, user_id }), // ✅ Convert camelCase to snake_case
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || `HTTP ${res.status} ${res.statusText}`);
  }

  // Convert response data back to camelCase for frontend
  if (json.data) {
    json.data = snakeToCamel(json.data);
  }

  return json;
}

// =======================
// 🔹 PUT / Update data
// =======================
export async function updateRelevansiPkm(subtab: string, id: number | string, payload: any) {
  const converted = camelToSnake(payload);
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({ ...converted, subtab }), // ✅ Convert camelCase to snake_case
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || `HTTP ${res.status} ${res.statusText}`);
  }

  return json;
}

// =======================
// 🔹 DELETE data
// =======================
export async function deleteRelevansiPkm(subtab: string, id: number | string) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    credentials: 'include'
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || `HTTP ${res.status} ${res.statusText}`);
  }

  return json;
}

// =======================
// 🔹 PREVIEW import Excel
// =======================
export async function previewImport(file: File, subtab: string) {
  const user_id = getUserId();
  const fd = new FormData();
  fd.append("file", file);
  fd.append("subtab", subtab);
  fd.append("user_id", user_id.toString());
  fd.append("preview", "true");

  const res = await fetch(`${API_BASE}/import`, {
    method: "POST",
    body: fd,
    credentials: 'include'
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || `HTTP ${res.status} ${res.statusText}`);
  }

  return json;
}

// =======================
// 🔹 COMMIT import Excel
// =======================
export async function commitImport(file: File, subtab: string, mapping?: Record<string, string>) {
  const user_id = getUserId();
  const fd = new FormData();
  fd.append("file", file);
  fd.append("subtab", subtab);
  fd.append("user_id", user_id.toString());

  if (mapping) {
    fd.append("mapping", JSON.stringify(mapping));
  }

  const res = await fetch(`${API_BASE}/import`, {
    method: "POST",
    body: fd,
    credentials: 'include'
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || `HTTP ${res.status} ${res.statusText}`);
  }

  return json;
}

// =======================
// 🔹 GET ALL data (bonus)
// =======================
export async function getAllRelevansiPkm() {
  const res = await fetch(`${API_BASE}/all`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  // Convert snake_case to camelCase for frontend
  const data = json.data ?? json;
  return Array.isArray(data) ? data.map(snakeToCamel) : snakeToCamel(data);
}
