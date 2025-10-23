// src/services/diferensiasiMisiService.ts
import { fetchData } from "./api";

export async function getAllDiferensiasiMisi() {
  const data = await fetchData("diferensiasi-misi");
  return data.data; // sesuai format dari backend
}

export async function addDiferensiasiMisi(item: {
  tipe_data: string;
  unit_kerja: string;
  konten: string;
  type: string;
}) {
  return await fetchData("diferensiasi-misi", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function updateDiferensiasiMisi(
  id: number,
  item: {
    tipe_data: string;
    unit_kerja: string;
    konten: string;
    type: string;
  }
) {
  return await fetchData(`diferensiasi-misi/${id}`, {
    method: "PUT",
    body: JSON.stringify(item),
  });
}

export async function deleteDiferensiasiMisi(id: number) {
  return await fetchData(`diferensiasi-misi/${id}`, {
    method: "DELETE",
  });
}
