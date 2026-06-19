import { useEffect, useState } from "react";
import {
  createCustomerRequest,
  deleteCustomerRequest,
  editCustomerRequest,
  getCustomersRequest,
} from "../../api/customersApi";
import { formatDate } from "../../helpers/formatDate";
import { CustomerForm } from "./CustomerForm";
import styles from "./CustomersPage.module.css";

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [isFormShown, setIsFormShown] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCustomers = async () => {
    const data = await getCustomersRequest();
    setCustomers(data);
  };

  const handleCreateCustomer = async (formData) => {
    try {
      setError(null);

      await createCustomerRequest(formData);
      await loadCustomers();

      setIsFormShown(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditCustomer = async (formData) => {
    try {
      setError(null);

      await editCustomerRequest(formData);
      await loadCustomers();

      setSelectedCustomerForEdit(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz dezaktywować tego klienta?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await deleteCustomerRequest(customerId);
      await loadCustomers();
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadCustomers();
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return <p>Ładowanie klientów...</p>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Klienci</h1>
          <p>Zarządzanie klientami systemu</p>
        </div>

        {!isFormShown && (
          <button
            onClick={() => {
              setIsFormShown(true);
              setSelectedCustomerForEdit(null);
            }}
            className={styles.addButton}
          >
            Dodaj klienta
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isFormShown && (
        <CustomerForm
          title="Dodaj klienta"
          submitText="Dodaj klienta"
          onSubmit={handleCreateCustomer}
          onCancel={() => setIsFormShown(false)}
        />
      )}

      {selectedCustomerForEdit && (
        <CustomerForm
          customer={selectedCustomerForEdit}
          title="Edytuj klienta"
          submitText="Zapisz zmiany"
          onSubmit={handleEditCustomer}
          onCancel={() => setSelectedCustomerForEdit(null)}
        />
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Kod klienta</th>
            <th>Nazwa</th>
            <th>NIP</th>
            <th>Email</th>
            <th>Telefon</th>
            <th>Miasto</th>
            <th>Kraj</th>
            <th>Utworzono</th>
            <th>Akcje</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.customerCode}</td>
              <td>{customer.name}</td>
              <td>{customer.taxNumber ?? "-"}</td>
              <td>{customer.email ?? "-"}</td>
              <td>{customer.phone ?? "-"}</td>
              <td>{customer.city ?? "-"}</td>
              <td>{customer.country ?? "-"}</td>
              <td>{formatDate(customer.createdAt)}</td>
              <td>
                <button
                  onClick={() => {
                    setSelectedCustomerForEdit(customer);
                    setIsFormShown(false);
                  }}
                >
                  Edytuj
                </button>

                <button onClick={() => handleDeleteCustomer(customer.id)}>
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
