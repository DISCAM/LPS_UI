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

    const dataToSend = {
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
    };

    await onSubmit(dataToSend);

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
        <label htmlFor="newUserEmail">E-mail</label>

        <input
          id="newUserEmail"
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
        <label htmlFor="newUserFullName">Imię i nazwisko</label>

        <input
          id="newUserFullName"
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
        <label htmlFor="newUserPassword">Hasło</label>

        <input
          id="newUserPassword"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Wprowadź hasło"
          autoComplete="new-password"
          required
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="newUserConfirmPassword">Powtórz hasło</label>

        <input
          id="newUserConfirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Powtórz hasło"
          autoComplete="new-password"
          required
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton}>
          Zapisz
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
