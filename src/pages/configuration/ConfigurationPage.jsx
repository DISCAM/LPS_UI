import { NavLink, Outlet } from "react-router-dom";
import styles from "./ConfigurationPage.module.css";

const configurationLinks = [
  {
    to: "/configuration/printers",
    title: "Drukarki",
  },
  {
    to: "/configuration/label-templates",
    title: "Szablony etykiet",
  },
];

export const ConfigurationPage = () => {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1>Konfiguracja</h1>
        <p>Ustawienia techniczne systemu etykietowania</p>
      </div>

      <nav className={styles.quickNavigation} aria-label="Konfiguracja">
        {configurationLinks.map((item) => (
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

      <Outlet />
    </section>
  );
};