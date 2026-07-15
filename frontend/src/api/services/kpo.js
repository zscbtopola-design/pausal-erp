import client from "../client";

export async function getKpo({
  companyId = 1,
  dateFrom = "",
  dateTo = "",
} = {}) {
  const params = {
    company_id: companyId,
  };

  if (dateFrom) {
    params.date_from = dateFrom;
  }

  if (dateTo) {
    params.date_to = dateTo;
  }

  const { data } = await client.get("/kpo", {
    params,
  });

  return data;
}