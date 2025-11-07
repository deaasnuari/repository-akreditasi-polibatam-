# TODO: Integrate relevansiPendidikanService into page.tsx

- [ ] Import relevansiPendidikanService and types from service file
- [ ] Remove local API_BASE and type definitions
- [ ] Replace fetchData function to use service.fetchData(activeSubTab)
- [ ] Update handleSave to use service.createData() and service.updateData()
- [ ] Update handleDelete to use service.deleteData(id)
- [ ] Update handleImport to use service.importExcel(file, activeSubTab)
- [ ] Adjust error handling for service methods
- [ ] Test all CRUD operations
