import client from "../client";

export async function getCompanies() {
  const { data } = await client.get("/companies");
  return data;
}

export async function getCompany(id) {
  const { data } = await client.get(`/companies/${id}`);
  return data;
}

export async function addCompany(company) {
  const { data } = await client.post("/companies", company);
  return data;
}

export async function updateCompany(id, company) {
  const { data } = await client.put(`/companies/${id}`, company);
  return data;
}

export async function uploadCompanyLogo(companyId, file) {
  const formData = new FormData();

  formData.append("logo", file);

  const { data } = await client.post(
    `/companies/${companyId}/logo`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}