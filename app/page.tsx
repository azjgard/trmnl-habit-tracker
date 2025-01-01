import styles from "./page.module.css";
import HabitContainer from "./HabitContainer";
import { loadHabitsWithDaysAccomplished } from "./backend/services/habit";

export default async function Home() {
  const data = await loadHabitsWithDaysAccomplished();
  if (!data) {
    return <div>Something went wrong..</div>;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <HabitContainer initialData={data} />
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
