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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

        {!isFormShown && (
          <button
            onClick={() => {
              setIsFormShown(true);
              setSelectedProductForEdit(null);
            }}
            className={styles.addButton}
          >
            Dodaj produkt
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isFormShown && (
        <ProductsForm
          title="Dodaj produkt"
          submitText="Dodaj produkt"
          onSubmit={handleCreateProduct}
          onCancel={() => setIsFormShown(false)}
        />
      )}

      {selectedProductForEdit && (
        <ProductsForm
          product={selectedProductForEdit}
          title="Edytuj produkt"
          submitText="Zapisz zmiany"
          onSubmit={handleEditProduct}
          onCancel={() => setSelectedProductForEdit(null)}
        />
      )}

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
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.productCode}</td>
              <td>{product.name}</td>
              <td>{product.description ?? "-"}</td>
              <td>{product.ean ?? "-"}</td>
              <td>{product.gtin ?? "-"}</td>
              <td>{formatDate(product.createdAt)}</td>
              <td>
                <button
                  onClick={() => {
                    setSelectedProductForEdit(product);
                    setIsFormShown(false);
                  }}
                >
                  Edytuj
                </button>

                <button onClick={() => handleDeleteProduct(product.id)}>
                  Dezaktywuj
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
