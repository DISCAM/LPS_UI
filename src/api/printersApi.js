const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getPrintersRequest() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/printers`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się pobrać drukarek");
  }

  return response.json();
}

export async function createPrinterRequest(printerData) {
  const response = await fetch(`${API_URL}/printer-add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(printerData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się dodać drukarki");
  }

  return response.text();
}

export async function editPrinterRequest(printerData) {
  const response = await fetch(
    `${API_URL}/printer-edit/${printerData.printerId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(printerData),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się edytować drukarki");
  }

  return response.text();
}

export async function deletePrinterRequest(printerId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/printer-delete/${printerId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się dezaktywować drukarki");
  }

  return response.text();
}