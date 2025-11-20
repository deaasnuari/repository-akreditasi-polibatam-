# TODO: Samakan Relevansi Pendidikan dengan Relevansi Penelitian

## Progress
- [ ] Update Prisma schema: Ubah model relevansi_pendidikan ke struktur seperti relevansi_penelitian (id, user_id, subtab, data Json, timestamps)
- [ ] Update backend/controllers/relevansiPendidikanController.js: Gunakan Prisma, tambah autentikasi JWT, ubah 'type' ke 'subtab'
- [ ] Update backend/routes/relevansiPendidikan.js: Tambah middleware autentikasi
- [ ] Update frontend/src/services/relevansiPendidikanService.ts: Tambah handling user_id, ubah 'type' ke 'subtab'
- [ ] Update frontend/src/app/dashboard/tim-akreditasi/lkps/relevansi-pendidikan/page.tsx: Ubah penggunaan 'type' ke 'subtab'
- [ ] Jalankan migration Prisma: `npx prisma migrate dev`
- [ ] Test CRUD dan autentikasi
