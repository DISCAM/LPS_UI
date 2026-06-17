const API_URL = import.meta.env.VITE_API_URL;

export const getUsersRequest = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Nie udało się pobrać użytkowników");
  }

  return response.json();
};

export const createUserRequest = async (userData) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Nie udało się dodać użytkownika");
  }

  return response.text();
};

export async function assignRoleRequest(roleData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/assign-role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(roleData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się przypisać roli");
  }

  return response.text();
}

export async function deleteUserRequest(userId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/delete-user?id=${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się usunąć użytkownika");
  }

  return response.text();
}


export async function editUserRequest(userData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/edit-user?id=${userData.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Nie udało się edytować użytkownika");
  }

  return response.text();
}