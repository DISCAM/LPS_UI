import { Outlet } from "react-router-dom";
import styles from "./KartotekiPage.module.css";

export const KartotekiPage = () => {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1>Kartoteki</h1>
        <p>Dane podstawowe wykorzystywane w systemie etykiet</p>
      </div>

      <Outlet />
    </section>
  );
};
