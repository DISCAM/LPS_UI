import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLabelTemplatesRequest } from "../../../api/labelTemplatesApi";
import { getPrintersRequest } from "../../../api/printersApi";
import { getProductionOrdersRequest } from "../../../api/productionOrdersApi";
import { getProductionLotsRequest } from "../../../api/productionLotsApi";
import { getStockMovementsRequest } from "../../../api/stockMovementsApi";
import { createWarehouseReceiptRequest } from "../../../api/warehouseReceiptsApi";
import { formatDate } from "../../../helpers/formatDate";
import styles from "./WarehouseReceiptsPage.module.css";

const PRODUCTION_RECEIPT = "PRODUCTION_RECEIPT";

const getInitialForm = () => ({
  productionOrderId: "",
  productionLotId: "",
  quantity: "",
  unitType: "PALLET",
  labelTemplateId: "",
  printerId: "",
  copies: 1,
  notes: "",
});

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

const getMovementTypeLabel = (movementType) => {
  switch (movementType) {
    case PRODUCTION_RECEIPT:
      return "Przyjęcie z produkcji";

    default:
      return movementType;
  }
};

const getWarehouseReceipts = (stockMovements) => {
  return stockMovements.filter(
    (stockMovement) => stockMovement.movementType === PRODUCTION_RECEIPT,
  );
};

const getAlreadyReceivedQuantity = (productionLotId, warehouseReceipts) => {
  return warehouseReceipts
    .filter(
      (warehouseReceipt) =>
        Number(warehouseReceipt.productionLotId) === Number(productionLotId),
    )
    .reduce(
      (sum, warehouseReceipt) => sum + Number(warehouseReceipt.quantity ?? 0),
      0,
    );
};

const getAvailableQuantity = (productionLot, warehouseReceipts) => {
  if (!productionLot) {
    return 0;
  }

  const producedQuantity = Number(productionLot.producedQuantity ?? 0);

  const alreadyReceivedQuantity = getAlreadyReceivedQuantity(
    productionLot.productionLotId,
    warehouseReceipts,
  );

  return producedQuantity - alreadyReceivedQuantity;
};

const getLabelTemplateId = (labelTemplate) => {
  return labelTemplate.labelTemplateId ?? labelTemplate.id;
};

const getPrinterId = (printer) => {
  return printer.printerId ?? printer.id;
};

