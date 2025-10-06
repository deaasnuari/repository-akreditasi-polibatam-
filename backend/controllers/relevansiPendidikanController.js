let dataRelevansi = [];

export const getRelevansiPendidikan = (req, res) => {
  const { type } = req.query;
  const filtered = dataRelevansi.filter((item) => item.type === type);
  res.json({ data: filtered });
};

export const addRelevansiPendidikan = (req, res) => {
  const item = req.body;
  dataRelevansi.push(item);
  res.json({ success: true, message: "Data berhasil ditambahkan", item });
};

export const importRelevansiPendidikan = (req, res) => {
  const items = req.body; // array dari Excel
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: "Format salah" });
  }
  dataRelevansi.push(...items);
  res.json({ success: true, message: "Data berhasil diimpor", count: items.length });
};
