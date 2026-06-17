import { useState } from "react";
import styles from "./AddUserForm.module.css";

export const AddUserForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Hasła nie są takie same");
      return;
    }

    setError(null);

    await onSubmit(form);

    setForm({
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Dodaj użytkownika</h2>

      {error && <p className={styles.error}>{error}</p>}

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
        <label>Hasło</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.row}>
        <label>Powtórz hasło</label>
        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.actions}>
        <button type="submit">Zapisz</button>
        <button type="button" onClick={onCancel}>
          Anuluj
        </button>
      </div>
    </form>
  );
};
