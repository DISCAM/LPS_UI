import styles from "./TopBar.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export const TopBar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogaut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className={styles.topbar}>
      <div>
        <strong>Label Printing System</strong>
      </div>

      <div className={styles.userBox}>
        {/*<span>Admin</span>*/}
        <button onClick={handleLogaut} className={styles.logoutButton}>
          Wyloguj
        </button>
      </div>
    </header>
  );
};
