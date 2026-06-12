import styles from "./TopBar.module.css";

export const TopBar = () => {
  return (
    <header className={styles.topbar}>
      <div>
        <strong>Label Printing System</strong>
      </div>

      <div className={styles.userBox}>
        <span>Admin</span>
        <button className={styles.logoutButton}>Wyloguj</button>
      </div>
    </header>
  );
};
