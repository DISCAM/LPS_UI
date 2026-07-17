import { useState } from "react";
import styles from "./AssignRoleForm.module.css";

const availableRoles = ["SuperAdmin", "Admin", "Manager", "User"];

export const AssignRoleForm = ({ user, onSubmit, onCancel }) => {
  const [roleName, setRoleName] = useState(user.roleName ?? "User");

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      email: user.email,
      role: roleName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Przypisz rolę</h2>

      <p>
        Użytkownik: <strong>{user.email}</strong>
      </p>

      <div className={styles.row}>
        <label htmlFor="assignedRole">Rola</label>

        <select
          id="assignedRole"
          name="roleName"
          value={roleName}
          onChange={(event) => setRoleName(event.target.value)}
          required
        >
          {availableRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton}>
          Zapisz rolę
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
