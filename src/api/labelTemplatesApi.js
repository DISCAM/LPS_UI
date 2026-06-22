const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getLabelTemplatesRequest() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/label-templates`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się pobrać szablonów etykiet");
  }

  return response.json();
}

export async function createLabelTemplateRequest(labelTemplateData) {
  const response = await fetch(`${API_URL}/label-template-add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(labelTemplateData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się dodać szablonu etykiety");
  }

  return response.text();
}

export async function editLabelTemplateRequest(labelTemplateData) {
  const response = await fetch(
    `${API_URL}/label-template-edit/${labelTemplateData.id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(labelTemplateData),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się edytować szablonu etykiety");
  }

  return response.text();
}

export async function deleteLabelTemplateRequest(labelTemplateId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/label-template-delete/${labelTemplateId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || "Nie udało się dezaktywować szablonu etykiety",
    );
  }

  return response.text();
}
