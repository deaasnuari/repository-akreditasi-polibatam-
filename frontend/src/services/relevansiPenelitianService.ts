const API_BASE = 'http://localhost:5000/api/relevansi-penelitian';

// GET data per subtab
export async function getRelevansiPenelitian(subtab: string) {
  const res = await fetch(`${API_BASE}?type=${subtab}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.data ?? json;
}

// POST — tambah data baru
export async function saveRelevansiPenelitian(subtab: string, payload: any) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: subtab, ...payload }), // backend sekarang membaca req.body.type sebagai subtab
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}

// PUT — update data by ID
export async function updateRelevansiPenelitian(id: number | string, payload: any) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}

// DELETE — hapus data by ID
export async function deleteRelevansiPenelitian(id: number | string) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}

// PREVIEW import Excel
export async function previewImport(file: File, subtab: string) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('type', subtab);
  fd.append('preview', 'true');

  const res = await fetch(`${API_BASE}/import`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}

// COMMIT import Excel
export async function commitImport(file: File, subtab: string, mapping: Record<string, string>) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('type', subtab);
  fd.append('mapping', JSON.stringify(mapping));

  const res = await fetch(`${API_BASE}/import`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}
