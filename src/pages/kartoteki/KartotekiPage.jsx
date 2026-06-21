import { NavLink, Outlet, useLocation } from "react-router-dom";
import styles from "./KartotekiPage.module.css";

const kartotekiLinks = [
  {
    to: "/kartoteki/products",
    title: "Produkty",
  },
  {
    to: "/kartoteki/customers",
    title: "Klienci",
  },
];

export const KartotekiPage = () => {
  const location = useLocation();

  const isKartotekiHome =
    location.pathname === "/kartoteki" || location.pathname === "/kartoteki/";

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1>Kartoteki</h1>
        <p>Dane podstawowe wykorzystywane w systemie etykiet</p>
      </div>

      {!isKartotekiHome && (
        <nav className={styles.quickNavigation} aria-label="Kartoteki">
          {kartotekiLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.quickCard} ${isActive ? styles.quickCardActive : ""}`
              }
            >
              <span className={styles.quickCardTitle}>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      )}

      <Outlet />
    </section>
  );
};
