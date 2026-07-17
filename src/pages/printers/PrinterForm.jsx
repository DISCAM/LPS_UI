import { useState } from "react";
import styles from "./PrinterForm.module.css";

export const PrinterForm = ({
  printer,
  title,
  submitText,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState({
    printerId: printer?.printerId ?? null,
    name: printer?.name ?? "",
    ipAddress: printer?.ipAddress ?? "",
    location: printer?.location ?? "",
    printerModel: printer?.printerModel ?? "",
    integrationType: printer?.integrationType ?? "ZPL",
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
      ...(form.printerId !== null && {
        printerId: form.printerId,
      }),
      name: form.name.trim(),
      ipAddress: form.ipAddress.trim(),
      location: emptyToNull(form.location),
      printerModel: emptyToNull(form.printerModel),
      integrationType: form.integrationType,
    };

    await onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>{title}</h2>

      {printer && (
        <div className={styles.row}>
          <label htmlFor="printerId">ID</label>

          <input id="printerId" value={form.printerId ?? ""} disabled />
        </div>
      )}

      <div className={styles.row}>
        <label htmlFor="printerName">Nazwa drukarki</label>

        <input
          id="printerName"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          maxLength={100}
          placeholder="np. Zebra ZT411 - Magazyn"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="printerIpAddress">Adres IP</label>

        <input
          id="printerIpAddress"
          name="ipAddress"
          type="text"
          value={form.ipAddress}
          onChange={handleChange}
          required
          maxLength={45}
          placeholder="np. 192.168.1.120"
          spellCheck={false}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="printerLocation">Lokalizacja</label>

        <input
          id="printerLocation"
          name="location"
          type="text"
          value={form.location}
          onChange={handleChange}
          maxLength={100}
          placeholder="np. Magazyn główny"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="printerModel">Model drukarki</label>

        <input
          id="printerModel"
          name="printerModel"
          type="text"
          value={form.printerModel}
          onChange={handleChange}
          maxLength={100}
          placeholder="np. Zebra ZT411"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="printerIntegrationType">Typ integracji</label>

        <select
          id="printerIntegrationType"
          name="integrationType"
          value={form.integrationType}
          onChange={handleChange}
          required
        >
          <option value="ZPL">ZPL</option>
          <option value="SATO_AEP">SATO AEP</option>
          <option value="OTHER">Inne</option>
        </select>
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
