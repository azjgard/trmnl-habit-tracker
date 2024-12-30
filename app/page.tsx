import styles from "./page.module.css";
import { createClient } from "@vercel/postgres";
import HabitContainer from "./HabitContainer";

export default async function Home() {
  const client = createClient();
  await client.connect();

  const { rows: habits } = (await client.sql`SELECT * from habits`) as {
    rows: {
      id: number;
      name: string;
      image: string | null;
      weekly_goal: number;
    }[];
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <HabitContainer initialHabits={habits} />
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
