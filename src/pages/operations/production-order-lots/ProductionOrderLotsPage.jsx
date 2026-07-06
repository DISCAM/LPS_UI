import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductionLotsRequest } from "../../../api/productionLotsApi";
import { formatDate } from "../../../helpers/formatDate";
import styles from "./ProductionOrderLotsPage.module.css";

export const ProductionOrderLotsPage = () => {
  const { productionOrderId } = useParams();

  const [productionLots, setProductionLots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadProductionLots = useCallback(async () => {
    const data = await getProductionLotsRequest(productionOrderId);

    setProductionLots(data);
  }, [productionOrderId]);

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

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);

        await loadProductionLots();
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [loadProductionLots]);

  if (isLoading) {
    return <p>Ładowanie partii produkcyjnych...</p>;
  }

  const firstProductionLot = productionLots[0];

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
            disabled={isRefreshing}
          >
            {isRefreshing ? "Odświeżanie..." : "Odśwież"}
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            disabled
            title="Formularz dodawania LOT-u dodamy w następnym kroku."
          >
            Nowy LOT
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

      {!error && (
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
                        disabled
                        title="Wydruk etykiety dodamy w kolejnym kroku."
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
      )}
    </section>
  );
};
