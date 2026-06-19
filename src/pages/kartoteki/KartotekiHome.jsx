import { Link } from "react-router-dom";
import styles from "./KartotekiHome.module.css";

export const KartotekiHome = () => {
  return (
    <div className={styles.cards}>
      <Link to="/kartoteki/products" className={styles.card}>
        <h2>Produkty</h2>
        <p>
          Kartoteka produktów wykorzystywanych podczas tworzenia etykiet, zleceń
          produkcyjnych i jednostek logistycznych.
        </p>
      </Link>

      <Link to="/kartoteki/customers" className={styles.card}>
        <h2>Klienci</h2>
        <p>
          Kartoteka klientów, odbiorców i kontrahentów wykorzystywanych w
          zleceniach oraz dokumentach magazynowych.
        </p>
      </Link>
    </div>
  );
};
