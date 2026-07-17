import { useState } from "react";
import styles from "./ProductsForm.module.css";

export const ProductsForm = ({
  product,
  title,
  submitText,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState({
    id: product?.id ?? null,
    productCode: product?.productCode ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    ean: product?.ean ?? "",
    gtin: product?.gtin ?? "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // zabezpieczamy przed pustymi danymi
  const emptyToNull = (value) => {
    const trimmedValue = value.trim();

    return trimmedValue === "" ? null : trimmedValue;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const dataToSend = {
      ...(form.id !== null && { id: form.id }),
      productCode: form.productCode.trim(),
      name: form.name.trim(),
      description: emptyToNull(form.description),
      ean: emptyToNull(form.ean),
      gtin: emptyToNull(form.gtin),
    };

    await onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>{title}</h2>

      {product && (
        <div className={styles.row}>
          <label htmlFor="productId">ID</label>
          <input id="productId" value={form.id ?? ""} disabled />
        </div>
      )}

      <div className={styles.row}>
        <label htmlFor="productCode">Kod produktu</label>

        <input
          id="productCode"
          name="productCode"
          type="text"
          value={form.productCode}
          onChange={handleChange}
          placeholder="np. PROD-001"
          required
          maxLength={50}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="productName">Nazwa</label>

        <input
          id="productName"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Wprowadz nazwę produktu"
          required
          maxLength={150}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="productDescription">Opis</label>

        <textarea
          id="productDescription"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Wprowadź dodatkowy opis produktu"
          maxLength={500}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="productEan">EAN</label>

        <input
          id="productEan"
          name="ean"
          type="text"
          value={form.ean}
          onChange={handleChange}
          placeholder="np. 5901234123457"
          inputMode="numeric"
          maxLength={14}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="productGtin">GTIN</label>

        <input
          id="productGtin"
          name="gtin"
          type="text"
          value={form.gtin}
          onChange={handleChange}
          placeholder="np. 05901234123457"
          inputMode="numeric"
          maxLength={14}
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton}>
          {submitText}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className={styles.actionButton}
        >
          Anuluj
        </button>
      </div>
    </form>
  );
};
