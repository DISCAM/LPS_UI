import { useState } from "react";
import styles from "./AssignRoleForm.module.css";

const availableRoles = ["SuperAdmin", "Operator", "User", "Admin", "Manager"];

export const AssignRoleForm = ({ user, onSubmit, onCancel }) => {
  const [roleName, setRoleName] = useState(user.roleName);

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
        <label>Rola</label>
        <select
          value={roleName}
          onChange={(event) => setRoleName(event.target.value)}
        >
          {availableRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.actions}>
        <button type="submit">Zapisz rolę</button>
        <button type="button" onClick={onCancel}>
          Anuluj
        </button>
      </div>
    </form>
  );
};
