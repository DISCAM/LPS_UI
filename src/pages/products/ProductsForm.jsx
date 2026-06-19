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
    id: product?.id,
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>{title}</h2>

      {product && (
        <div className={styles.row}>
          <label>ID</label>
          <input value={form.id} disabled />
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
        />
      </div>

      <div className={styles.row}>
        <label>Opis</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
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
        <button type="submit">{submitText}</button>
        <button type="button" onClick={onCancel}>
          Anuluj
        </button>
      </div>
    </form>
  );
};
