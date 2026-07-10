const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function createWarehouseReceiptRequest(warehouseReceiptData) {
  const response = await fetch(`${API_URL}/warehouse-receipts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(warehouseReceiptData),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Nie udało się utworzyć przyjęcia z produkcji",
    );
  }

  return response.json();
}
