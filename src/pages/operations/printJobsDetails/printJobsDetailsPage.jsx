import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPrintJobByIdRequest } from "../../../api/printJobsApi";
import { formatDate } from "../../../helpers/formatDate";
import styles from "./PrintJobDetailsPage.module.css";

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

const showValue = (value) => {
  return value || "—";
};

const formatOptionalDate = (value) => {
  return value ? formatDate(value) : "—";
};

export const PrintJobDetailsPage = () => {
  const { printJobId } = useParams();

  const [printJob, setPrintJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const loadPrintJob = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getPrintJobByIdRequest(printJobId);

        if (!isCancelled) {
          setPrintJob(data);
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

    loadPrintJob();

    return () => {
      isCancelled = true;
    };
  }, [printJobId]);

  if (isLoading) {
    return <p>Ładowanie szczegółów zadania wydruku...</p>;
  }

  if (error) {
    return (
      <section className={styles.page}>
        <Link className={styles.backButton} to="/operations/print-jobs">
          ← Wróć do wydruków
        </Link>

        <p className={styles.error}>{error}</p>
      </section>
    );
  }

  if (!printJob) {
    return null;
  }

  const history = printJob.history ?? [];

  return (
    <section className={styles.page}>
      <Link className={styles.backButton} to="/operations/print-jobs">
        ← Wróć do wydruków
      </Link>

      <div className={styles.header}>
        <div>
          <h2>Zadanie wydruku #{printJob.printJobId}</h2>

          <p>Szczegóły zlecenia, dane etykiety oraz historia realizacji.</p>
        </div>

        <span
          className={`${styles.statusBadge} ${getStatusClassName(
            printJob.status,
          )}`}
        >
          {printJob.status}
        </span>
      </div>

      {printJob.errorMessage && (
        <section className={styles.errorBox}>
          <strong>Błąd wydruku</strong>
          <p>{printJob.errorMessage}</p>
        </section>
      )}

      <div className={styles.grid}>
        <section className={styles.card}>
          <h3>Dane zlecenia</h3>

          <dl className={styles.detailsList}>
            <div>
              <dt>ID zadania</dt>
              <dd>{printJob.printJobId}</dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd>{printJob.status}</dd>
            </div>

            <div>
              <dt>Drukarka</dt>
              <dd>{showValue(printJob.printerName)}</dd>
            </div>

            <div>
              <dt>Liczba kopii</dt>
              <dd>{printJob.copies}</dd>
            </div>

            <div>
              <dt>Typ wydruku</dt>
              <dd>{printJob.isReprint ? "Reprint" : "Pierwszy wydruk"}</dd>
            </div>

            <div>
              <dt>Utworzono</dt>
              <dd>{formatOptionalDate(printJob.createdAt)}</dd>
            </div>

            <div>
              <dt>Utworzył</dt>
              <dd>{showValue(printJob.createdByUserName)}</dd>
            </div>

            <div>
              <dt>Ostatnia modyfikacja</dt>
              <dd>{formatOptionalDate(printJob.modifiedAt)}</dd>
            </div>

            <div>
              <dt>Zmodyfikował</dt>
              <dd>{showValue(printJob.modifiedByUserName)}</dd>
            </div>
          </dl>
        </section>

        <section className={styles.card}>
          <h3>Podgląd danych etykiety</h3>

          <div className={styles.labelPreview}>
            <div className={styles.previewHeader}>
              <span>{printJob.labelType}</span>
              <strong>{showValue(printJob.templateName)}</strong>
            </div>

            <div className={styles.previewBody}>
              <strong className={styles.previewProductName}>
                {showValue(printJob.productName)}
              </strong>

              <span>Kod produktu: {showValue(printJob.productCode)}</span>

              <div className={styles.barcodePlaceholder}>
                <div className={styles.barcodeLines} />
              </div>

              <strong className={styles.eanValue}>
                {showValue(printJob.primaryCodeValue)}
              </strong>
            </div>
          </div>

          <dl className={styles.detailsList}>
            <div>
              <dt>ID etykiety</dt>
              <dd>{printJob.labelId}</dd>
            </div>

            <div>
              <dt>Typ etykiety</dt>
              <dd>{showValue(printJob.labelType)}</dd>
            </div>

            <div>
              <dt>Kod produktu</dt>
              <dd>{showValue(printJob.productCode)}</dd>
            </div>

            <div>
              <dt>Produkt</dt>
              <dd>{showValue(printJob.productName)}</dd>
            </div>

            <div>
              <dt>EAN / kod główny</dt>
              <dd>{showValue(printJob.primaryCodeValue)}</dd>
            </div>

            <div>
              <dt>Szablon</dt>
              <dd>{showValue(printJob.templateName)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className={styles.card}>
        <h3>Historia statusów</h3>

        {history.length === 0 ? (
          <p className={styles.emptyHistory}>
            Brak zapisanej historii dla tego zadania.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Notatka</th>
                  <th>Błąd</th>
                </tr>
              </thead>

              <tbody>
                {history.map((historyItem, index) => (
                  <tr
                    key={`${historyItem.createdAt}-${historyItem.status}-${index}`}
                  >
                    <td>{formatOptionalDate(historyItem.createdAt)}</td>

                    <td>
                      <span
                        className={`${styles.statusBadge} ${getStatusClassName(
                          historyItem.status,
                        )}`}
                      >
                        {historyItem.status}
                      </span>
                    </td>

                    <td>{showValue(historyItem.note)}</td>

                    <td>{showValue(historyItem.errorMessage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
};
