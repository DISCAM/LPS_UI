const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getPrintJobsRequest() {
  const response = await fetch(`${API_URL}/print-jobs`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(errorText || "Nie udało się pobrać listy zadań wydruku.");
  }

  return response.json();
}

export async function getPrintJobByIdRequest(printJobId) {
  const response = await fetch(`${API_URL}/print-jobs/${printJobId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Nie udało się pobrać szczegółów zadania wydruku.",
    );
  }

  return response.json();
}
