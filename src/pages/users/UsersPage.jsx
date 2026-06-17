import { useEffect, useState } from "react";
import {
  createUserRequest,
  getUsersRequest,
  assignRoleRequest,
  deleteUserRequest,
  editUserRequest,
} from "../../api/usersApi";
import { AssignRoleForm } from "./AssignRoleForm";
import { AddUserForm } from "./AddUsersForm";
import { formatDate } from "../../helpers/formatDate";
import { EditUserForm } from "./EditUserForm";
import styles from "./UsersPage.module.css";

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isFormShown, setIsFormShown] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    const data = await getUsersRequest();
    setUsers(data);
  };

  const handleCreateUser = async (formData) => {
    try {
      setError(null);

      await createUserRequest(formData);
      await loadUsers();

      setIsFormShown(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAssignRole = async (roleData) => {
    try {
      setError(null);

      await assignRoleRequest(roleData);
      await loadUsers();

      setSelectedUserForRole(null);
    } catch (error) {
      setError(error.message);
    }
  };

  //delete user
  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz dezaktywować tego użytkownika?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      await deleteUserRequest(userId);
      await loadUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditUser = async (formData) => {
    try {
      setError(null);

      console.log("EDIT USER DATA:", formData);

      await editUserRequest(formData);
      await loadUsers();

      setSelectedUserForEdit(null);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadUsers();
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return <p>Ładowanie użytkowników...</p>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Użytkownicy</h1>
          <p>Zarządzanie użytkownikami systemu</p>
        </div>

        {!isFormShown && (
          <button
            onClick={() => setIsFormShown(true)}
            className={styles.addButton}
          >
            Dodaj użytkownika
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isFormShown && (
        <AddUserForm
          onSubmit={handleCreateUser}
          onCancel={() => setIsFormShown(false)}
        />
      )}

      {selectedUserForRole && (
        <AssignRoleForm
          user={selectedUserForRole}
          onSubmit={handleAssignRole}
          onCancel={() => setSelectedUserForRole(null)}
        />
      )}

      {selectedUserForEdit && (
        <EditUserForm
          user={selectedUserForEdit}
          onSubmit={handleEditUser}
          onCancel={() => setSelectedUserForEdit(null)}
        />
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Imię i nazwisko</th>
            <th>Email</th>
            <th>Rola</th>
            <th>Utworzono</th>
            <th>Akcje</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.fullName}</td>
              <td>{user.email ?? "-"}</td>
              <td>{user.roleName ?? user.roles?.join(", ") ?? "-"}</td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                <button onClick={() => setSelectedUserForEdit(user)}>
                  Edytuj
                </button>

                <button onClick={() => setSelectedUserForRole(user)}>
                  Rola
                </button>

                <button onClick={() => handleDeleteUser(user.id)}>Usuń</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
