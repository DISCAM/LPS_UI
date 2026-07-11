import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createWarehouseOrderRequest,
  getWarehouseOrdersRequest,
} from "../../../api/warehouseOrdersApi";
import { getCustomersRequest } from "../../../api/customersApi";
import styles from "./WarehouseOrdersPage.module.css";

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

export const WarehouseOrdersPage = () => {
  const [warehouseOrders, setWarehouseOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    orderNumber: "",
    deliveryAddress: "",
    customerId: "",
  });

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadWarehouseOrders = async () => {
    const warehouseOrdersData = await getWarehouseOrdersRequest();

    setWarehouseOrders(warehouseOrdersData);
  };

  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      try {
        setError("");

        const [warehouseOrdersData, customersData] = await Promise.all([
          getWarehouseOrdersRequest(),
          getCustomersRequest(),
        ]);

        if (!isCancelled) {
          setWarehouseOrders(warehouseOrdersData);
          setCustomers(customersData);
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.orderNumber.trim()) {
      setError("Podaj numer zlecenia magazynowego");
      return;
    }
    const customerId = form.customerId ? Number(form.customerId) : null;

    try {
      setIsSaving(true);
      setError("");
      setSuccessMessage("");

      await createWarehouseOrderRequest({
        orderNumber: form.orderNumber.trim(),
        orderType: "SHIPMENT",
        deliveryAddress: form.deliveryAddress.trim() || null,
        customerId,
      });

      setForm({
        orderNumber: "",
        deliveryAddress: "",
        customerId: "",
      });

      setIsFormVisible(false);
      setSuccessMessage("Utworzono zlecenie magazynowe.");

      await loadWarehouseOrders();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p>Ładowanie zleceń magazynowych...</p>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Zlecenia magazynowe</h2>
          <p>Dokumenty wydania jednostek logistycznych z magazynu.</p>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => setIsFormVisible((prev) => !prev)}
        >
          {isFormVisible ? "Zamknij formularz" : "Dodaj zlecenie"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {successMessage && <p className={styles.success}>{successMessage}</p>}

      {isFormVisible && (
        <form className={styles.formCard} onSubmit={handleCreate}>
          <h3>Nowe zlecenie magazynowe</h3>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              Numer zlecenia
              <input
                name="orderNumber"
                value={form.orderNumber}
                onChange={handleChange}
                placeholder="np. WM/2026/001"
              />
            </label>

            <label className={styles.field}>
              Adres dostawy
              <input
                name="deliveryAddress"
                value={form.deliveryAddress}
                onChange={handleChange}
                placeholder="np. Ogrodowa 82e"
              />
            </label>

            <label className={styles.field}>
              Klient
              <select
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
              >
                <option value="">Bez klienta</option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSaving}
            >
              {isSaving ? "Zapisywanie..." : "Utwórz zlecenie"}
            </button>

            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setIsFormVisible(false)}
              disabled={isSaving}
            >
              Anuluj
            </button>
          </div>
        </form>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Numer</th>
              <th>Typ</th>
              <th>Status</th>
              <th>Klient</th>
              <th>Adres dostawy</th>
              <th>Jednostki</th>
              <th>Ilość razem</th>
              <th>Utworzył</th>
              <th>Utworzono</th>
              <th>Akcje</th>
            </tr>
          </thead>

          <tbody>
            {warehouseOrders.map((warehouseOrder) => (
              <tr key={warehouseOrder.warehouseOrderId}>
                <td>{warehouseOrder.warehouseOrderId}</td>
                <td className={styles.codeCell}>
                  {warehouseOrder.orderNumber}
                </td>
                <td>{warehouseOrder.orderType}</td>
                <td>
                  <span className={styles.statusBadge}>
                    {warehouseOrder.status}
                  </span>
                </td>
                <td>{showValue(warehouseOrder.deliveryAddress)}</td>
                <td>{showValue(warehouseOrder.customerName)}</td>
                <td>{warehouseOrder.logisticUnitsCount}</td>
                <td>{formatQuantity(warehouseOrder.totalQuantity)}</td>
                <td>{warehouseOrder.createdByUserName}</td>
                <td>{formatDate(warehouseOrder.createdAt)}</td>
                <td>
                  <Link
                    className={styles.detailsLink}
                    to={`/operations/warehouse-orders/${warehouseOrder.warehouseOrderId}`}
                  >
                    Szczegóły
                  </Link>
                </td>
              </tr>
            ))}

            {warehouseOrders.length === 0 && (
              <tr>
                <td colSpan="11" className={styles.emptyState}>
                  Brak zleceń magazynowych.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
