import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import styles from "./Sidebar.module.css";

const menuItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/users", label: "Użytkownicy", allowedRoles: ["SuperAdmin"] },
  { to: "/products", label: "Produkty" },
  { to: "/printers", label: "Drukarki" },
  { to: "/label-templates", label: "Szablony etykiet" },
];

export const Sidebar = () => {
  const { hasAnyRole } = useAuth();

  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.allowedRoles) {
      return true;
    }

    return hasAnyRole(item.allowedRoles);
  });

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>DISCAM Labels</div>

      <nav className={styles.nav}>
        {visibleMenuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
