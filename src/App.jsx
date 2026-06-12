import { Outlet } from "react-router-dom";
import { Sidebar } from "./components/sidebar/Sidebar";
import { TopBar } from "./components/topbar/TopBar";
import styles from "./App.module.css";

function App() {
  return (
    <div className={styles.layout}>
      <Sidebar />

      <div className={styles.main}>
        <TopBar />

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
