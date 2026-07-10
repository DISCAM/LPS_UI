const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getStockMovementsRequest() {
  const response = await fetch(`${API_URL}/stock-movements`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(errorText || "Nie udało się pobrać ruchów magazynowych");
  }

  return response.json();
}
