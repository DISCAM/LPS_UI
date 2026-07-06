import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createProductionLotRequest,
  getProductionLotsRequest,
} from "../../../api/productionLotsApi";
import { formatDate } from "../../../helpers/formatDate";
import styles from "./ProductionOrderLotsPage.module.css";

export const ProductionOrderLotsPage = () => {
  const { productionOrderId } = useParams();

  const [productionLots, setProductionLots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [createForm, setCreateForm] = useState({
    lotNumber: "",
    productionDate: "",
    expirationDate: "",
    productionLine: "",
    shiftCode: "",
    producedQuantity: "",
  });

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

    setCreateForm({
      lotNumber: "",
      productionDate: "",
      expirationDate: "",
      productionLine: "",
      shiftCode: "",
      producedQuantity: "",
    });
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
            onClick={() => {
              setIsCreateFormVisible((prev) => !prev);
              setError(null);
            }}
            disabled={isCreating}
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
