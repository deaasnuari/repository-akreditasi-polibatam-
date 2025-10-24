const API_BASE = 'http://localhost:5000/api/relevansi-penelitian';

// GET data per subtab
export async function getRelevansiPenelitian(type: string) {
  const res = await fetch(`${API_BASE}?type=${type}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.data ?? json;
}

// POST data baru
export async function saveRelevansiPenelitian(type: string, payload: any) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ...payload }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}

/// PUT / update data
export async function updateRelevansiPenelitian(type: string, id: number | string, payload: any) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}

// DELETE data
export async function deleteRelevansiPenelitian(type: string, id: number | string) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}


// PREVIEW import Excel
export async function previewImport(file: File, type: string) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('type', type);
  fd.append('preview', 'true');

  const res = await fetch(`${API_BASE}/import`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}

// COMMIT import Excel
export async function commitImport(file: File, type: string, mapping: Record<string, string>) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('type', type);
  fd.append('mapping', JSON.stringify(mapping));

  const res = await fetch(`${API_BASE}/import`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}
