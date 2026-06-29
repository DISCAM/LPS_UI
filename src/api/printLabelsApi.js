const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function printEanRequest(printEanData) {
  const response = await fetch(`${API_URL}/print-ean`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(printEanData),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(errorText || "Nie udało się utworzyć zadania wydruku EAN");
  }

  return response.json();
}
