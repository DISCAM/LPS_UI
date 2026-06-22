import { useEffect, useState } from "react";
import {
  createPrinterRequest,
  deletePrinterRequest,
  editPrinterRequest,
  getPrintersRequest,
} from "../../api/printersApi";
import { formatDate } from "../../helpers/formatDate";
import { PrinterForm } from "./PrinterForm";
import styles from "./PrintersPage.module.css";

export const PrintersPage = () => {
  const [printers, setPrinters] = useState([]);
  const [isFormShown, setIsFormShown] = useState(false);
  const [selectedPrinterForEdit, setSelectedPrinterForEdit] = useState(null);
  const [selectedPrinterForDetails, setSelectedPrinterForDetails] =
    useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPrinters = async () => {
    const data = await getPrintersRequest();
    setPrinters(data);
  };

  const handleCreatePrinter = async (formData) => {
    try {
      setError(null);

      await createPrinterRequest(formData);
      await loadPrinters();

      setIsFormShown(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditPrinter = async (formData) => {
    try {
      setError(null);

      await editPrinterRequest(formData);
      await loadPrinters();

      setSelectedPrinterForEdit(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeletePrinter = async (printerId) => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz dezaktywować tę drukarkę?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await deletePrinterRequest(printerId);
      await loadPrinters();

      if (selectedPrinterForDetails?.printerId === printerId) {
        setSelectedPrinterForDetails(null);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadPrinters();
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return <p>Ładowanie drukarek...</p>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Drukarki</h1>
          <p>Zarządzanie konfiguracją drukarek etykiet</p>
        </div>

        {!isFormShown && !selectedPrinterForEdit && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              setIsFormShown(true);
              setSelectedPrinterForEdit(null);
              setSelectedPrinterForDetails(null);
            }}
          >
            Dodaj drukarkę
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isFormShown && (
        <PrinterForm
          key="create-printer"
          title="Dodaj drukarkę"
          submitText="Dodaj drukarkę"
          onSubmit={handleCreatePrinter}
          onCancel={() => setIsFormShown(false)}
        />
      )}

      {selectedPrinterForEdit && (
        <PrinterForm
          key={selectedPrinterForEdit.printerId}
          printer={selectedPrinterForEdit}
          title="Edytuj drukarkę"
          submitText="Zapisz zmiany"
          onSubmit={handleEditPrinter}
          onCancel={() => setSelectedPrinterForEdit(null)}
        />
      )}

      {selectedPrinterForDetails && (
        <section className={styles.details}>
          <div className={styles.detailsHeader}>
            <h2>Szczegóły drukarki</h2>

            <button
              type="button"
              className={styles.actionButton}
              onClick={() => setSelectedPrinterForDetails(null)}
            >
              Zamknij
            </button>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>ID</span>
              <strong className={styles.detailsValue}>
                {selectedPrinterForDetails.printerId}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Nazwa</span>
              <strong className={styles.detailsValue}>
                {selectedPrinterForDetails.name}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Adres IP</span>
              <strong className={styles.detailsValue}>
                {selectedPrinterForDetails.ipAddress}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Lokalizacja</span>
              <strong className={styles.detailsValue}>
                {selectedPrinterForDetails.location ?? "-"}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Model drukarki</span>
              <strong className={styles.detailsValue}>
                {selectedPrinterForDetails.printerModel ?? "-"}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Typ integracji</span>
              <strong className={styles.detailsValue}>
                {selectedPrinterForDetails.integrationType}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Utworzono</span>
              <strong className={styles.detailsValue}>
                {formatDate(selectedPrinterForDetails.createdAt)}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Ostatnia modyfikacja</span>
              <strong className={styles.detailsValue}>
                {selectedPrinterForDetails.modifiedAt
                  ? formatDate(selectedPrinterForDetails.modifiedAt)
                  : "-"}
              </strong>
            </div>
          </div>
        </section>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nazwa</th>
              <th>Adres IP</th>
              <th>Lokalizacja</th>
              <th>Model</th>
              <th>Integracja</th>
              <th>Utworzono</th>
              <th>Akcje</th>
            </tr>
          </thead>

          <tbody>
            {printers.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles.emptyState}>
                  Brak aktywnych drukarek.
                </td>
              </tr>
            ) : (
              printers.map((printer) => (
                <tr key={printer.printerId}>
                  <td>{printer.printerId}</td>
                  <td>{printer.name}</td>
                  <td>{printer.ipAddress}</td>
                  <td>{printer.location ?? "-"}</td>
                  <td>{printer.printerModel ?? "-"}</td>
                  <td>{printer.integrationType}</td>
                  <td>{formatDate(printer.createdAt)}</td>

                  <td>
                    <div className={styles.actionsCell}>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => {
                          setSelectedPrinterForDetails(printer);
                          setSelectedPrinterForEdit(null);
                          setIsFormShown(false);
                        }}
                      >
                        Wyświetl
                      </button>

                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => {
                          setSelectedPrinterForEdit(printer);
                          setSelectedPrinterForDetails(null);
                          setIsFormShown(false);
                        }}
                      >
                        Edytuj
                      </button>

                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => handleDeletePrinter(printer.printerId)}
                      >
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
