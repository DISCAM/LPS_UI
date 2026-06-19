const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getProductsRequest() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/products`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się pobrać produktów");
  }

  return response.json();
}

export async function createProductRequest(productData) {
  const response = await fetch(`${API_URL}/product-add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się dodać produktu");
  }

  return response.text();
}

export async function editProductRequest(productData) {
  const response = await fetch(`${API_URL}/product-edit/${productData.id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się edytować produktu");
  }

  return response.text();
}

export async function deleteProductRequest(productId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/product-delete/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się dezaktywować produktu");
  }

  return response.text();
}
