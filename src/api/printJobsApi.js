const API_URL = import.meta.env.VITE_API_URL;

export async function getPrintJobsRequest() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/print-jobs`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(errorText || "Nie udało się pobrać wydruków");
  }

  return response.json();
}
