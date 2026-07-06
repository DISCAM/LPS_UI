const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getProductionLotsRequest(productionOrderId) {
  const response = await fetch(
    `${API_URL}/production-orders/${productionOrderId}/production-lots`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Nie udało się pobrać partii produkcyjnych.",
    );
  }

  return response.json();
}

export async function createProductionLotRequest(
  productionOrderId,
  productionLotData,
) {
  const response = await fetch(
    `${API_URL}/production-orders/${productionOrderId}/production-lots`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(productionLotData),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Nie udało się utworzyć partii produkcyjnej.",
    );
  }

  return response.json();
}