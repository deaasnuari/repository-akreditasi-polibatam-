# TODO: Simplify relevansi_pkm schema like relevansi_penelitian

## Steps:
- [x] Edit backend/prisma/schema.prisma: Change relevansi_pkm model to use `data Json` instead of specific fields, matching relevansi_penelitian.
- [x] Update backend/controllers/relevansiPkmController.js: Modify getData to return { id, ...data }, add updateData and deleteData methods like relevansiPenelitianController.js.
- [ ] Run Prisma migration: `npx prisma migrate dev --name simplify_relevansi_pkm_schema` (failed due to DATABASE_URL not set)
- [ ] Verify the changes work correctly.
