import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardSummaryRequest } from "../../api/dashboardApi";
import styles from "./DashboardPage.module.css";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("pl-PL");
}

function formatQuantity(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return Number(value).toLocaleString("pl-PL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

function showValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
}

const summaryCards = [
  {
    key: "activeProductionOrdersCount",
    title: "Aktywne zlecenia produkcyjne",
    link: "/operations/production-orders",
  },
  {
    key: "productionLotsTodayCount",
    title: "Partie utworzone dzisiaj",
    link: "/operations/production-orders",
  },
  {
    key: "logisticUnitsInStockCount",
    title: "Jednostki w magazynie",
    link: "/operations/logistic-units",
  },
  {
    key: "logisticUnitsShippedCount",
    title: "Jednostki wydane",
    link: "/operations/logistic-units",
  },
  {
    key: "warehouseOrdersNewCount",
    title: "Nowe zlecenia magazynowe",
    link: "/operations/warehouse-orders",
  },
  {
    key: "warehouseOrdersCompletedCount",
    title: "Zakończone zlecenia magazynowe",
    link: "/operations/warehouse-orders",
  },
  {
    key: "printJobsQueuedCount",
    title: "Wydruki oczekujące",
    link: "/operations/print-jobs",
  },
  {
    key: "printJobsSentCount",
    title: "Wydruki wysłane",
    link: "/operations/print-jobs",
  },
  {
    key: "printJobsErrorCount",
    title: "Błędy wydruku",
    link: "/operations/print-jobs",
  },
];

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    const dashboardData = await getDashboardSummaryRequest();

    setSummary(dashboardData);
  };

  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      try {
        setError("");

        const dashboardData = await getDashboardSummaryRequest();

        if (!isCancelled) {
          setSummary(dashboardData);
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

  const handleRefresh = async () => {
    try {
      setError("");

      await loadDashboard();
    } catch (error) {
      setError(error.message);
    }
  };

  if (isLoading) {
    return <p>Ładowanie dashboardu...</p>;
  }

  if (!summary) {
    return (
      <section className={styles.page}>
        <p>Brak danych dashboardu.</p>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Dashboard</h2>
          <p>Podsumowanie pracy systemu etykiet i magazynu.</p>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleRefresh}
        >
          Odśwież
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.cardsGrid}>
        {summaryCards.map((card) => (
          <Link key={card.key} className={styles.summaryCard} to={card.link}>
            <span className={styles.cardValue}>{summary[card.key] ?? 0}</span>
            <span className={styles.cardTitle}>{card.title}</span>
          </Link>
        ))}
      </div>

      <div className={styles.sectionsGrid}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Ostatnie ruchy magazynowe</h3>

            <Link to="/operations/warehouse-receipts">
              Przyjęcia z produkcji
            </Link>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Typ</th>
                  <th>Produkt</th>
                  <th>LOT</th>
                  <th>SSCC</th>
                  <th>Zlecenie</th>
                  <th>Ilość</th>
                  <th>Utworzono</th>
                </tr>
              </thead>

              <tbody>
                {summary.recentStockMovements.map((movement) => (
                  <tr key={movement.stockMovementId}>
                    <td>{movement.stockMovementId}</td>
                    <td>
                      <span className={styles.badge}>
                        {movement.movementType}
                      </span>
                    </td>
                    <td>
                      <strong>{movement.productName}</strong>
                      <span className={styles.smallText}>
                        {movement.productCode}
                      </span>
                    </td>
                    <td>{movement.lotNumber}</td>
                    <td className={styles.codeCell}>
                      {showValue(movement.sscc)}
                    </td>
                    <td>{showValue(movement.warehouseOrderNumber)}</td>
                    <td>{formatQuantity(movement.quantity)}</td>
                    <td>{formatDate(movement.createdAt)}</td>
                  </tr>
                ))}

                {summary.recentStockMovements.length === 0 && (
                  <tr>
                    <td colSpan="8" className={styles.emptyState}>
                      Brak ruchów magazynowych.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Ostatnie zadania wydruku</h3>

            <Link to="/operations/print-jobs">Historia wydruków</Link>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Typ etykiety</th>
                  <th>Kod</th>
                  <th>Produkt</th>
                  <th>Drukarka</th>
                  <th>Kopie</th>
                  <th>Utworzono</th>
                </tr>
              </thead>

              <tbody>
                {summary.recentPrintJobs.map((printJob) => (
                  <tr key={printJob.printJobId}>
                    <td>
                      <Link
                        className={styles.detailsLink}
                        to={`/operations/print-jobs/${printJob.printJobId}`}
                      >
                        {printJob.printJobId}
                      </Link>
                    </td>
                    <td>
                      <span className={styles.badge}>{printJob.status}</span>
                    </td>
                    <td>{printJob.labelType}</td>
                    <td className={styles.codeCell}>
                      {showValue(printJob.primaryCodeValue)}
                    </td>
                    <td>
                      <strong>{showValue(printJob.productName)}</strong>
                      <span className={styles.smallText}>
                        {showValue(printJob.productCode)}
                      </span>
                    </td>
                    <td>{printJob.printerName}</td>
                    <td>{printJob.copies}</td>
                    <td>{formatDate(printJob.createdAt)}</td>
                  </tr>
                ))}

                {summary.recentPrintJobs.length === 0 && (
                  <tr>
                    <td colSpan="8" className={styles.emptyState}>
                      Brak zadań wydruku.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
};
