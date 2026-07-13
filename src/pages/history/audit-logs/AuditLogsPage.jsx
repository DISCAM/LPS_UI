import { useEffect, useMemo, useState } from "react";
import { getAuditLogsRequest } from "../../../api/auditLogsApi";
import styles from "./AuditLogsPage.module.css";

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("pl-PL");
};

const showValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
};

const getActionLabel = (action) => {
  const actionLabels = {
    CREATE_WAREHOUSE_ORDER: "Utworzenie zlecenia magazynowego",
    SHIP_LOGISTIC_UNIT: "Wydanie jednostki logistycznej",
    CREATE_WAREHOUSE_RECEIPT: "Przyjęcie z produkcji",
    CREATE_PRODUCTION_ORDER: "Utworzenie zlecenia produkcyjnego",
    CREATE_PRODUCTION_LOT: "Utworzenie partii produkcyjnej",

    CREATE_PRINT_JOB: "Utworzenie zadania wydruku",
    REPRINT_PRINT_JOB: "Utworzenie reprintu",
    CANCEL_PRINT_JOB: "Anulowanie zadania wydruku",
    EXECUTE_PRINT_JOB: "Uruchomienie wydruku",
    SEND_PRINT_JOB: "Wysłanie wydruku do NiceLabel",
    PRINT_JOB_ERROR: "Błąd wysyłania wydruku",
  };

  return actionLabels[action] ?? action;
};

const getEntityLabel = (entityName) => {
  const entityLabels = {
    WarehouseOrder: "Zlecenie magazynowe",
    LogisticUnit: "Jednostka logistyczna",
    ProductionOrder: "Zlecenie produkcyjne",
    ProductionLot: "Partia produkcyjna",
    PrintJob: "Zadanie wydruku",
    Label: "Etykieta",
  };

  return entityLabels[entityName] ?? entityName;
};

export const AuditLogsPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: "",
    entityName: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAuditLogs = async () => {
    const auditLogsData = await getAuditLogsRequest();

    setAuditLogs(auditLogsData);
  };

  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      try {
        setError("");

        const auditLogsData = await getAuditLogsRequest();

        if (!isCancelled) {
          setAuditLogs(auditLogsData);
        }
      } catch (error) {
        if (!isCancelled) {
          setError(error.message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      isCancelled = true;
    };
  }, []);

  const actions = useMemo(() => {
    return [...new Set(auditLogs.map((auditLog) => auditLog.action))].sort();
  }, [auditLogs]);

  const entityNames = useMemo(() => {
    return [
      ...new Set(auditLogs.map((auditLog) => auditLog.entityName)),
    ].sort();
  }, [auditLogs]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((auditLog) => {
      const matchesAction =
        !filters.action || auditLog.action === filters.action;

      const matchesEntity =
        !filters.entityName || auditLog.entityName === filters.entityName;

      return matchesAction && matchesEntity;
    });
  }, [auditLogs, filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError("");

      await loadAuditLogs();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      action: "",
      entityName: "",
    });
  };

  if (isLoading) {
    return <p>Ładowanie dziennika audytu...</p>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Audyt operacji</h2>
          <p>
            Historia najważniejszych operacji wykonanych przez użytkowników.
          </p>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Odświeżanie..." : "Odśwież"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.filtersCard}>
        <label className={styles.field}>
          Akcja
          <select
            name="action"
            value={filters.action}
            onChange={handleFilterChange}
          >
            <option value="">Wszystkie akcje</option>

            {actions.map((action) => (
              <option key={action} value={action}>
                {getActionLabel(action)}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          Rodzaj obiektu
          <select
            name="entityName"
            value={filters.entityName}
            onChange={handleFilterChange}
          >
            <option value="">Wszystkie obiekty</option>

            {entityNames.map((entityName) => (
              <option key={entityName} value={entityName}>
                {getEntityLabel(entityName)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={handleClearFilters}
        >
          Wyczyść filtry
        </button>
      </section>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Użytkownik</th>
              <th>Akcja</th>
              <th>Obiekt</th>
              <th>ID obiektu</th>
              <th>Szczegóły</th>
            </tr>
          </thead>

          <tbody>
            {filteredAuditLogs.map((auditLog) => (
              <tr key={auditLog.auditLogId}>
                <td>{auditLog.auditLogId}</td>
                <td>{formatDate(auditLog.createdAt)}</td>
                <td>{showValue(auditLog.createdByUserName)}</td>
                <td>
                  <span className={styles.actionBadge}>
                    {getActionLabel(auditLog.action)}
                  </span>

                  <span className={styles.technicalValue}>
                    {auditLog.action}
                  </span>
                </td>
                <td>{getEntityLabel(auditLog.entityName)}</td>
                <td>{showValue(auditLog.entityId)}</td>
                <td className={styles.detailsCell}>
                  {showValue(auditLog.details)}
                </td>
              </tr>
            ))}

            {filteredAuditLogs.length === 0 && (
              <tr>
                <td colSpan="7" className={styles.emptyState}>
                  Brak wpisów spełniających wybrane kryteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className={styles.summary}>
        Wyświetlono {filteredAuditLogs.length} z {auditLogs.length} wpisów.
      </p>
    </section>
  );
};