export const WarehouseReceiptsPage = () => {
  const [warehouseReceipts, setWarehouseReceipts] = useState([]);
  const [productionOrders, setProductionOrders] = useState([]);
  const [productionLots, setProductionLots] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [labelTemplates, setLabelTemplates] = useState([]);

  const [form, setForm] = useState(getInitialForm);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLotsLoading, setIsLotsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [createdPrintJobId, setCreatedPrintJobId] = useState(null);

  const activePrinters = printers.filter((printer) => printer.isActive);

  const activeLogisticTemplates = labelTemplates.filter(
    (labelTemplate) =>
      labelTemplate.isActive && labelTemplate.labelType === "LOGISTIC",
  );

  const selectedProductionLot = productionLots.find(
    (productionLot) =>
      Number(productionLot.productionLotId) === Number(form.productionLotId),
  );

  const selectedLotAvailableQuantity = getAvailableQuantity(
    selectedProductionLot,
    warehouseReceipts,
  );

  useEffect(() => {
    let isCancelled = false;

    const loadInitialData = async () => {
      try {
        const [
          stockMovementsData,
          productionOrdersData,
          printersData,
          labelTemplatesData,
        ] = await Promise.all([
          getStockMovementsRequest(),
          getProductionOrdersRequest(),
          getPrintersRequest(),
          getLabelTemplatesRequest(),
        ]);

        const logisticTemplates = labelTemplatesData.filter(
          (labelTemplate) =>
            labelTemplate.isActive && labelTemplate.labelType === "LOGISTIC",
        );

        const defaultLogisticTemplate =
          logisticTemplates.find((labelTemplate) => labelTemplate.isDefault) ??
          logisticTemplates[0];

        const activePrintersData = printersData.filter(
          (printer) => printer.isActive,
        );

        const defaultPrinter = activePrintersData[0];

        if (!isCancelled) {
          setWarehouseReceipts(getWarehouseReceipts(stockMovementsData));
          setProductionOrders(productionOrdersData);
          setPrinters(printersData);
          setLabelTemplates(labelTemplatesData);

          setForm((prev) => ({
            ...prev,
            labelTemplateId: defaultLogisticTemplate
              ? String(getLabelTemplateId(defaultLogisticTemplate))
              : "",
            printerId: defaultPrinter
              ? String(getPrinterId(defaultPrinter))
              : "",
          }));
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

    loadInitialData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const loadWarehouseReceipts = async () => {
    const stockMovementsData = await getStockMovementsRequest();

    setWarehouseReceipts(getWarehouseReceipts(stockMovementsData));
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      setSuccessMessage(null);
      setCreatedPrintJobId(null);

      await loadWarehouseReceipts();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleForm = () => {
    setIsFormVisible((prev) => !prev);
    setError(null);
    setSuccessMessage(null);
    setCreatedPrintJobId(null);
  };

  const handleCancelForm = () => {
    setForm((prev) => ({
      ...getInitialForm(),
      labelTemplateId: prev.labelTemplateId,
      printerId: prev.printerId,
    }));

    setProductionLots([]);
    setIsFormVisible(false);
    setError(null);
    setSuccessMessage(null);
    setCreatedPrintJobId(null);
  };

  const handleProductionOrderChange = async (event) => {
    const productionOrderId = event.target.value;

    setForm((prev) => ({
      ...prev,
      productionOrderId,
      productionLotId: "",
      quantity: "",
    }));

    setProductionLots([]);
    setError(null);
    setSuccessMessage(null);
    setCreatedPrintJobId(null);

    if (!productionOrderId) {
      return;
    }

    try {
      setIsLotsLoading(true);

      const productionLotsData =
        await getProductionLotsRequest(productionOrderId);

      setProductionLots(productionLotsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLotsLoading(false);
    }
  };

  const handleProductionLotChange = (event) => {
    const productionLotId = event.target.value;

    const productionLot = productionLots.find(
      (item) => Number(item.productionLotId) === Number(productionLotId),
    );

    const availableQuantity = getAvailableQuantity(
      productionLot,
      warehouseReceipts,
    );

    setForm((prev) => ({
      ...prev,
      productionLotId,
      quantity: availableQuantity > 0 ? String(availableQuantity) : "",
    }));

    setError(null);
    setSuccessMessage(null);
    setCreatedPrintJobId(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError(null);
    setSuccessMessage(null);
    setCreatedPrintJobId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const productionLotId = Number(form.productionLotId);
    const quantity = Number(form.quantity);
    const labelTemplateId = Number(form.labelTemplateId);
    const printerId = Number(form.printerId);
    const copies = Number(form.copies);

    if (!productionLotId || productionLotId <= 0) {
      setError("Wybierz partię produkcyjną.");
      return;
    }

    if (!quantity || quantity <= 0) {
      setError("Ilość przyjęcia musi być większa od 0.");
      return;
    }

    if (selectedProductionLot && quantity > selectedLotAvailableQuantity) {
      setError(
        `Nie można przyjąć ${formatQuantity(quantity)}. ` +
          `Dostępna ilość do przyjęcia: ${formatQuantity(
            selectedLotAvailableQuantity,
          )}.`,
      );

      return;
    }

    if (!Number.isInteger(labelTemplateId) || labelTemplateId <= 0) {
      setError("Wybierz szablon etykiety logistycznej.");
      return;
    }

    if (!Number.isInteger(printerId) || printerId <= 0) {
      setError("Wybierz drukarkę.");
      return;
    }

    if (!Number.isInteger(copies) || copies <= 0) {
      setError("Liczba kopii musi być większa od 0.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      setCreatedPrintJobId(null);

      const result = await createWarehouseReceiptRequest({
        productionLotId,
        quantity,
        unitType: form.unitType,
        notes: form.notes.trim() || null,
        labelTemplateId,
        printerId,
        copies,
      });

      await loadWarehouseReceipts();

      setForm((prev) => ({
        ...getInitialForm(),
        labelTemplateId: prev.labelTemplateId,
        printerId: prev.printerId,
      }));

      setProductionLots([]);
      setIsFormVisible(false);
      setCreatedPrintJobId(result.printJobId);
      setSuccessMessage(
        `Przyjęcie z produkcji zostało utworzone. Utworzono zadanie wydruku #${result.printJobId}.`,
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p>Ładowanie przyjęć z produkcji...</p>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Przyjęcia z produkcji</h2>
          <p>
            Lista partii produkcyjnych przyjętych na magazyn oraz powiązanych
            jednostek logistycznych.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleToggleForm}
          >
            {isFormVisible ? "Ukryj formularz" : "Nowe przyjęcie"}
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Odświeżanie..." : "Odśwież"}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {successMessage && (
        <p className={styles.success}>
          {successMessage}{" "}
          {createdPrintJobId && (
            <Link to={`/operations/print-jobs/${createdPrintJobId}`}>
              Zobacz szczegóły wydruku
            </Link>
          )}
        </p>
      )}

      {isFormVisible && (
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h3>Nowe przyjęcie z produkcji</h3>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="productionOrderId">Zlecenie produkcyjne</label>

              <select
                id="productionOrderId"
                name="productionOrderId"
                value={form.productionOrderId}
                onChange={handleProductionOrderChange}
                required
              >
                <option value="">-- wybierz zlecenie --</option>

                {productionOrders.map((productionOrder) => (
                  <option
                    key={productionOrder.productionOrderId}
                    value={productionOrder.productionOrderId}
                  >
                    {productionOrder.orderNumber} —{" "}
                    {productionOrder.productName}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="productionLotId">Partia produkcyjna / LOT</label>

              <select
                id="productionLotId"
                name="productionLotId"
                value={form.productionLotId}
                onChange={handleProductionLotChange}
                disabled={!form.productionOrderId || isLotsLoading}
                required
              >
                <option value="">
                  {isLotsLoading ? "Ładowanie LOT-ów..." : "-- wybierz LOT --"}
                </option>

                {productionLots.map((productionLot) => {
                  const availableQuantity = getAvailableQuantity(
                    productionLot,
                    warehouseReceipts,
                  );

                  return (
                    <option
                      key={productionLot.productionLotId}
                      value={productionLot.productionLotId}
                    >
                      {productionLot.lotNumber} — dostępne:{" "}
                      {formatQuantity(availableQuantity)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="quantity">Ilość przyjmowana</label>

              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0.001"
                step="0.001"
                value={form.quantity}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="unitType">Typ jednostki logistycznej</label>

              <select
                id="unitType"
                name="unitType"
                value={form.unitType}
                onChange={handleFormChange}
                required
              >
                <option value="BOX">Pudełko</option>
                <option value="CARTON">Karton</option>
                <option value="PALLET">Paleta</option>
                <option value="OTHER">Inne</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="labelTemplateId">Szablon etykiety</label>

              <select
                id="labelTemplateId"
                name="labelTemplateId"
                value={form.labelTemplateId}
                onChange={handleFormChange}
                required
              >
                <option value="">-- wybierz szablon --</option>

                {activeLogisticTemplates.map((labelTemplate) => {
                  const labelTemplateId = getLabelTemplateId(labelTemplate);

                  return (
                    <option
                      key={labelTemplateId}
                      value={String(labelTemplateId)}
                    >
                      {labelTemplate.name} v{labelTemplate.versionNo}
                      {labelTemplate.isDefault ? " — domyślny" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="printerId">Drukarka</label>

              <select
                id="printerId"
                name="printerId"
                value={form.printerId}
                onChange={handleFormChange}
                required
              >
                <option value="">-- wybierz drukarkę --</option>

                {activePrinters.map((printer) => {
                  const printerId = getPrinterId(printer);

                  return (
                    <option key={printerId} value={String(printerId)}>
                      {printer.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="copies">Liczba kopii</label>

              <input
                id="copies"
                name="copies"
                type="number"
                min="1"
                max="999"
                value={form.copies}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className={styles.fieldWide}>
              <label htmlFor="notes">Uwagi</label>

              <input
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                placeholder="Opcjonalny opis przyjęcia"
              />
            </div>
          </div>

          {selectedProductionLot && (
            <div className={styles.lotInfo}>
              <strong>Wybrany LOT:</strong>{" "}
              {showValue(selectedProductionLot.lotNumber)} | produkt:{" "}
              {showValue(selectedProductionLot.productName)} | wyprodukowano:{" "}
              {formatQuantity(selectedProductionLot.producedQuantity)} |
              dostępne do przyjęcia:{" "}
              {formatQuantity(selectedLotAvailableQuantity)}
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancelForm}
              disabled={isSubmitting}
            >
              Anuluj
            </button>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSubmitting || isLotsLoading}
            >
              {isSubmitting ? "Przyjmowanie..." : "Przyjmij i utwórz wydruk"}
            </button>
          </div>
        </form>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID ruchu</th>
              <th>Typ operacji</th>
              <th>Produkt</th>
              <th>LOT</th>
              <th>Ilość</th>
              <th>SSCC</th>
              <th>Jednostka</th>
              <th>Utworzył</th>
              <th>Data przyjęcia</th>
              <th>Uwagi</th>
            </tr>
          </thead>

          <tbody>
            {warehouseReceipts.length === 0 ? (
              <tr>
                <td className={styles.emptyState} colSpan="10">
                  Brak przyjęć z produkcji.
                </td>
              </tr>
            ) : (
              warehouseReceipts.map((warehouseReceipt) => (
                <tr key={warehouseReceipt.stockMovementId}>
                  <td>{warehouseReceipt.stockMovementId}</td>

                  <td>
                    <span className={styles.movementType}>
                      {getMovementTypeLabel(warehouseReceipt.movementType)}
                    </span>
                  </td>

                  <td>
                    <strong>{showValue(warehouseReceipt.productName)}</strong>
                    <span className={styles.productCode}>
                      {showValue(warehouseReceipt.productCode)}
                    </span>
                  </td>

                  <td>
                    <strong>{showValue(warehouseReceipt.lotNumber)}</strong>
                    <span className={styles.smallText}>
                      prod. {formatDateOnly(warehouseReceipt.productionDate)}
                    </span>

                    {warehouseReceipt.expirationDate && (
                      <span className={styles.smallText}>
                        ważn. {formatDateOnly(warehouseReceipt.expirationDate)}
                      </span>
                    )}
                  </td>

                  <td>{formatQuantity(warehouseReceipt.quantity)}</td>

                  <td className={styles.codeCell}>
                    {showValue(warehouseReceipt.sscc)}
                  </td>

                  <td>{showValue(warehouseReceipt.unitType)}</td>

                  <td>{showValue(warehouseReceipt.createdByUserName)}</td>

                  <td>{formatOptionalDate(warehouseReceipt.createdAt)}</td>

                  <td>{showValue(warehouseReceipt.notes)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
