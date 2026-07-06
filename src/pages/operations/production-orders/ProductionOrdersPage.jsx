import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductionOrdersRequest } from "../../../api/productionOrdersApi";
import { formatDate } from "../../../helpers/formatDate";
import styles from "./ProductionOrdersPage.module.css";

export const ProductionOrdersPage = () => {
  const [productionOrders, setProductionOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadProductionOrders = async () => {
    const data = await getProductionOrdersRequest();

    setProductionOrders(data);
  };

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

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);

        await loadProductionOrders();
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return <p>Ładowanie zleceń produkcyjnych...</p>;
  }

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
            disabled={isRefreshing}
          >
            {isRefreshing ? "Odświeżanie..." : "Odśwież"}
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            disabled
            title="Formularz dodawania zlecenia dodamy w następnym kroku."
          >
            Nowe zlecenie
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {!error && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Numer zlecenia</th>
                <th>Produkt</th>
                <th>Planowana ilość</th>
                <th>Typ</th>
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
                  <td colSpan="9" className={styles.emptyState}>
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
      )}
    </section>
  );
};