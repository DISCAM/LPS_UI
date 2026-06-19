const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getCustomersRequest() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/customers`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się pobrać klientów");
  }

  return response.json();
}

export async function createCustomerRequest(customerData) {
  const response = await fetch(`${API_URL}/customer-add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(customerData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się dodać klienta");
  }

  return response.text();
}

export async function editCustomerRequest(customerData) {
  const response = await fetch(`${API_URL}/customer-edit/${customerData.id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(customerData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się edytować klienta");
  }

  return response.text();
}

export async function deleteCustomerRequest(customerId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/customer-delete/${customerId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się dezaktywować klienta");
  }

  return response.text();
}
