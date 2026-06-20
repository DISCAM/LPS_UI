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
  const [selectedCustomerForDetails, setSelectedCustomerForDetails] =
    useState(null);
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

      if (selectedCustomerForDetails?.id === customerId) {
        setSelectedCustomerForDetails(null);
      }
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

        {!isFormShown && !selectedCustomerForEdit && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              setIsFormShown(true);
              setSelectedCustomerForEdit(null);
              setSelectedCustomerForDetails(null);
            }}
          >
            Dodaj klienta
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isFormShown && (
        <CustomerForm
          key="create-customer"
          title="Dodaj klienta"
          submitText="Dodaj klienta"
          onSubmit={handleCreateCustomer}
          onCancel={() => setIsFormShown(false)}
        />
      )}

      {selectedCustomerForEdit && (
        <CustomerForm
          key={selectedCustomerForEdit.id}
          customer={selectedCustomerForEdit}
          title="Edytuj klienta"
          submitText="Zapisz zmiany"
          onSubmit={handleEditCustomer}
          onCancel={() => setSelectedCustomerForEdit(null)}
        />
      )}

      {selectedCustomerForDetails && (
        <section className={styles.details}>
          <div className={styles.detailsHeader}>
            <h2>Szczegóły klienta</h2>

            <button
              type="button"
              className={styles.actionButton}
              onClick={() => setSelectedCustomerForDetails(null)}
            >
              Zamknij
            </button>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>ID</span>
              <strong className={styles.detailsValue}>
                {selectedCustomerForDetails.id}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Kod klienta</span>
              <strong className={styles.detailsValue}>
                {selectedCustomerForDetails.customerCode}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Nazwa</span>
              <strong className={styles.detailsValue}>
                {selectedCustomerForDetails.name}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>NIP / numer podatkowy</span>
              <strong className={styles.detailsValue}>
                {selectedCustomerForDetails.taxNumber ?? "-"}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>E-mail</span>
              <strong className={styles.detailsValue}>
                {selectedCustomerForDetails.email ?? "-"}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Telefon</span>
              <strong className={styles.detailsValue}>
                {selectedCustomerForDetails.phone ?? "-"}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Ulica</span>
              <strong className={styles.detailsValue}>
                {selectedCustomerForDetails.street ?? "-"}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Kod pocztowy</span>
              <strong className={styles.detailsValue}>
                {selectedCustomerForDetails.postalCode ?? "-"}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Miasto</span>
              <strong className={styles.detailsValue}>
                {selectedCustomerForDetails.city ?? "-"}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Kraj</span>
              <strong className={styles.detailsValue}>
                {selectedCustomerForDetails.country ?? "-"}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Utworzono</span>
              <strong className={styles.detailsValue}>
                {formatDate(selectedCustomerForDetails.createdAt)}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Ostatnia modyfikacja</span>
              <strong className={styles.detailsValue}>
                {selectedCustomerForDetails.modifiedAt
                  ? formatDate(selectedCustomerForDetails.modifiedAt)
                  : "-"}
              </strong>
            </div>
          </div>
        </section>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Kod klienta</th>
              <th>Nazwa</th>
              <th>NIP</th>
              <th>E-mail</th>
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
                  <div className={styles.actionsCell}>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => {
                        setSelectedCustomerForDetails(customer);
                        setSelectedCustomerForEdit(null);
                        setIsFormShown(false);
                      }}
                    >
                      Wyświetl
                    </button>

                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => {
                        setSelectedCustomerForEdit(customer);
                        setSelectedCustomerForDetails(null);
                        setIsFormShown(false);
                      }}
                    >
                      Edytuj
                    </button>

                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => handleDeleteCustomer(customer.id)}
                    >
                      Usuń
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
