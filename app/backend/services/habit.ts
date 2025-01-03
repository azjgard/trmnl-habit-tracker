import { createClient, VercelClient } from "@vercel/postgres";
import { waitUntil } from "@vercel/functions";

function sundayFirstToMondayFirst(day: number) {
  return (day + 6) % 7;
}

export type HabitsWithDaysAccomplished = NonNullable<
  Awaited<ReturnType<typeof queryHabitsWithDaysAccomplished>>
>;

export type Habit = HabitsWithDaysAccomplished["habits"][number];

export async function queryToday(client: VercelClient) {
  const {
    rows: [{ today }],
  } = await client.sql`SELECT EXTRACT(DOW from now())::int as "today"`;

  return sundayFirstToMondayFirst(today);
}

export async function queryHabitLogsThisWeek(client: VercelClient) {
  const { rows: habitLogsThisWeek } = (await client.sql`
      SELECT 
        habit_logs.habit_id as habit_id, 
        EXTRACT(DOW from habit_logs.timestamp)::int as "day_int"
      FROM
          habits
      JOIN
          habit_logs
      ON
          habits.id = habit_logs.habit_id
      WHERE
          date_trunc('day', habit_logs.timestamp) >= date_trunc('week', now()) AND
          date_trunc('day', habit_logs.timestamp) < date_trunc('week', now()) + INTERVAL '7 days'
      GROUP BY
          habit_id, "day_int"
    `) as { rows: { habit_id: number; day_int: number }[] };

  return habitLogsThisWeek.map(({ habit_id, day_int }) => ({
    habit_id,
    day_int: sundayFirstToMondayFirst(day_int),
  }));
}

export async function queryHabitsWithDaysAccomplished() {
  let client: VercelClient | undefined;

  try {
    client = createClient();
    await client.connect();

    const habitLogsThisWeek = await queryHabitLogsThisWeek(client);

    const daysAccomplishedByHabitId = habitLogsThisWeek.reduce<
      Record<number, number[]>
    >((acc, habitLog) => {
      const { habit_id, day_int } = habitLog;
      acc[habit_id] ??= [];
      acc[habit_id].push(day_int);
      return acc;
    }, {});

    const { rows: habits } =
      (await client.sql`SELECT * from habits ORDER BY name`) as {
        rows: {
          id: number;
          name: string;
          image: string | null;
          weekly_goal: number;
        }[];
      };

    const habitsWithDaysAccomplished = habits.map((habit) => {
      const daysAccomplishedSet = new Set(daysAccomplishedByHabitId[habit.id]);
      const daysAccomplished = Array(7)
        .fill(undefined)
        .map((_, i) => daysAccomplishedSet.has(i)) as [
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean
      ];
      return {
        ...habit,
        days: daysAccomplished,
      };
    });

    const today = await queryToday(client);

    return {
      today,
      habits: habitsWithDaysAccomplished,
    };
  } catch (e) {
    throw e;
  } finally {
    waitUntil(
      new Promise((resolve) => {
        if (!client) return resolve(null);
        return client.end();
      })
    );
  }
}
