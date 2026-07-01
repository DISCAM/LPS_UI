import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPrintJobsRequest } from "../../../api/printJobsApi";
import { formatDate } from "../../../helpers/formatDate";
import styles from "./PrintJobsPage.module.css";

const getStatusClassName = (status) => {
  switch (status) {
    case "QUEUED":
      return styles.statusQueued;

    case "SENT":
      return styles.statusSent;

    case "PRINTED":
      return styles.statusPrinted;

    case "ERROR":
      return styles.statusError;

    case "CANCELLED":
      return styles.statusCancelled;

    default:
      return styles.statusDefault;
  }
};

export const PrintJobsPage = () => {
  const [printJobs, setPrintJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadPrintJobs = async () => {
    const data = await getPrintJobsRequest();

    setPrintJobs(data);
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      await loadPrintJobs();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);

        await loadPrintJobs();
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return <p>Ładowanie wydruków...</p>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Wydruki</h2>
          <p>Aktualna kolejka oraz historia utworzonych zadań wydruku.</p>
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

      {!error && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID zadania</th>
                <th>Status</th>
                <th>Produkt</th>
                <th>Kod główny</th>
                <th>Szablon</th>
                <th>Drukarka</th>
                <th>Kopie</th>
                <th>Typ</th>
                <th>Utworzono</th>
                <th>Akcje</th>
              </tr>
            </thead>

            <tbody>
              {printJobs.length === 0 ? (
                <tr>
                  <td colSpan="10" className={styles.emptyState}>
                    Brak zadań wydruku.
                  </td>
                </tr>
              ) : (
                printJobs.map((printJob) => (
                  <tr key={printJob.printJobId}>
                    <td>{printJob.printJobId}</td>

                    <td>
                      <span
                        className={`${styles.statusBadge} ${getStatusClassName(
                          printJob.status,
                        )}`}
                      >
                        {printJob.status}
                      </span>
                    </td>

                    <td>{printJob.productName ?? "-"}</td>

                    <td className={styles.codeCell}>
                      {printJob.primaryCodeValue ?? "-"}
                    </td>

                    <td>{printJob.templateName}</td>

                    <td>{printJob.printerName}</td>

                    <td>{printJob.copies}</td>

                    <td>
                      {printJob.isReprint ? "Reprint" : "Pierwszy wydruk"}
                    </td>

                    <td>{formatDate(printJob.createdAt)}</td>

                    <td>
                      <Link
                        className={styles.detailsButton}
                        to={`/operations/print-jobs/${printJob.printJobId}`}
                      >
                        Szczegóły
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
