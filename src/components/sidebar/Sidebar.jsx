import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import styles from "./Sidebar.module.css";

const menuItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
  },

  {
    groupId: "kartoteki",
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
    groupId: "configuration",
    label: "Konfiguracja",
    pathPrefix: "/configuration",

    children: [
      {
        to: "/configuration/printers",
        label: "Drukarki",
      },
      {
        to: "/configuration/label-templates",
        label: "Szablony etykiet",
        allowedRoles: ["SuperAdmin", "Admin", "Manager"],
      },
    ],
  },

  {
    groupId: "operations",
    label: "Operacje",
    pathPrefix: "/operations",
    children: [
      {
        to: "/operations/print-ean",
        label: "Wydrukuj Etykietę EAN",
      },
      {
        to: "/operations/production-orders",
        label: "Zlecenia produkcyjne",
      },
      {
        to: "/operations/production-lots",
        label: "Partie produkcyjne",
      },
      {
        to: "/operations/logistic-units",
        label: "Jednostki logistyczne",
      },
      {
        to: "/operations/warehouse-orders",
        label: "Zlecenia magazynowe",
      },
      {
        to: "/operations/print-jobs",
        label: "Wydruki",
      },
    ],
  },

  {
    groupId: "history",
    label: "Historia i kontrola",
    pathPrefix: "/history",
    children: [
      {
        to: "/history/print-jobs",
        label: "Historia wydruków",
      },
      {
        to: "/history/scan-events",
        label: "Zdarzenia skanowania",
      },
      {
        to: "/history/reprint-requests",
        label: "Wnioski o ponowny wydruk",
      },
      {
        to: "/history/audit-logs",
        label: "Audyt",
      },
    ],
  },

  {
    groupId: "admin",
    label: "Administracja",
    pathPrefix: "/users",
    allowedRoles: ["SuperAdmin"],
    children: [
      {
        to: "/users",
        label: "Użytkownicy",
      },
    ],
  },
];

export const Sidebar = () => {
  const { hasAnyRole } = useAuth();
  const location = useLocation();

  const [openGroups, setOpenGroups] = useState(() => ({
    kartoteki: location.pathname.startsWith("/kartoteki"),
    configuration: location.pathname.startsWith("/configuration"),
    operations: location.pathname.startsWith("/operations"),
    history: location.pathname.startsWith("/history"),
    admin: location.pathname.startsWith("/users"),
  }));

  const canShowItem = (item) => {
    if (!item.allowedRoles) {
      return true;
    }

    return hasAnyRole(item.allowedRoles);
  };

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      [groupId]: !prev[groupId],
    }));
  };

  const openOnlyGroup = (groupId) => {
    setOpenGroups({
      [groupId]: true,
    });
  };

  const closeAllGroups = () => {
    setOpenGroups({});
  };

  return (
    <aside className={styles.sidebar}>
      <Link to="/dashboard" className={styles.logo} onClick={closeAllGroups}>
        DISCAM Labels
      </Link>

      <nav className={styles.nav}>
        {menuItems.filter(canShowItem).map((item) => {
          if (item.children) {
            const visibleChildren = item.children.filter(canShowItem);

            if (visibleChildren.length === 0) {
              return null;
            }

            const isGroupActive = location.pathname.startsWith(item.pathPrefix);
            const isGroupOpen = Boolean(openGroups[item.groupId]);

            return (
              <div key={item.groupId} className={styles.group}>
                <button
                  type="button"
                  className={`${styles.groupButton} ${
                    isGroupActive ? styles.groupButtonActive : ""
                  }`}
                  onClick={() => toggleGroup(item.groupId)}
                >
                  <span>{item.label}</span>
                  <span>{isGroupOpen ? "▼" : "▶"}</span>
                </button>

                {isGroupOpen && (
                  <div className={styles.submenu}>
                    {visibleChildren.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onClick={() => openOnlyGroup(item.groupId)}
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
              onClick={closeAllGroups}
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
