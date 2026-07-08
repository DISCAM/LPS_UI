import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  cancelPrintJobRequest,
  getPrintJobByIdRequest,
  reprintPrintJobRequest,
  executePrintJobRequest,
  getPrintJobPreviewRequest,
} from "../../../api/printJobsApi";
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

//const showValue = (value) => {
//  return value || "—";
//};

const showValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
};

const formatOptionalDate = (value) => {
  return value ? formatDate(value) : "—";
};

const formatOptionalDateOnly = (value) => {
  if (!value) {
    return "—";
  }

  const [year, month, day] = String(value).split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}.${month}.${year}`;
};

export const PrintJobDetailsPage = () => {
  const { printJobId } = useParams();
  const navigate = useNavigate();
  const [printJob, setPrintJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReprinting, setIsReprinting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(null);

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

  useEffect(() => {
    let isCancelled = false;
    let objectUrl = null;

    const loadPreview = async () => {
      try {
        setIsPreviewLoading(true);
        setPreviewError(null);
        setPreviewUrl(null);

        const previewBlob = await getPrintJobPreviewRequest(printJobId);

        objectUrl = URL.createObjectURL(previewBlob);

        if (!isCancelled) {
          setPreviewUrl(objectUrl);
        }
      } catch (error) {
        if (!isCancelled) {
          setPreviewError(error.message);
        }
      } finally {
        if (!isCancelled) {
          setIsPreviewLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      isCancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [printJobId]);

  const handlePrint = async () => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz wysłać etykietę do drukarki?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsPrinting(true);
      setError(null);

      const updatedPrintJob = await executePrintJobRequest(printJobId);

      setPrintJob(updatedPrintJob);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz anulować to zadanie wydruku?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsCancelling(true);
      setError(null);

      await cancelPrintJobRequest(printJobId);

      const updatedPrintJob = await getPrintJobByIdRequest(printJobId);

      setPrintJob(updatedPrintJob);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReprint = async () => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz utworzyć reprint tego zadania?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsReprinting(true);
      setError(null);

      const result = await reprintPrintJobRequest(printJobId);

      navigate(`/operations/print-jobs/${result.printJobId}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsReprinting(false);
    }
  };

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

  const canBePrinted = printJob.status === "QUEUED";
  const canBeReprinted =
    printJob.status === "SENT" ||
    printJob.status === "PRINTED" ||
    printJob.status === "ERROR" ||
    printJob.status === "CANCELLED";

  const history = printJob.history ?? [];

  const labelData = printJob.labelData ?? {};

  const isProductionLabel = printJob.labelType === "PRODUCTION";

  return (
    <section className={styles.page}>
      <Link className={styles.backButton} to="/operations/print-jobs">
        ← Wróć do wydruków
      </Link>

      <div className={styles.header}>
        <div>
          <h2>Szczegóły zadania wydruku #{printJob.printJobId}</h2>
          <p>Informacje o zleceniu oraz jego historii.</p>
        </div>

        <div className={styles.headerActions}>
          <span
            className={`${styles.statusBadge} ${getStatusClassName(
              printJob.status,
            )}`}
          >
            {printJob.status}
          </span>

          {canBePrinted && (
            <button
              type="button"
              className={styles.printButton}
              onClick={handlePrint}
              disabled={isPrinting || isCancelling || isReprinting}
            >
              {isPrinting
                ? "Wysyłanie do drukarki..."
                : printJob.isReprint
                  ? "Drukuj reprint"
                  : "Drukuj etykietę"}
            </button>
          )}
          {printJob.status === "QUEUED" && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Anulowanie..." : "Anuluj zadanie"}
            </button>
          )}

          {canBeReprinted && (
            <button
              type="button"
              className={styles.reprintButton}
              onClick={handleReprint}
              disabled={isReprinting || isCancelling}
            >
              {isReprinting ? "Tworzenie reprintu..." : "Ponów wydruk"}
            </button>
          )}
        </div>
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
            {isPreviewLoading && (
              <p className={styles.previewInfo}>
                Generowanie podglądu etykiety...
              </p>
            )}

            {previewError && (
              <p className={styles.previewError}>{previewError}</p>
            )}

            {!isPreviewLoading && !previewError && previewUrl && (
              <img
                className={styles.previewImage}
                src={previewUrl}
                alt={`Podgląd etykiety dla zadania wydruku ${printJob.printJobId}`}
              />
            )}
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

        {isProductionLabel && (
          <section className={styles.card}>
            <h3>Dane produkcyjne</h3>

            <dl className={styles.detailsList}>
              <div>
                <dt>Zlecenie produkcyjne</dt>
                <dd>{showValue(labelData.productionOrderNumber)}</dd>
              </div>

              <div>
                <dt>Numer LOT</dt>
                <dd>{showValue(labelData.lotNumber)}</dd>
              </div>

              <div>
                <dt>Data produkcji</dt>
                <dd>{formatOptionalDateOnly(labelData.productionDate)}</dd>
              </div>

              <div>
                <dt>Data ważności</dt>
                <dd>{formatOptionalDateOnly(labelData.expirationDate)}</dd>
              </div>

              <div>
                <dt>Linia produkcyjna</dt>
                <dd>{showValue(labelData.productionLine)}</dd>
              </div>

              <div>
                <dt>Zmiana</dt>
                <dd>{showValue(labelData.shiftCode)}</dd>
              </div>

              <div>
                <dt>Ilość wyprodukowana</dt>
                <dd>{showValue(labelData.producedQuantity)}</dd>
              </div>

              <div>
                <dt>ID partii produkcyjnej</dt>
                <dd>{showValue(labelData.productionLotId)}</dd>
              </div>

              <div>
                <dt>ID zlecenia produkcyjnego</dt>
                <dd>{showValue(labelData.productionOrderId)}</dd>
              </div>
            </dl>
          </section>
        )}
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
