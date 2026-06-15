const API_URL = import.meta.env.VITE_API_URL;

export const loginRequest = async (credentials) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Nieprawidłowy login lub hasło");
  }

  return response.json();
};

export const getMeRequest = async (token) => {
  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Nie udało się pobrać danych użytkownika");
  }

  return response.json();
};
