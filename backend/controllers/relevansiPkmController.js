// === DUMMY DATA ===
let data = {
  "sarana-prasarana": [
    {
      id: 1,
      namaPrasarana: "Laboratorium Komputer",
      dayaTampung: "40 orang",
      luasRuang: "60",
      status: "Milik",
      lisensi: "L",
      perangkat: "Komputer, Proyektor",
      linkBukti: "https://example.com/lab-komputer"
    }
  ],
  "pkm-hibah": [
    {
      id: 1,
      no: 1,
      namaDTPR: "Dr. Ahmad",
      judulPkM: "Pelatihan Digital Marketing UMKM",
      jumlahMahasiswa: 5,
      jenisHibah: "Internal",
      sumberDana: "Kampus",
      durasi: 1,
      pendanaan: 20,
      tahun: 2024,
      linkBukti: "https://example.com/pkm-hibah"
    }
  ],
  "kerjasama-pkm": [
    {
      id: 1,
      no: 1,
      judulKerjasama: "Pengabdian di Desa Cerdas",
      mitra: "Desa Mekar Sari",
      sumber: "Lokal",
      durasi: 2,
      pendanaan: 30,
      tahun: 2023,
      linkBukti: "https://example.com/kerjasama"
    }
  ],
  "hki-pkm": [
    {
      id: 1,
      no: 1,
      judul: "Aplikasi Pelaporan PKM",
      jenisHKI: "Paten Sederhana",
      namaDTPR: "Prof. Lina",
      tahun: 2024,
      linkBukti: "https://example.com/hki"
    }
  ]
};

// === CONTROLLER ===

// GET berdasarkan type
export const getByType = (req, res) => {
  const type = req.query.type;
  if (!type || !data[type]) {
    return res.status(400).json({ message: "Type tidak valid", data: [] });
  }
  res.json({ data: data[type] });
};

// CREATE item baru
export const createItem = (req, res) => {
  const type = req.params.type || req.body.type; // ✅ ambil dari params dulu
  const item = req.body;

  if (!type || !data[type]) {
    return res.status(400).json({ message: "Type tidak valid" });
  }

  // kasih id baru otomatis
  const newItem = { id: Date.now(), ...item };
  data[type].push(newItem);

  console.log(`[PKM] Data baru ditambahkan ke ${type}:`, newItem); // 🔍 bantu debug

  res.json({
    message: `Data baru ditambahkan ke ${type}`,
    data: newItem
  });
};


// DELETE item
export const deleteItem = (req, res) => {
  const { type, id } = req.params;
  if (!data[type]) {
    return res.status(400).json({ message: "Type tidak ditemukan" });
  }
  data[type] = data[type].filter((item) => item.id != id);
  res.json({ message: `Data ${id} dihapus dari ${type}` });
};
