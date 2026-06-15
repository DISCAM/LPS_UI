import styles from "./TopBar.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className={styles.topbar}>
      <div>
        <strong>Label Printing System</strong>
      </div>

      <div className={styles.userBox}>
        <span>
          {" "}
          {user?.email && (
            <span>
              {user.userName} | <b>{user.roles.join(", ")}</b>
            </span>
          )}
        </span>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Wyloguj
        </button>
      </div>
    </header>
  );
};
