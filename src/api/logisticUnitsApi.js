const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getLogisticUnitsRequest() {
  const response = await fetch(`${API_URL}/logistic-units`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Nie udało się pobrać jednostek logistycznych",
    );
  }

  return response.json();
}
