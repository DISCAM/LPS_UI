import { useEffect, useState } from "react";
import {
  createLabelTemplateRequest,
  deleteLabelTemplateRequest,
  editLabelTemplateRequest,
  getLabelTemplatesRequest,
} from "../../api/labelTemplatesApi";
import { useAuth } from "../../auth/useAuth";
import { formatDate } from "../../helpers/formatDate";
import { LabelTemplatesForm } from "./LabelTemplatesForm";
import styles from "./LabelTemplatesPage.module.css";

export const LabelTemplatesPage = () => {
  const { hasAnyRole } = useAuth();

  const [labelTemplates, setLabelTemplates] = useState([]);
  const [isFormShown, setIsFormShown] = useState(false);
  const [selectedLabelTemplateForEdit, setSelectedLabelTemplateForEdit] =
    useState(null);
  const [selectedLabelTemplateForDetails, setSelectedLabelTemplateForDetails] =
    useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const canManageLabelTemplates = hasAnyRole([
    "SuperAdmin",
    "Admin",
    "Manager",
  ]);

  const truncateText = (text, maxLength = 50) => {
    if (!text) {
      return "-";
    }

    if (text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength)}…`;
  };

  const loadLabelTemplates = async () => {
    const data = await getLabelTemplatesRequest();

    setLabelTemplates(data);
  };

  const handleCreateLabelTemplate = async (formData) => {
    try {
      setError(null);

      await createLabelTemplateRequest(formData);
      await loadLabelTemplates();

      setIsFormShown(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditLabelTemplate = async (formData) => {
    try {
      setError(null);

      await editLabelTemplateRequest(formData);
      await loadLabelTemplates();

      setSelectedLabelTemplateForEdit(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteLabelTemplate = async (labelTemplateId) => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz dezaktywować ten szablon etykiety?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await deleteLabelTemplateRequest(labelTemplateId);
      await loadLabelTemplates();

      if (selectedLabelTemplateForDetails?.id === labelTemplateId) {
        setSelectedLabelTemplateForDetails(null);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadLabelTemplates();
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return <p>Ładowanie szablonów etykiet...</p>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Szablony etykiet</h1>
          <p>
            Zarządzanie definicjami szablonów wykorzystywanych podczas
            drukowania etykiet
          </p>
        </div>

        {canManageLabelTemplates &&
          !isFormShown &&
          !selectedLabelTemplateForEdit && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                setIsFormShown(true);
                setSelectedLabelTemplateForEdit(null);
                setSelectedLabelTemplateForDetails(null);
              }}
            >
              Dodaj szablon
            </button>
          )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isFormShown && (
        <LabelTemplatesForm
          key="create-label-template"
          title="Dodaj szablon etykiety"
          submitText="Dodaj szablon"
          onSubmit={handleCreateLabelTemplate}
          onCancel={() => setIsFormShown(false)}
        />
      )}

      {selectedLabelTemplateForEdit && (
        <LabelTemplatesForm
          key={selectedLabelTemplateForEdit.id}
          labelTemplate={selectedLabelTemplateForEdit}
          title="Edytuj szablon etykiety"
          submitText="Zapisz zmiany"
          onSubmit={handleEditLabelTemplate}
          onCancel={() => setSelectedLabelTemplateForEdit(null)}
        />
      )}

      {selectedLabelTemplateForDetails && (
        <section className={styles.details}>
          <div className={styles.detailsHeader}>
            <h2>Szczegóły szablonu etykiety</h2>

            <button
              type="button"
              className={styles.actionButton}
              onClick={() => setSelectedLabelTemplateForDetails(null)}
            >
              Zamknij
            </button>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>ID</span>
              <strong className={styles.detailsValue}>
                {selectedLabelTemplateForDetails.id}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Nazwa</span>
              <strong className={styles.detailsValue}>
                {selectedLabelTemplateForDetails.name}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Typ etykiety</span>
              <strong className={styles.detailsValue}>
                {selectedLabelTemplateForDetails.labelType}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Silnik szablonu</span>
              <strong className={styles.detailsValue}>
                {selectedLabelTemplateForDetails.templateEngine}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Numer wersji</span>
              <strong className={styles.detailsValue}>
                {selectedLabelTemplateForDetails.versionNo}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Domyślny</span>
              <strong className={styles.detailsValue}>
                {selectedLabelTemplateForDetails.isDefault ? "Tak" : "Nie"}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Utworzono</span>
              <strong className={styles.detailsValue}>
                {formatDate(selectedLabelTemplateForDetails.createdAt)}
              </strong>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Ostatnia modyfikacja</span>
              <strong className={styles.detailsValue}>
                {selectedLabelTemplateForDetails.modifiedAt
                  ? formatDate(selectedLabelTemplateForDetails.modifiedAt)
                  : "-"}
              </strong>
            </div>
          </div>

          <div className={styles.reference}>
            <span className={styles.referenceLabel}>Referencja szablonu</span>

            <p className={styles.referenceValue}>
              {selectedLabelTemplateForDetails.templateReference}
            </p>
          </div>
        </section>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nazwa</th>
              <th>Typ etykiety</th>
              <th>Silnik</th>
              <th>Referencja</th>
              <th>Wersja</th>
              <th>Domyślny</th>
              <th>Utworzono</th>
              <th>Akcje</th>
            </tr>
          </thead>

          <tbody>
            {labelTemplates.length === 0 ? (
              <tr>
                <td colSpan="9" className={styles.emptyState}>
                  Brak szablonów etykiet.
                </td>
              </tr>
            ) : (
              labelTemplates.map((labelTemplate) => (
                <tr key={labelTemplate.id}>
                  <td>{labelTemplate.id}</td>
                  <td>{labelTemplate.name}</td>
                  <td>{labelTemplate.labelType}</td>
                  <td>{labelTemplate.templateEngine}</td>

                  <td
                    className={styles.referenceCell}
                    title={labelTemplate.templateReference ?? ""}
                  >
                    {truncateText(labelTemplate.templateReference)}
                  </td>

                  <td>{labelTemplate.versionNo}</td>
                  <td>{labelTemplate.isDefault ? "Tak" : "Nie"}</td>
                  <td>{formatDate(labelTemplate.createdAt)}</td>

                  <td>
                    <div className={styles.actionsCell}>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => {
                          setSelectedLabelTemplateForDetails(labelTemplate);
                          setSelectedLabelTemplateForEdit(null);
                          setIsFormShown(false);
                        }}
                      >
                        Wyświetl
                      </button>

                      {canManageLabelTemplates && (
                        <>
                          <button
                            type="button"
                            className={styles.actionButton}
                            onClick={() => {
                              setSelectedLabelTemplateForEdit(labelTemplate);
                              setSelectedLabelTemplateForDetails(null);
                              setIsFormShown(false);
                            }}
                          >
                            Edytuj
                          </button>

                          <button
                            type="button"
                            className={styles.actionButton}
                            onClick={() =>
                              handleDeleteLabelTemplate(labelTemplate.id)
                            }
                          >
                            Usuń
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
