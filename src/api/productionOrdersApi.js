const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getProductionOrdersRequest() {
  const response = await fetch(`${API_URL}/production-orders`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Nie udało się pobrać zleceń produkcyjnych.",
    );
  }

  return response.json();
}

export async function createProductionOrderRequest(productionOrderData) {
  const response = await fetch(`${API_URL}/production-orders`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(productionOrderData),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Nie udało się utworzyć zlecenia produkcyjnego.",
    );
  }

  return response.json();
}