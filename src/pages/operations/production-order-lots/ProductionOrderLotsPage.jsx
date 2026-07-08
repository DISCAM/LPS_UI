import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createProductionLotRequest,
  getProductionLotsRequest,
} from "../../../api/productionLotsApi";
import { getPrintersRequest } from "../../../api/printersApi";
import { getLabelTemplatesRequest } from "../../../api/labelTemplatesApi";
import { printProductionLabelRequest } from "../../../api/printLabelsApi";
import { formatDate } from "../../../helpers/formatDate";
import styles from "./ProductionOrderLotsPage.module.css";

const getInitialCreateForm = () => {
  return {
    lotNumber: "",
    productionDate: "",
    expirationDate: "",
    productionLine: "",
    shiftCode: "",
    producedQuantity: "",
  };
};

const getInitialPrintForm = () => {
  return {
    labelTemplateId: "",
    printerId: "",
    copies: "1",
  };
};

export const ProductionOrderLotsPage = () => {
  const { productionOrderId } = useParams();
  const navigate = useNavigate();

  const [productionLots, setProductionLots] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [labelTemplates, setLabelTemplates] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const [selectedPrintLot, setSelectedPrintLot] = useState(null);
  const [error, setError] = useState(null);

  const [createForm, setCreateForm] = useState(getInitialCreateForm);
  const [printForm, setPrintForm] = useState(getInitialPrintForm);

  const loadProductionLots = useCallback(async () => {
    const data = await getProductionLotsRequest(productionOrderId);

    setProductionLots(data);
  }, [productionOrderId]);

  const loadInitialData = useCallback(async () => {
    const [productionLotsData, printersData, labelTemplatesData] =
      await Promise.all([
        getProductionLotsRequest(productionOrderId),
        getPrintersRequest(),
        getLabelTemplatesRequest(),
      ]);

    setProductionLots(productionLotsData);
    setPrinters(printersData);
    setLabelTemplates(labelTemplatesData);

    const activeProductionTemplates = labelTemplatesData.filter(
      (template) => template.isActive && template.labelType === "PRODUCTION",
    );

    const defaultTemplate =
      activeProductionTemplates.find((template) => template.isDefault) ??
      activeProductionTemplates[0];

    setPrintForm((prev) => ({
      ...prev,
      labelTemplateId: defaultTemplate ? String(defaultTemplate.id) : "",
    }));
  }, [productionOrderId]);

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);

        await loadInitialData();
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [loadInitialData]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      await loadProductionLots();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateFormChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError(null);
  };

  const handleCancelCreateLot = () => {
    setIsCreateFormVisible(false);
    setError(null);

    setCreateForm(getInitialCreateForm());
  };

  const handleCreateLotSubmit = async (event) => {
    event.preventDefault();

    const producedQuantity = Number(createForm.producedQuantity);

    if (!createForm.lotNumber.trim()) {
      setError("Podaj numer LOT-u.");
      return;
    }

    if (!createForm.productionDate) {
      setError("Podaj datę produkcji.");
      return;
    }

    if (
      createForm.expirationDate &&
      createForm.expirationDate < createForm.productionDate
    ) {
      setError("Data ważności nie może być wcześniejsza niż data produkcji.");
      return;
    }

    if (!Number.isFinite(producedQuantity) || producedQuantity <= 0) {
      setError("Ilość wyprodukowana musi być większa od zera.");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const productionLotData = {
        lotNumber: createForm.lotNumber.trim(),
        productionDate: createForm.productionDate,
        expirationDate: createForm.expirationDate || null,
        productionLine: createForm.productionLine.trim() || null,
        shiftCode: createForm.shiftCode.trim() || null,
        producedQuantity,
      };

      await createProductionLotRequest(productionOrderId, productionLotData);

      await loadProductionLots();

      handleCancelCreateLot();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handlePrintFormChange = (event) => {
    const { name, value } = event.target;

    setPrintForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError(null);
  };

  const handleStartPrint = (productionLot) => {
    setSelectedPrintLot(productionLot);
    setError(null);

    setPrintForm((prev) => ({
      ...prev,
      copies: "1",
    }));
  };

  const handleCancelPrint = () => {
    setSelectedPrintLot(null);
    setError(null);

    setPrintForm((prev) => ({
      ...prev,
      copies: "1",
    }));
  };

  const handlePrintSubmit = async (event) => {
    event.preventDefault();

    const labelTemplateId = Number(printForm.labelTemplateId);
    const printerId = Number(printForm.printerId);
    const copies = Number(printForm.copies);

    if (!selectedPrintLot) {
      setError("Wybierz partię LOT do wydruku.");
      return;
    }

    if (!Number.isInteger(labelTemplateId) || labelTemplateId < 1) {
      setError("Wybierz poprawny szablon etykiety.");
      return;
    }

    if (!Number.isInteger(printerId) || printerId < 1) {
      setError("Wybierz poprawną drukarkę.");
      return;
    }

    if (!Number.isInteger(copies) || copies < 1 || copies > 1000) {
      setError("Liczba kopii musi być w zakresie od 1 do 1000.");
      return;
    }

    try {
      setIsPrinting(true);
      setError(null);

      const printData = {
        productionLotId: selectedPrintLot.productionLotId,
        labelTemplateId,
        printerId,
        copies,
      };

      const result = await printProductionLabelRequest(printData);

      navigate(`/operations/print-jobs/${result.printJobId}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading) {
    return <p>Ładowanie partii produkcyjnych...</p>;
  }

  const firstProductionLot = productionLots[0];

  const activePrinters = printers.filter((printer) => printer.isActive);

  const activeProductionTemplates = labelTemplates.filter(
    (template) => template.isActive && template.labelType === "PRODUCTION",
  );

  return (
    <section className={styles.page}>
      <Link className={styles.backButton} to="/operations/production-orders">
        ← Wróć do zleceń produkcyjnych
      </Link>

      <div className={styles.header}>
        <div>
          <h2>Partie produkcyjne</h2>

          <p>
            {firstProductionLot
              ? `Zlecenie: ${firstProductionLot.productionOrderNumber}`
              : `Partie LOT dla zlecenia o ID: ${productionOrderId}`}
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleRefresh}
            disabled={isRefreshing || isCreating || isPrinting}
          >
            {isRefreshing ? "Odświeżanie..." : "Odśwież"}
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              setIsCreateFormVisible((prev) => !prev);
              setError(null);
            }}
            disabled={isCreating || isPrinting}
          >
            {isCreateFormVisible ? "Zamknij formularz" : "Nowy LOT"}
          </button>
        </div>
      </div>

      {firstProductionLot && (
        <section className={styles.orderInfo}>
          <div>
            <span>Produkt</span>
            <strong>{firstProductionLot.productName}</strong>
          </div>

          <div>
            <span>Kod produktu</span>
            <strong className={styles.codeValue}>
              {firstProductionLot.productCode}
            </strong>
          </div>

          <div>
            <span>ID zlecenia</span>
            <strong>{firstProductionLot.productionOrderId}</strong>
          </div>
        </section>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {isCreateFormVisible && (
        <form onSubmit={handleCreateLotSubmit} className={styles.formCard}>
          <h3>Nowa partia produkcyjna</h3>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="lotNumber">Numer LOT</label>

              <input
                id="lotNumber"
                name="lotNumber"
                type="text"
                value={createForm.lotNumber}
                onChange={handleCreateFormChange}
                placeholder="np. LOT-2026-0003"
                maxLength="50"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="productionDate">Data produkcji</label>

              <input
                id="productionDate"
                name="productionDate"
                type="date"
                value={createForm.productionDate}
                onChange={handleCreateFormChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="expirationDate">Data ważności</label>

              <input
                id="expirationDate"
                name="expirationDate"
                type="date"
                value={createForm.expirationDate}
                onChange={handleCreateFormChange}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="productionLine">Linia produkcyjna</label>

              <input
                id="productionLine"
                name="productionLine"
                type="text"
                value={createForm.productionLine}
                onChange={handleCreateFormChange}
                placeholder="np. Linia 1"
                maxLength="50"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="shiftCode">Zmiana</label>

              <input
                id="shiftCode"
                name="shiftCode"
                type="text"
                value={createForm.shiftCode}
                onChange={handleCreateFormChange}
                placeholder="np. A"
                maxLength="20"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="producedQuantity">Ilość wyprodukowana</label>

              <input
                id="producedQuantity"
                name="producedQuantity"
                type="number"
                min="0.001"
                step="0.001"
                value={createForm.producedQuantity}
                onChange={handleCreateFormChange}
                placeholder="np. 100"
                required
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleCancelCreateLot}
              disabled={isCreating}
            >
              Anuluj
            </button>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isCreating}
            >
              {isCreating ? "Tworzenie LOT-u..." : "Utwórz LOT"}
            </button>
          </div>
        </form>
      )}

      {selectedPrintLot && (
        <form onSubmit={handlePrintSubmit} className={styles.formCard}>
          <h3>Wydruk etykiety produkcyjnej</h3>

          <section className={styles.selectedLotInfo}>
            <div>
              <span>Numer LOT</span>
              <strong className={styles.codeValue}>
                {selectedPrintLot.lotNumber}
              </strong>
            </div>

            <div>
              <span>Data produkcji</span>
              <strong>{formatDate(selectedPrintLot.productionDate)}</strong>
            </div>

            <div>
              <span>Ilość</span>
              <strong>{selectedPrintLot.producedQuantity}</strong>
            </div>

            <div>
              <span>Produkt</span>
              <strong>{selectedPrintLot.productName}</strong>
            </div>
          </section>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="labelTemplateId">Szablon etykiety</label>

              <select
                id="labelTemplateId"
                name="labelTemplateId"
                value={printForm.labelTemplateId}
                onChange={handlePrintFormChange}
                required
              >
                <option value="">-- wybierz szablon --</option>

                {activeProductionTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                    {template.isDefault ? " (domyślny)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="printerId">Drukarka</label>

              <select
                id="printerId"
                name="printerId"
                value={printForm.printerId}
                onChange={handlePrintFormChange}
                required
              >
                <option value="">-- wybierz drukarkę --</option>

                {activePrinters.map((printer) => (
                  <option key={printer.printerId} value={printer.printerId}>
                    {printer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="copies">Liczba kopii</label>

              <input
                id="copies"
                name="copies"
                type="number"
                min="1"
                max="1000"
                value={printForm.copies}
                onChange={handlePrintFormChange}
                required
              />
            </div>
          </div>

          {activeProductionTemplates.length === 0 && (
            <p className={styles.warning}>
              Brak aktywnego szablonu etykiety typu PRODUCTION.
            </p>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleCancelPrint}
              disabled={isPrinting}
            >
              Anuluj
            </button>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={
                isPrinting ||
                activeProductionTemplates.length === 0 ||
                !printForm.labelTemplateId ||
                !printForm.printerId
              }
            >
              {isPrinting
                ? "Tworzenie zadania wydruku..."
                : "Utwórz zadanie wydruku"}
            </button>
          </div>
        </form>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID LOT-u</th>
              <th>Numer LOT</th>
              <th>Data produkcji</th>
              <th>Data ważności</th>
              <th>Linia</th>
              <th>Zmiana</th>
              <th>Ilość wyprodukowana</th>
              <th>Status</th>
              <th>Utworzono</th>
              <th>Akcje</th>
            </tr>
          </thead>

          <tbody>
            {productionLots.length === 0 ? (
              <tr>
                <td colSpan="10" className={styles.emptyState}>
                  Brak partii LOT dla tego zlecenia.
                </td>
              </tr>
            ) : (
              productionLots.map((productionLot) => (
                <tr key={productionLot.productionLotId}>
                  <td>{productionLot.productionLotId}</td>

                  <td className={styles.codeCell}>
                    {productionLot.lotNumber}
                  </td>

                  <td>{formatDate(productionLot.productionDate)}</td>

                  <td>
                    {productionLot.expirationDate
                      ? formatDate(productionLot.expirationDate)
                      : "—"}
                  </td>

                  <td>{productionLot.productionLine ?? "—"}</td>

                  <td>{productionLot.shiftCode ?? "—"}</td>

                  <td>{productionLot.producedQuantity}</td>

                  <td>
                    <span className={styles.statusBadge}>
                      {productionLot.status}
                    </span>
                  </td>

                  <td>{formatDate(productionLot.createdAt)}</td>

                  <td>
                    <button
                      type="button"
                      className={styles.printButton}
                      onClick={() => handleStartPrint(productionLot)}
                      disabled={isPrinting}
                    >
                      Drukuj etykietę
                    </button>
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