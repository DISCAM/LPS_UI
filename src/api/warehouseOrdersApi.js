const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getWarehouseOrdersRequest() {
  const response = await fetch(`${API_URL}/warehouse-orders`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się pobrać zleceń magazynowych");
  }

  return response.json();
}

export async function getWarehouseOrderRequest(warehouseOrderId) {
  const response = await fetch(
    `${API_URL}/warehouse-orders/${warehouseOrderId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(errorText || "Nie udało się pobrać zlecenia magazynowego");
  }

  return response.json();
}

export async function createWarehouseOrderRequest(warehouseOrderData) {
  const response = await fetch(`${API_URL}/warehouse-orders`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(warehouseOrderData),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Nie udało się utworzyć zlecenia magazynowego",
    );
  }

  return response.json();
}

export async function shipLogisticUnitRequest(warehouseOrderId, shipLogisticUnitData,) {
  const response = await fetch(
    `${API_URL}/warehouse-orders/${warehouseOrderId}/ship-logistic-unit`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(shipLogisticUnitData),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(errorText || "Nie udało się wydać jednostki logistycznej");
  }

  return response.json();
}
