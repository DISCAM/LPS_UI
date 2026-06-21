import { useEffect, useState } from "react";
import {
  createProductRequest,
  deleteProductRequest,
  editProductRequest,
  getProductsRequest,
} from "../../api/productsApi";

import { formatDate } from "../../helpers/formatDate";
import { ProductsForm } from "./ProductsForm";
import styles from "./ProductsPage.module.css";

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isFormShown, setIsFormShown] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const [selectedProductForDetails, setSelectedProductForDetails] =
    useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const truncateText = (text, maxLength = 50) => {
    if (!text) {
      return "-";
    }

    if (text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength)}…`;
  };

  const loadProducts = async () => {
    const data = await getProductsRequest();

    setProducts(data);
  };

  const handleCreateProduct = async (formData) => {
    try {
      setError(null);

      await createProductRequest(formData);
      await loadProducts();

      setIsFormShown(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditProduct = async (formData) => {
    try {
      setError(null);

      await editProductRequest(formData);
      await loadProducts();

      setSelectedProductForEdit(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz dezaktywować ten produkt?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await deleteProductRequest(productId);
      await loadProducts();

      if (selectedProductForDetails?.id === productId) {
        setSelectedProductForDetails(null);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadProducts();
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return <p>Ładowanie produktów...</p>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Produkty</h1>
          <p>Zarządzanie produktami w systemie etykiet</p>
        </div>

        {!isFormShown && !selectedProductForEdit && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              setIsFormShown(true);
              setSelectedProductForEdit(null);
              setSelectedProductForDetails(null);
            }}
          >
            Dodaj produkt
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isFormShown && (
        <ProductsForm
          key="create-product"
          title="Dodaj produkt"
          submitText="Dodaj produkt"
          onSubmit={handleCreateProduct}
          onCancel={() => setIsFormShown(false)}
        />
      )}

      {selectedProductForEdit && (
        <ProductsForm
          key={selectedProductForEdit.id}
          product={selectedProductForEdit}
          title="Edytuj produkt"
          submitText="Zapisz zmiany"
          onSubmit={handleEditProduct}
          onCancel={() => setSelectedProductForEdit(null)}
        />
      )}

      {selectedProductForDetails && (
        <section className={styles.details}>
          <div className={styles.detailsHeader}>
            <h2>Szczegóły produktu</h2>

            <button
              type="button"
              className={styles.actionButton}
              onClick={() => setSelectedProductForDetails(null)}
            >
              Zamknij
            </button>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>ID</span>
              <strong className={styles.detailsValue}>
                {selectedProductForDetails.id}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Kod produktu</span>
              <strong className={styles.detailsValue}>
                {selectedProductForDetails.productCode}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Nazwa</span>
              <strong className={styles.detailsValue}>
                {selectedProductForDetails.name}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>EAN</span>
              <strong className={styles.detailsValue}>
                {selectedProductForDetails.ean ?? "-"}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>GTIN</span>
              <strong className={styles.detailsValue}>
                {selectedProductForDetails.gtin ?? "-"}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Utworzono</span>
              <strong className={styles.detailsValue}>
                {formatDate(selectedProductForDetails.createdAt)}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Ostatnia modyfikacja</span>
              <strong className={styles.detailsValue}>
                {selectedProductForDetails.modifiedAt
                  ? formatDate(selectedProductForDetails.modifiedAt)
                  : "-"}
              </strong>
            </div>
          </div>

          <div className={styles.description}>
            <span className={styles.descriptionLabel}>Opis</span>

            <p className={styles.descriptionValue}>
              {selectedProductForDetails.description ?? "-"}
            </p>
          </div>
        </section>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Kod produktu</th>
              <th>Nazwa</th>
              <th>Opis</th>
              <th>EAN</th>
              <th>GTIN</th>
              <th>Utworzono</th>
              <th>Akcje</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="10" className={styles.emptyState}>
                  Brak Produktów.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.productCode}</td>
                  <td>{product.name}</td>

                  <td
                    className={styles.descriptionCell}
                    title={product.description ?? ""}
                  >
                    {truncateText(product.description)}
                  </td>

                  <td>{product.ean ?? "-"}</td>
                  <td>{product.gtin ?? "-"}</td>
                  <td>{formatDate(product.createdAt)}</td>

                  <td>
                    <div className={styles.actionsCell}>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => {
                          setSelectedProductForDetails(product);
                          setSelectedProductForEdit(null);
                          setIsFormShown(false);
                        }}
                      >
                        Wyświetl
                      </button>

                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => {
                          setSelectedProductForEdit(product);
                          setSelectedProductForDetails(null);
                          setIsFormShown(false);
                        }}
                      >
                        Edytuj
                      </button>

                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => handleDeleteProduct(product.id)}
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
