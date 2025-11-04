const API_BASE = 'http://localhost:5000/api/relevansi-penelitian';

// GET data per subtab
export async function getRelevansiPenelitian(subtab: string) {
  const res = await fetch(`${API_BASE}?subtab=${subtab}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.data ?? json;
}

// POST — tambah data baru
export async function saveRelevansiPenelitian(subtab: string, payload: any) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subtab, ...payload }), // perbaikan: pakai subtab
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}

// PUT — update data by ID
// updateRelevansiPenelitian expects (subtab, id, payload) because page passes subtab first.
export async function updateRelevansiPenelitian(subtab: string, id: number | string, payload: any) {
  if (!id || Number.isNaN(Number(id))) throw new Error('ID tidak valid');
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let bodyText = '';
    try { const json = await res.json(); bodyText = json.message || JSON.stringify(json); } catch { try { bodyText = await res.text(); } catch {} }
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${bodyText}`);
  }
  return await res.json();
}

// DELETE — hapus data by ID
// deleteRelevansiPenelitian expects (subtab, id) because pages pass subtab first.
export async function deleteRelevansiPenelitian(subtab: string, id: number | string) {
  if (!id || Number.isNaN(Number(id))) throw new Error('ID tidak valid');
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    // Try to read JSON error body for more helpful message
    let bodyText = '';
    try {
      const json = await res.json();
      bodyText = json.message || JSON.stringify(json);
    } catch (err) {
      try {
        bodyText = await res.text();
      } catch {}
    }
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${bodyText}`);
  }
  return await res.json();
}

// PREVIEW import Excel
export async function previewImport(file: File, subtab: string) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('subtab', subtab); // ganti type → subtab
  fd.append('preview', 'true');

  const res = await fetch(`${API_BASE}/import`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}

// COMMIT import Excel
export async function commitImport(file: File, subtab: string, mapping: Record<string, string>) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('subtab', subtab); // ganti type → subtab
  fd.append('mapping', JSON.stringify(mapping));

  const res = await fetch(`${API_BASE}/import`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.json();
}
