import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLogisticUnitsRequest } from "../../../api/logisticUnitsApi";
import {
  getWarehouseOrderRequest,
  shipLogisticUnitRequest,
} from "../../../api/warehouseOrdersApi";
import styles from "./WarehouseOrderDetailsPage.module.css";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("pl-PL");
}

function showValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
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

function getLogisticUnitSummary(logisticUnit) {
  if (!logisticUnit.items || logisticUnit.items.length === 0) {
    return "Brak zawartości";
  }

  const firstItem = logisticUnit.items[0];

  return `${firstItem.productName} | LOT: ${firstItem.lotNumber} | Ilość: ${formatQuantity(firstItem.quantity)}`;
}

export const WarehouseOrderDetailsPage = () => {
  const { warehouseOrderId } = useParams();

  const [warehouseOrder, setWarehouseOrder] = useState(null);
  const [logisticUnits, setLogisticUnits] = useState([]);
  const [form, setForm] = useState({
    logisticUnitId: "",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const availableLogisticUnits = useMemo(() => {
    return logisticUnits.filter((logisticUnit) => {
      const isCreated = logisticUnit.status === "CREATED";
      const isNotAssigned =
        logisticUnit.warehouseOrderId === null ||
        logisticUnit.warehouseOrderId === undefined;

      if (!isCreated || !isNotAssigned) {
        return false;
      }

      if (!warehouseOrder?.customerId) {
        return true;
      }

      const hasDifferentCustomer = logisticUnit.items?.some((item) => {
        const productionOrderCustomerId = item.productionOrderCustomerId;

        return (
          productionOrderCustomerId !== null &&
          productionOrderCustomerId !== undefined &&
          productionOrderCustomerId !== warehouseOrder.customerId
        );
      });

      return !hasDifferentCustomer;
    });
  }, [logisticUnits, warehouseOrder]);

  const loadData = async () => {
    const [warehouseOrderData, logisticUnitsData] = await Promise.all([
      getWarehouseOrderRequest(warehouseOrderId),
      getLogisticUnitsRequest(),
    ]);

    setWarehouseOrder(warehouseOrderData);
    setLogisticUnits(logisticUnitsData);
  };

  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      try {
        setError("");

        const [warehouseOrderData, logisticUnitsData] = await Promise.all([
          getWarehouseOrderRequest(warehouseOrderId),
          getLogisticUnitsRequest(),
        ]);

        if (!isCancelled) {
          setWarehouseOrder(warehouseOrderData);
          setLogisticUnits(logisticUnitsData);
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
  }, [warehouseOrderId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShip = async (event) => {
    event.preventDefault();

    const logisticUnitId = Number(form.logisticUnitId);

    if (!Number.isInteger(logisticUnitId) || logisticUnitId <= 0) {
      setError("Wybierz jednostkę logistyczną do wydania.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccessMessage("");

      const result = await shipLogisticUnitRequest(warehouseOrderId, {
        logisticUnitId,
        notes: form.notes.trim() || null,
      });

      setSuccessMessage(`Wydano jednostkę SSCC ${result.sscc} z magazynu.`);

      setForm({
        logisticUnitId: "",
        notes: "",
      });

      await loadData();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p>Ładowanie zlecenia magazynowego...</p>;
  }

  if (!warehouseOrder) {
    return (
      <section className={styles.page}>
        <p>Nie znaleziono zlecenia magazynowego.</p>
      </section>
    );
  }

  const isCompleted = warehouseOrder.status === "COMPLETED";

  return (
    <section className={styles.page}>
      <Link className={styles.backLink} to="/operations/warehouse-orders">
        ← Wróć do zleceń magazynowych
      </Link>

      <div className={styles.header}>
        <div>
          <h2>Zlecenie magazynowe {warehouseOrder.orderNumber}</h2>
          <p>Wydanie jednostek logistycznych z magazynu.</p>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={loadData}
          disabled={isSaving}
        >
          Odśwież
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {successMessage && <p className={styles.success}>{successMessage}</p>}

      <div className={styles.grid}>
        <section className={styles.card}>
          <h3>Dane zlecenia</h3>

          <dl className={styles.detailsList}>
            <div>
              <dt>ID</dt>
              <dd>{warehouseOrder.warehouseOrderId}</dd>
            </div>

            <div>
              <dt>Numer</dt>
              <dd>{warehouseOrder.orderNumber}</dd>
            </div>

            <div>
              <dt>Typ</dt>
              <dd>{warehouseOrder.orderType}</dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd>
                <span className={styles.statusBadge}>
                  {warehouseOrder.status}
                </span>
              </dd>
            </div>

            <div>
              <dt>Adres dostawy</dt>
              <dd>{showValue(warehouseOrder.deliveryAddress)}</dd>
            </div>

            <div>
              <dt>Klient</dt>
              <dd>{showValue(warehouseOrder.customerName)}</dd>
            </div>

            <div>
              <dt>Utworzył</dt>
              <dd>{warehouseOrder.createdByUserName}</dd>
            </div>

            <div>
              <dt>Utworzono</dt>
              <dd>{formatDate(warehouseOrder.createdAt)}</dd>
            </div>

            <div>
              <dt>Ostatnia modyfikacja</dt>
              <dd>{formatDate(warehouseOrder.modifiedAt)}</dd>
            </div>
          </dl>
        </section>

        <section className={styles.card}>
          <h3>Wydaj jednostkę logistyczną</h3>

          {isCompleted ? (
            <p className={styles.info}>
              Zlecenie jest zakończone. Nie można dodać kolejnej jednostki.
            </p>
          ) : (
            <form onSubmit={handleShip}>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  Jednostka logistyczna SSCC
                  <select
                    name="logisticUnitId"
                    value={form.logisticUnitId}
                    onChange={handleChange}
                  >
                    <option value="">Wybierz jednostkę</option>

                    {availableLogisticUnits.map((logisticUnit) => {
                      const firstItem = logisticUnit.items?.[0];
                      const customerName =
                        firstItem?.productionOrderCustomerName ??
                        "Produkcja na magazyn";

                      return (
                        <option
                          key={logisticUnit.logisticUnitId}
                          value={logisticUnit.logisticUnitId}
                        >
                          {logisticUnit.sscc} | {logisticUnit.unitType} |
                          {formatQuantity(logisticUnit.totalQuantity)} |
                          {customerName}
                        </option>
                      );
                    })}
                  </select>
                </label>

                <label className={styles.field}>
                  Uwagi
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="np. wydanie testowe z magazynu"
                    rows="4"
                  />
                </label>
              </div>

              {form.logisticUnitId && (
                <p className={styles.selectedInfo}>
                  {getLogisticUnitSummary(
                    availableLogisticUnits.find(
                      (item) =>
                        item.logisticUnitId === Number(form.logisticUnitId),
                    ),
                  )}
                </p>
              )}

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={isSaving}
                >
                  {isSaving ? "Wydawanie..." : "Wydaj z magazynu"}
                </button>
              </div>
            </form>
          )}

          {!isCompleted && availableLogisticUnits.length === 0 && (
            <p className={styles.info}>
              Brak dostępnych jednostek logistycznych ze statusem CREATED.
            </p>
          )}
        </section>
      </div>

      <section className={styles.card}>
        <h3>Wydane jednostki logistyczne</h3>

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
                <th>Utworzono</th>
              </tr>
            </thead>

            <tbody>
              {warehouseOrder.logisticUnits.map((logisticUnit) => (
                <tr key={logisticUnit.logisticUnitId}>
                  <td>{logisticUnit.logisticUnitId}</td>
                  <td className={styles.codeCell}>{logisticUnit.sscc}</td>
                  <td>{logisticUnit.unitType}</td>
                  <td>
                    <span className={styles.statusBadge}>
                      {logisticUnit.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.itemsList}>
                      {logisticUnit.items.map((item) => (
                        <div
                          key={item.logisticUnitItemId}
                          className={styles.itemRow}
                        >
                          <strong>{item.productName}</strong>
                          <span>{item.productCode}</span>
                          <span>LOT: {item.lotNumber}</span>
                          <span>Ilość: {formatQuantity(item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>{formatQuantity(logisticUnit.totalQuantity)}</td>
                  <td>{formatDate(logisticUnit.createdAt)}</td>
                </tr>
              ))}

              {warehouseOrder.logisticUnits.length === 0 && (
                <tr>
                  <td colSpan="7" className={styles.emptyState}>
                    Do zlecenia nie przypisano jeszcze żadnej jednostki.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};
