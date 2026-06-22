import { useState } from "react";
import styles from "./LabelTemplatesForm.module.css";

export const LabelTemplatesForm = ({
  labelTemplate,
  title,
  submitText,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState({
    id: labelTemplate?.id,
    name: labelTemplate?.name ?? "",
    labelType: labelTemplate?.labelType ?? "",
    templateEngine: labelTemplate?.templateEngine ?? "",
    templateReference: labelTemplate?.templateReference ?? "",
    versionNo: labelTemplate?.versionNo ?? 1,
    isDefault: labelTemplate?.isDefault ?? false,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "versionNo"
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>{title}</h2>

      {labelTemplate && (
        <div className={styles.row}>
          <label htmlFor="id">ID</label>
          <input id="id" value={form.id ?? ""} disabled />
        </div>
      )}

      <div className={styles.row}>
        <label htmlFor="name">Nazwa szablonu</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          maxLength="100"
          required
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="labelType">Typ etykiety</label>

        <select
          id="labelType"
          name="labelType"
          value={form.labelType}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Wybierz typ etykiety
          </option>

          <option value="PRODUCT">Produktowa</option>
          <option value="PRODUCTION">Produkcyjna</option>
          <option value="LOGISTIC">Logistyczna</option>
        </select>
      </div>

      <div className={styles.row}>
        <label htmlFor="templateEngine">Silnik szablonu</label>

        <select
          id="templateEngine"
          name="templateEngine"
          value={form.templateEngine}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Wybierz silnik
          </option>

          <option value="ZPL">ZPL</option>
          <option value="AEP">AEP</option>
        </select>
      </div>

      <div className={styles.row}>
        <label htmlFor="templateReference">Referencja szablonu</label>
        <input
          id="templateReference"
          name="templateReference"
          type="text"
          value={form.templateReference}
          onChange={handleChange}
          maxLength="255"
          placeholder="np. templates/product-100x50.zpl"
          required
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="versionNo">Numer wersji</label>
        <input
          id="versionNo"
          name="versionNo"
          type="number"
          min="1"
          value={form.versionNo}
          onChange={handleChange}
          required
        />
      </div>

      <label className={styles.checkboxRow} htmlFor="isDefault">
        <input
          id="isDefault"
          name="isDefault"
          type="checkbox"
          checked={form.isDefault}
          onChange={handleChange}
        />

        <span>Ustaw jako domyślny szablon dla tego typu etykiety</span>
      </label>

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton}>
          {submitText}
        </button>

        <button
          type="button"
          className={styles.actionButton}
          onClick={onCancel}
        >
          Anuluj
        </button>
      </div>
    </form>
  );
};
