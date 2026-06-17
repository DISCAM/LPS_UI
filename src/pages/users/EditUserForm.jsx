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

    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Edytuj użytkownika</h2>

      <div className={styles.row}>
        <label>ID</label>
        <input value={form.id} disabled />
      </div>

      <div className={styles.row}>
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.row}>
        <label>Imię i nazwisko</label>
        <input
          name="fullName"
          type="text"
          value={form.fullName}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.row}>
        <label>Aktualne role</label>
        <input value={form.roleNames.join(", ")} disabled />
      </div>

      <div className={styles.actions}>
        <button type="submit">Zapisz zmiany</button>
        <button type="button" onClick={onCancel}>
          Anuluj
        </button>
      </div>
    </form>
  );
};