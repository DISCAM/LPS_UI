import { NavLink, Outlet, useLocation } from "react-router-dom";
import styles from "./OperationsPage.module.css";

const operationsLinks = [
  {
    to: "/operations/print-ean",
    title: "Wydrukuj etykietę EAN",
  },
  {
    to: "/operations/production-orders",
    title: "Zlecenia produkcyjne",
  },

  {
    to: "/operations/warehouse-orders",
    title: "Zlecenia magazynowe",
  },
  {
    to: "/operations/print-jobs",
    title: "Wydruki",
  },
];

export const OperationsPage = () => {
  const location = useLocation();

  const isOperationsHome =
    location.pathname === "/operations" || location.pathname === "/operations/";

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1>Operacje</h1>
        <p>Obsługa procesów drukowania i identyfikacji w systemie etykiet</p>
      </div>

      {!isOperationsHome && (
        <nav className={styles.quickNavigation} aria-label="Operacje">
          {operationsLinks.map((item) => (
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
