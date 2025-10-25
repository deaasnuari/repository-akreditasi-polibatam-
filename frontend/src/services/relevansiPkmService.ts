const API_BASE = "http://localhost:5000/api/relevansi-pkm";

// =======================
// 🔹 GET data per subtab
// =======================
export async function getRelevansiPkm(type: string) {
  const res = await fetch(`${API_BASE}?type=${type}`);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP ${res.status} ${res.statusText}`);
  }
  
  const json = await res.json();
  return json.data ?? json;
}

// =======================
// 🔹 POST data baru
// =======================
export async function saveRelevansiPkm(type: string, payload: any) {
  const res = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, type }), // ✅ type masuk di body
  });
  
  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(json.message || json.error || `HTTP ${res.status} ${res.statusText}`);
  }
  
  return json;
}

// =======================
// 🔹 PUT / Update data
// =======================
export async function updateRelevansiPkm(type: string, id: number | string, payload: any) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, type }), // ✅ type bisa dikirim juga (optional)
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
export async function deleteRelevansiPkm(type: string, id: number | string) {
  const res = await fetch(`${API_BASE}/${id}`, { 
    method: "DELETE" 
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
export async function previewImport(file: File, type: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("type", type);
  fd.append("preview", "true");

  const res = await fetch(`${API_BASE}/import`, { 
    method: "POST", 
    body: fd 
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
export async function commitImport(file: File, type: string, mapping?: Record<string, string>) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("type", type);
  
  if (mapping) {
    fd.append("mapping", JSON.stringify(mapping));
  }

  const res = await fetch(`${API_BASE}/import`, { 
    method: "POST", 
    body: fd 
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
  return json.data ?? json;
}