import { fetchData } from "./api";

export interface DiferensiasiItem {
  tipe_data: string;
  unit_kerja: string;
  konten: string;
  type: string;
}

export async function getAllDiferensiasiMisi() {
  const data = await fetchData("diferensiasi-misi");
  return data.data;
}

export async function addDiferensiasiMisi(item: DiferensiasiItem) {
  return await fetchData("diferensiasi-misi", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function updateDiferensiasiMisi(id: number, item: DiferensiasiItem) {
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
