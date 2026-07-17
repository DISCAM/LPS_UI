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
    id: customer?.id ?? null,
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

  const emptyToNull = (value) => {
    const trimmedValue = value.trim();

    return trimmedValue === "" ? null : trimmedValue;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const dataToSend = {
      ...(form.id !== null && { id: form.id }),
      customerCode: form.customerCode.trim(),
      name: form.name.trim(),
      taxNumber: emptyToNull(form.taxNumber),
      email: emptyToNull(form.email),
      phone: emptyToNull(form.phone),
      street: emptyToNull(form.street),
      postalCode: emptyToNull(form.postalCode),
      city: emptyToNull(form.city),
      country: emptyToNull(form.country),
    };

    await onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>{title}</h2>

      {customer && (
        <div className={styles.row}>
          <label htmlFor="customerId">ID</label>

          <input id="customerId" value={form.id ?? ""} disabled />
        </div>
      )}

      <div className={styles.row}>
        <label htmlFor="customerCode">Kod klienta</label>

        <input
          id="customerCode"
          name="customerCode"
          type="text"
          value={form.customerCode}
          onChange={handleChange}
          placeholder="np. KLIENT-001"
          required
          maxLength={50}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="customerName">Nazwa</label>

        <input
          id="customerName"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="np. DISCAM Sp. z o.o."
          required
          maxLength={150}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="taxNumber">NIP / numer podatkowy</label>

        <input
          id="taxNumber"
          name="taxNumber"
          type="text"
          value={form.taxNumber}
          onChange={handleChange}
          placeholder="np. 1234567890"
          maxLength={30}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="customerEmail">E-mail</label>

        <input
          id="customerEmail"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="np. kontakt@firma.pl"
          autoComplete="email"
          maxLength={150}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="customerPhone">Telefon</label>

        <input
          id="customerPhone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="np. +48 123 456 789"
          autoComplete="tel"
          maxLength={30}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="customerStreet">Ulica</label>

        <input
          id="customerStreet"
          name="street"
          type="text"
          value={form.street}
          onChange={handleChange}
          placeholder="np. ul. Przemysłowa 10"
          autoComplete="street-address"
          maxLength={150}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="customerPostalCode">Kod pocztowy</label>

        <input
          id="customerPostalCode"
          name="postalCode"
          type="text"
          value={form.postalCode}
          onChange={handleChange}
          placeholder="np. 00-001"
          autoComplete="postal-code"
          maxLength={20}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="customerCity">Miasto</label>

        <input
          id="customerCity"
          name="city"
          type="text"
          value={form.city}
          onChange={handleChange}
          placeholder="np. Warszawa"
          autoComplete="address-level2"
          maxLength={100}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="customerCountry">Kraj</label>

        <input
          id="customerCountry"
          name="country"
          type="text"
          value={form.country}
          onChange={handleChange}
          placeholder="np. Polska"
          autoComplete="country-name"
          maxLength={100}
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
