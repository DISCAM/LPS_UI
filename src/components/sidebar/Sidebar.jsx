import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import styles from "./Sidebar.module.css";

const menuItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
  },
  {
    to: "/users",
    label: "Użytkownicy",
    allowedRoles: ["SuperAdmin"],
  },
  {
    label: "Kartoteki",
    pathPrefix: "/kartoteki",
    children: [
      {
        to: "/kartoteki/products",
        label: "Produkty",
      },
      {
        to: "/kartoteki/customers",
        label: "Klienci",
      },
    ],
  },
  {
    to: "/printers",
    label: "Drukarki",
  },
  {
    to: "/label-templates",
    label: "Szablony etykiet",
  },
];

export const Sidebar = () => {
  const { hasAnyRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isKartotekiOpen, setIsKartotekiOpen] = useState(
    location.pathname.startsWith("/kartoteki"),
  );

  const canShowItem = (item) => {
    if (!item.allowedRoles) {
      return true;
    }

    return hasAnyRole(item.allowedRoles);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>DISCAM Labels</div>

      <nav className={styles.nav}>
        {menuItems.filter(canShowItem).map((item) => {
          if (item.children) {
            const isGroupActive = location.pathname.startsWith(item.pathPrefix);

            return (
              <div key={item.label} className={styles.group}>
                <button
                  type="button"
                  className={`${styles.groupButton} ${
                    isGroupActive ? styles.groupButtonActive : ""
                  }`}
                  onClick={() => {
                    setIsKartotekiOpen((prev) => !prev);
                    navigate("/kartoteki");
                  }}
                >
                  <span>{item.label}</span>
                  <span>{isKartotekiOpen ? "▼" : "▶"}</span>
                </button>

                {isKartotekiOpen && (
                  <div className={styles.submenu}>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `${styles.link} ${styles.subLink} ${
                            isActive ? styles.active : ""
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
