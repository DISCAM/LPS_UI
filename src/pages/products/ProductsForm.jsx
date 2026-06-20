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
          <label>ID</label>

          <input value={form.id ?? ""} disabled />
        </div>
      )}

      <div className={styles.row}>
        <label>Kod produktu</label>

        <input
          name="productCode"
          type="text"
          value={form.productCode}
          onChange={handleChange}
          required
          maxLength={50}
        />
      </div>

      <div className={styles.row}>
        <label>Nazwa</label>

        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          maxLength={150}
        />
      </div>

      <div className={styles.row}>
        <label>Opis</label>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          maxLength={500}
        />
      </div>

      <div className={styles.row}>
        <label>EAN</label>

        <input
          name="ean"
          type="text"
          value={form.ean}
          onChange={handleChange}
          maxLength={14}
        />
      </div>

      <div className={styles.row}>
        <label>GTIN</label>

        <input
          name="gtin"
          type="text"
          value={form.gtin}
          onChange={handleChange}
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
