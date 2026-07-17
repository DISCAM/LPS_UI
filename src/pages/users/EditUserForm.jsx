import { useState } from "react";
import styles from "./AddUserForm.module.css";

const getUserRoles = (user) => {
  if (Array.isArray(user.roleNames)) {
    return user.roleNames;
  }

  if (Array.isArray(user.roles)) {
    return user.roles;
  }

  if (typeof user.roleName === "string" && user.roleName.trim() !== "") {
    return user.roleName.split(",").map((role) => role.trim());
  }

  return [];
};

export const EditUserForm = ({ user, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    id: user.id,
    email: user.email ?? "",
    fullName: user.fullName ?? "",
    roleNames: getUserRoles(user),
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const dataToSend = {
      ...form,
      email: form.email.trim(),
      fullName: form.fullName.trim(),
    };

    await onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Edytuj użytkownika</h2>

      <div className={styles.row}>
        <label htmlFor="editUserId">ID</label>

        <input id="editUserId" value={form.id ?? ""} disabled />
      </div>

      <div className={styles.row}>
        <label htmlFor="editUserEmail">E-mail</label>

        <input
          id="editUserEmail"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="np. jan.kowalski@firma.pl"
          autoComplete="email"
          maxLength={150}
          required
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="editUserFullName">Imię i nazwisko</label>

        <input
          id="editUserFullName"
          name="fullName"
          type="text"
          value={form.fullName}
          onChange={handleChange}
          placeholder="np. Jan Kowalski"
          autoComplete="name"
          maxLength={150}
          required
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="editUserRoles">Aktualne role</label>

        <input id="editUserRoles" value={form.roleNames.join(", ")} disabled />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton}>
          Zapisz zmiany
        </button>

        <button
          type="button"
          onClick={onCancel}
          className={styles.actionButton}
        >
          Anuluj
        </button>
      </div>
    </form>
  );
};
