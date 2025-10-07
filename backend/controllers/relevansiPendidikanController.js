let nextId = 1;
let dataRelevansi = [];

export const getRelevansiPendidikan = (req, res) => {
  const { type } = req.query;
  const filtered = dataRelevansi.filter((item) => item.type === type);
  res.json({ data: filtered });
};

export const addRelevansiPendidikan = (req, res) => {
  const item = { ...req.body, id: nextId++ }; // ID unik
  dataRelevansi.push(item);
  res.json({ success: true, message: "Data berhasil ditambahkan", item });
};

export const updateRelevansiPendidikan = (req, res) => {
  const { id } = req.params;
  const idx = dataRelevansi.findIndex((item) => item.id == id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

  dataRelevansi[idx] = { ...dataRelevansi[idx], ...req.body };
  res.json({ success: true, message: "Data berhasil diupdate", item: dataRelevansi[idx] });
};

export const deleteRelevansiPendidikan = (req, res) => {
  const { id } = req.params;
  const idx = dataRelevansi.findIndex((item) => item.id == id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

  dataRelevansi.splice(idx, 1);
  res.json({ success: true, message: "Data berhasil dihapus" });
};

export const importRelevansiPendidikan = (req, res) => {
  const items = req.body; // array dari Excel
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: "Format salah" });
  }
  const itemsWithId = items.map(item => ({ ...item, id: nextId++ }));
  dataRelevansi.push(...itemsWithId);
  res.json({ success: true, message: "Data berhasil diimpor", count: items.length });
};
