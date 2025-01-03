import styles from "./page.module.css";
import HabitContainer from "./HabitContainer";
import { queryHabitsWithDaysAccomplished } from "./backend/services/habit";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await queryHabitsWithDaysAccomplished();
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
