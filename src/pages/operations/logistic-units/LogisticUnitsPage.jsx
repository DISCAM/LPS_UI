import { useEffect, useState } from "react";
import { getLogisticUnitsRequest } from "../../../api/logisticUnitsApi";
import { formatDate } from "../../../helpers/formatDate";
import styles from "./LogisticUnitsPage.module.css";

const showValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
};

const formatOptionalDate = (value) => {
  return value ? formatDate(value) : "—";
};

const formatDateOnly = (value) => {
  if (!value) {
    return "—";
  }

  const [year, month, day] = String(value).split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}.${month}.${year}`;
};

const formatQuantity = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return Number(value).toLocaleString("pl-PL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
};

export const LogisticUnitsPage = () => {
  const [logisticUnits, setLogisticUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const loadInitialLogisticUnits = async () => {
      try {
        const data = await getLogisticUnitsRequest();

        if (!isCancelled) {
          setLogisticUnits(data);
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

    loadInitialLogisticUnits();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const data = await getLogisticUnitsRequest();

      setLogisticUnits(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <p>Ładowanie jednostek logistycznych...</p>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Jednostki logistyczne</h2>
          <p>
            Lista utworzonych palet, kartonów i pudełek wraz z ich zawartością.
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

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>SSCC</th>
              <th>Typ</th>
              <th>Status</th>
              <th>Zawartość</th>
              <th>Ilość razem</th>
              <th>Zlecenie magazynowe</th>
              <th>Utworzył</th>
              <th>Utworzono</th>
            </tr>
          </thead>

          <tbody>
            {logisticUnits.length === 0 ? (
              <tr>
                <td className={styles.emptyState} colSpan="9">
                  Brak jednostek logistycznych.
                </td>
              </tr>
            ) : (
              logisticUnits.map((logisticUnit) => (
                <tr key={logisticUnit.logisticUnitId}>
                  <td>{logisticUnit.logisticUnitId}</td>

                  <td className={styles.codeCell}>
                    {showValue(logisticUnit.sscc)}
                  </td>

                  <td>{showValue(logisticUnit.unitType)}</td>

                  <td>
                    <span className={styles.statusBadge}>
                      {showValue(logisticUnit.status)}
                    </span>
                  </td>

                  <td>
                    {logisticUnit.items.length === 0 ? (
                      "—"
                    ) : (
                      <div className={styles.itemsList}>
                        {logisticUnit.items.map((item) => (
                          <div
                            key={item.logisticUnitItemId}
                            className={styles.itemRow}
                          >
                            <strong>{showValue(item.productName)}</strong>

                            <span className={styles.productCode}>
                              {showValue(item.productCode)}
                            </span>

                            <span className={styles.smallText}>
                              LOT: {showValue(item.lotNumber)} | prod.{" "}
                              {formatDateOnly(item.productionDate)}
                              {item.expirationDate
                                ? ` | ważn. ${formatDateOnly(
                                    item.expirationDate,
                                  )}`
                                : ""}
                            </span>

                            <span className={styles.smallText}>
                              Ilość: {formatQuantity(item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  <td>{formatQuantity(logisticUnit.totalQuantity)}</td>

                  <td>{showValue(logisticUnit.warehouseOrderNumber)}</td>

                  <td>{showValue(logisticUnit.createdByUserName)}</td>

                  <td>{formatOptionalDate(logisticUnit.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
