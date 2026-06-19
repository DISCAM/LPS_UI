import { useState } from "react";
import styles from "./CustomerForm.module.css";

export const CustomerForm = ({
  customer,
  title,
  submitText,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState({
    id: customer?.id,
    customerCode: customer?.customerCode ?? "",
    name: customer?.name ?? "",
    taxNumber: customer?.taxNumber ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    street: customer?.street ?? "",
    postalCode: customer?.postalCode ?? "",
    city: customer?.city ?? "",
    country: customer?.country ?? "",
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

      {customer && (
        <div className={styles.row}>
          <label>ID</label>
          <input value={form.id} disabled />
        </div>
      )}

      <div className={styles.row}>
        <label>Kod klienta</label>
        <input
          name="customerCode"
          type="text"
          value={form.customerCode}
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
        <label>NIP / numer podatkowy</label>
        <input
          name="taxNumber"
          type="text"
          value={form.taxNumber}
          onChange={handleChange}
          maxLength={30}
        />
      </div>

      <div className={styles.row}>
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          maxLength={150}
        />
      </div>

      <div className={styles.row}>
        <label>Telefon</label>
        <input
          name="phone"
          type="text"
          value={form.phone}
          onChange={handleChange}
          maxLength={30}
        />
      </div>

      <div className={styles.row}>
        <label>Ulica</label>
        <input
          name="street"
          type="text"
          value={form.street}
          onChange={handleChange}
          maxLength={150}
        />
      </div>

      <div className={styles.row}>
        <label>Kod pocztowy</label>
        <input
          name="postalCode"
          type="text"
          value={form.postalCode}
          onChange={handleChange}
          maxLength={20}
        />
      </div>

      <div className={styles.row}>
        <label>Miasto</label>
        <input
          name="city"
          type="text"
          value={form.city}
          onChange={handleChange}
          maxLength={100}
        />
      </div>

      <div className={styles.row}>
        <label>Kraj</label>
        <input
          name="country"
          type="text"
          value={form.country}
          onChange={handleChange}
          maxLength={100}
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
