import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createProductionOrderRequest,
  getProductionOrdersRequest,
} from "../../../api/productionOrdersApi";
import { getProductsRequest } from "../../../api/productsApi";
import { getCustomersRequest } from "../../../api/customersApi";
import { formatDate } from "../../../helpers/formatDate";
import styles from "./ProductionOrdersPage.module.css";

const getInitialCreateForm = () => {
  return {
    orderNumber: "",
    productId: "",
    plannedQuantity: "",
    plannedStartDate: "",
    plannedEndDate: "",
    productionOrderType: "STOCK",
    customerId: "",
  };
};

export const ProductionOrdersPage = () => {
  const [productionOrders, setProductionOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [error, setError] = useState(null);

  const [createForm, setCreateForm] = useState(getInitialCreateForm);

  const loadProductionOrders = useCallback(async () => {
    const data = await getProductionOrdersRequest();

    setProductionOrders(data);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);

        const [productionOrdersData, productsData, customersData] =
          await Promise.all([
            getProductionOrdersRequest(),
            getProductsRequest(),
            getCustomersRequest(),
          ]);

        setProductionOrders(productionOrdersData);
        setProducts(productsData);
        setCustomers(customersData);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      await loadProductionOrders();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateFormChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((prev) => {
      const nextForm = {
        ...prev,
        [name]: value,
      };

      if (name === "productionOrderType" && value === "STOCK") {
        nextForm.customerId = "";
      }

      return nextForm;
    });

    setError(null);
  };

  const handleCancelCreateOrder = () => {
    setIsCreateFormVisible(false);
    setCreateForm(getInitialCreateForm());
    setError(null);
  };

  const handleToggleCreateForm = () => {
    if (isCreateFormVisible) {
      handleCancelCreateOrder();
      return;
    }

    setIsCreateFormVisible(true);
    setError(null);
  };

  const handleCreateOrderSubmit = async (event) => {
    event.preventDefault();

    const productId = Number(createForm.productId);
    const plannedQuantity = Number(createForm.plannedQuantity);
    const customerId = Number(createForm.customerId);

    if (!createForm.orderNumber.trim()) {
      setError("Podaj numer zlecenia produkcyjnego.");
      return;
    }

    if (!Number.isInteger(productId) || productId < 1) {
      setError("Wybierz poprawny produkt.");
      return;
    }

    if (!Number.isFinite(plannedQuantity) || plannedQuantity <= 0) {
      setError("Planowana ilość musi być większa od zera.");
      return;
    }

    if (
      createForm.plannedStartDate &&
      createForm.plannedEndDate &&
      createForm.plannedEndDate < createForm.plannedStartDate
    ) {
      setError(
        "Planowana data zakończenia nie może być wcześniejsza niż data rozpoczęcia.",
      );
      return;
    }

    if (
      createForm.productionOrderType === "CUSTOMER_ORDER" &&
      (!Number.isInteger(customerId) || customerId < 1)
    ) {
      setError("Dla zlecenia klientowskiego wybierz klienta.");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const productionOrderData = {
        orderNumber: createForm.orderNumber.trim(),
        productId,
        plannedQuantity,
        plannedStartDate: createForm.plannedStartDate || null,
        plannedEndDate: createForm.plannedEndDate || null,
        productionOrderType: createForm.productionOrderType,
        customerId:
          createForm.productionOrderType === "CUSTOMER_ORDER"
            ? customerId
            : null,
      };

      await createProductionOrderRequest(productionOrderData);

      await loadProductionOrders();

      handleCancelCreateOrder();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return <p>Ładowanie zleceń produkcyjnych...</p>;
  }

  const activeProducts = products.filter((product) => product.isActive);

  const activeCustomers = customers.filter((customer) => customer.isActive);

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Zlecenia produkcyjne</h2>
          <p>
            Lista utworzonych zleceń produkcyjnych oraz powiązanych z nimi
            partii LOT.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleRefresh}
            disabled={isRefreshing || isCreating}
          >
            {isRefreshing ? "Odświeżanie..." : "Odśwież"}
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleToggleCreateForm}
            disabled={isCreating}
          >
            {isCreateFormVisible ? "Zamknij formularz" : "Nowe zlecenie"}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isCreateFormVisible && (
        <form
          className={styles.formCard}
          onSubmit={handleCreateOrderSubmit}
        >
          <h3>Nowe zlecenie produkcyjne</h3>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="orderNumber">Numer zlecenia</label>

              <input
                id="orderNumber"
                name="orderNumber"
                type="text"
                value={createForm.orderNumber}
                onChange={handleCreateFormChange}
                placeholder="np. ZP/2026/0002"
                maxLength="50"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="productId">Produkt</label>

              <select
                id="productId"
                name="productId"
                value={createForm.productId}
                onChange={handleCreateFormChange}
                required
              >
                <option value="">-- wybierz produkt --</option>

                {activeProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.productCode} — {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="plannedQuantity">Planowana ilość</label>

              <input
                id="plannedQuantity"
                name="plannedQuantity"
                type="number"
                min="0.001"
                step="0.001"
                value={createForm.plannedQuantity}
                onChange={handleCreateFormChange}
                placeholder="np. 1000"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="productionOrderType">Typ zlecenia</label>

              <select
                id="productionOrderType"
                name="productionOrderType"
                value={createForm.productionOrderType}
                onChange={handleCreateFormChange}
              >
                <option value="STOCK">Na magazyn</option>
                <option value="CUSTOMER_ORDER">Zlecenie klientowskie</option>
              </select>
            </div>

            {createForm.productionOrderType === "CUSTOMER_ORDER" && (
              <div className={styles.field}>
                <label htmlFor="customerId">Klient</label>

                <select
                  id="customerId"
                  name="customerId"
                  value={createForm.customerId}
                  onChange={handleCreateFormChange}
                  required
                >
                  <option value="">-- wybierz klienta --</option>

                  {activeCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customerCode} — {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="plannedStartDate">Planowany start</label>

              <input
                id="plannedStartDate"
                name="plannedStartDate"
                type="date"
                value={createForm.plannedStartDate}
                onChange={handleCreateFormChange}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="plannedEndDate">Planowane zakończenie</label>

              <input
                id="plannedEndDate"
                name="plannedEndDate"
                type="date"
                value={createForm.plannedEndDate}
                onChange={handleCreateFormChange}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleCancelCreateOrder}
              disabled={isCreating}
            >
              Anuluj
            </button>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isCreating}
            >
              {isCreating
                ? "Tworzenie zlecenia..."
                : "Utwórz zlecenie"}
            </button>
          </div>
        </form>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Numer zlecenia</th>
              <th>Produkt</th>
              <th>Planowana ilość</th>
              <th>Typ</th>
              <th>Klient</th>
              <th>Status</th>
              <th>Planowany start</th>
              <th>Planowane zakończenie</th>
              <th>Utworzono</th>
              <th>Akcje</th>
            </tr>
          </thead>

          <tbody>
            {productionOrders.length === 0 ? (
              <tr>
                <td colSpan="10" className={styles.emptyState}>
                  Brak zleceń produkcyjnych.
                </td>
              </tr>
            ) : (
              productionOrders.map((productionOrder) => (
                <tr key={productionOrder.productionOrderId}>
                  <td className={styles.codeCell}>
                    {productionOrder.orderNumber}
                  </td>

                  <td>
                    <strong>{productionOrder.productName}</strong>

                    <span className={styles.productCode}>
                      {productionOrder.productCode}
                    </span>
                  </td>

                  <td>{productionOrder.plannedQuantity}</td>

                  <td>{productionOrder.productionOrderType}</td>

                  <td>{productionOrder.customerName ?? "—"}</td>

                  <td>
                    <span className={styles.statusBadge}>
                      {productionOrder.status}
                    </span>
                  </td>

                  <td>
                    {productionOrder.plannedStartDate
                      ? formatDate(productionOrder.plannedStartDate)
                      : "—"}
                  </td>

                  <td>
                    {productionOrder.plannedEndDate
                      ? formatDate(productionOrder.plannedEndDate)
                      : "—"}
                  </td>

                  <td>{formatDate(productionOrder.createdAt)}</td>

                  <td>
                    <Link
                      className={styles.detailsButton}
                      to={`/operations/production-orders/${productionOrder.productionOrderId}/lots`}
                    >
                      LOT-y
                    </Link>
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