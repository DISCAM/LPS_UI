import { useEffect, useRef, useState } from "react";
import { getProductsRequest } from "../../../api/productsApi";
import { getPrintersRequest } from "../../../api/printersApi";
import { getLabelTemplatesRequest } from "../../../api/labelTemplatesApi";
import { printEanRequest } from "../../../api/printLabelsApi";
import styles from "./PrintEanPage.module.css";

const normalizeCode = (value) => {
  return String(value ?? "")
    .trim()
    .toLowerCase();
};

export const PrintEanPage = () => {
  const [products, setProducts] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [labelTemplates, setLabelTemplates] = useState([]);

  const [searchCode, setSearchCode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [printForm, setPrintForm] = useState({
    labelTemplateId: "",
    printerId: "",
    copies: "1",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [printResult, setPrintResult] = useState(null);

  const searchInputRef = useRef(null);

  const loadData = async () => {
    const [productsData, printersData, labelTemplatesData] = await Promise.all([
      getProductsRequest(),
      getPrintersRequest(),
      getLabelTemplatesRequest(),
    ]);

    setProducts(productsData);
    setPrinters(printersData);
    setLabelTemplates(labelTemplatesData);

    const activeProductTemplates = labelTemplatesData.filter(
      (template) => template.isActive && template.labelType === "PRODUCT",
    );

    const defaultTemplate =
      activeProductTemplates.find((template) => template.isDefault) ??
      activeProductTemplates[0];

    setPrintForm((prev) => ({
      ...prev,
      labelTemplateId: defaultTemplate ? String(defaultTemplate.id) : "",
    }));
  };

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);

        await loadData();
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleSearchProduct = (event) => {
    event.preventDefault();

    setError(null);
    setPrintResult(null);

    const searchedCode = normalizeCode(searchCode);

    if (!searchedCode) {
      setSelectedProduct(null);
      setError("Wpisz lub zeskanuj EAN, GTIN albo kod produktu.");
      return;
    }

    const foundProduct = products.find((product) => {
      return (
        normalizeCode(product.productCode) === searchedCode ||
        normalizeCode(product.ean) === searchedCode ||
        normalizeCode(product.gtin) === searchedCode
      );
    });

    if (!foundProduct) {
      setSelectedProduct(null);
      setError(`Nie znaleziono produktu dla kodu: ${searchCode}`);
      return;
    }

    setSelectedProduct(foundProduct);
  };

  const handleProductChange = (event) => {
    const selectedProductId = Number(event.target.value);

    const product = products.find((item) => item.id === selectedProductId);

    setSelectedProduct(product ?? null);
    setError(null);
    setPrintResult(null);
  };

  const handlePrintFormChange = (event) => {
    const { name, value } = event.target;

    setPrintForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError(null);
  };

  const handlePrintSubmit = async (event) => {
    event.preventDefault();

    setError(null);

    const copies = Number(printForm.copies);
    const labelTemplateId = Number(printForm.labelTemplateId);
    const printerId = Number(printForm.printerId);

    if (!selectedProduct) {
      setError("Najpierw wybierz produkt.");
      return;
    }

    if (!selectedProduct.ean) {
      setError(
        "Nie można utworzyć wydruku EAN, ponieważ wybrany produkt nie ma kodu EAN.",
      );
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
      setIsSubmitting(true);

      const printData = {
        productId: selectedProduct.id,
        labelTemplateId,
        printerId,
        copies,
      };

      console.log("Dane wysyłane do /print-ean:", printData);

      const result = await printEanRequest(printData);

      setPrintResult(result);

      setPrintForm((prev) => ({
        ...prev,
        copies: "1",
      }));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewProduct = () => {
    setSearchCode("");
    setSelectedProduct(null);
    setError(null);
    setPrintResult(null);

    setPrintForm((prev) => ({
      ...prev,
      copies: "1",
    }));

    searchInputRef.current?.focus();
  };

  const activeProductTemplates = labelTemplates.filter(
    (template) => template.isActive && template.labelType === "PRODUCT",
  );

  const activePrinters = printers.filter((printer) => printer.isActive);

  const isPrintCompleted = Boolean(printResult);

  if (isLoading) {
    return <p>Ładowanie danych do wydruku...</p>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h2>Wydrukuj etykietę EAN</h2>
        <p>Utwórz zadanie wydruku etykiety dla wybranego produktu.</p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.card}>
        <h3>Wyszukaj produkt</h3>

        <form onSubmit={handleSearchProduct} className={styles.searchForm}>
          <input
            ref={searchInputRef}
            type="text"
            value={searchCode}
            onChange={(event) => setSearchCode(event.target.value)}
            placeholder="Zeskanuj EAN, GTIN lub wpisz kod produktu"
            autoFocus
          />

          <button type="submit" className={styles.primaryButton}>
            Szukaj
          </button>
        </form>

        <div className={styles.separator}>
          <span>lub wybierz z listy</span>
        </div>

        <div className={styles.field}>
          <label htmlFor="productId">Produkt</label>

          <select
            id="productId"
            value={selectedProduct?.id ?? ""}
            onChange={handleProductChange}
          >
            <option value="">-- wybierz produkt --</option>

            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.productCode} — {product.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {selectedProduct && (
        <section className={styles.card}>
          <h3>Wybrany produkt</h3>

          <div className={styles.productDetails}>
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Kod produktu</span>
              <strong className={styles.detailsValue}>
                {selectedProduct.productCode}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Nazwa produktu</span>
              <strong className={styles.detailsValue}>
                {selectedProduct.name}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>EAN</span>
              <strong className={styles.detailsValue}>
                {selectedProduct.ean ?? "-"}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>GTIN</span>
              <strong className={styles.detailsValue}>
                {selectedProduct.gtin ?? "-"}
              </strong>
            </div>
          </div>

          <div className={styles.description}>
            <span className={styles.detailsLabel}>Opis</span>
            <p>{selectedProduct.description ?? "-"}</p>
          </div>

          {!selectedProduct.ean && (
            <p className={styles.warning}>
              Ten produkt nie ma przypisanego kodu EAN. Nie będzie można
              utworzyć wydruku EAN.
            </p>
          )}
        </section>
      )}

      <form onSubmit={handlePrintSubmit} className={styles.card}>
        <h3>Parametry wydruku</h3>

        <div className={styles.printFormGrid}>
          <div className={styles.field}>
            <label htmlFor="labelTemplateId">Szablon etykiety</label>

            <select
              id="labelTemplateId"
              name="labelTemplateId"
              value={printForm.labelTemplateId}
              onChange={handlePrintFormChange}
            >
              <option value="">-- wybierz szablon --</option>

              {activeProductTemplates.map((template) => (
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
            />
          </div>
        </div>

        {!selectedProduct && (
          <p className={styles.info}>Najpierw wyszukaj lub wybierz produkt.</p>
        )}

        {selectedProduct && !selectedProduct.ean && (
          <p className={styles.warning}>
            Wybrany produkt nie ma EAN, więc nie można utworzyć wydruku EAN.
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={
              isSubmitting ||
              isPrintCompleted ||
              !selectedProduct ||
              !selectedProduct.ean ||
              !printForm.labelTemplateId ||
              !printForm.printerId
            }
          >
            {isSubmitting
              ? "Tworzenie zadania wydruku..."
              : isPrintCompleted
                ? "Zadanie wydruku utworzone"
                : "Utwórz zadanie wydruku"}
          </button>
        </div>
      </form>

      {printResult && (
        <section className={styles.success}>
          <h3>Zadanie wydruku utworzone</h3>

          <p className={styles.successMessage}>
            Zadanie zostało dodane do kolejki wydruku.
          </p>

          <div className={styles.productDetails}>
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Numer etykiety</span>
              <strong className={styles.detailsValue}>
                {printResult.labelId}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Numer zadania</span>
              <strong className={styles.detailsValue}>
                {printResult.printJobId}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Status</span>
              <strong className={styles.detailsValue}>
                {printResult.status}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Liczba kopii</span>
              <strong className={styles.detailsValue}>
                {printResult.copies}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Produkt</span>
              <strong className={styles.detailsValue}>
                {selectedProduct.name}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>EAN</span>
              <strong className={styles.detailsValue}>
                {selectedProduct.ean}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Szablon</span>
              <strong className={styles.detailsValue}>
                {printResult.templateName}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Drukarka</span>
              <strong className={styles.detailsValue}>
                {printResult.printerName}
              </strong>
            </div>
          </div>

          <div className={styles.successActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleNewProduct}
            >
              Nowy produkt
            </button>
          </div>
        </section>
      )}
    </section>
  );
};
