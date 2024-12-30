import { NextRequest } from "next/server";
import { createClient, VercelClient } from "@vercel/postgres";
import { waitUntil } from "@vercel/functions";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sundayFirstToMondayFirst(day: number) {
  return (day + 6) % 7;
}

export async function GET(_request: NextRequest) {
  let client: VercelClient | undefined;

  try {
    client = createClient();
    await client.connect();

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

    const daysAccomplishedByHabitId = habitLogsThisWeek.reduce<
      Record<number, number[]>
    >((acc, habitLog) => {
      const { habit_id, day_int } = habitLog;
      acc[habit_id] ??= [];
      acc[habit_id].push(sundayFirstToMondayFirst(day_int));
      return acc;
    }, {});

    const { rows: habits } = (await client.sql`SELECT * from habits`) as {
      rows: { id: number; name: string; image: string }[];
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

    const {
      rows: [{ today }],
    } = await client.sql`SELECT EXTRACT(DOW from now())::int as "today"`;

    return new Response(
      JSON.stringify({
        today: sundayFirstToMondayFirst(today),
        habits: habitsWithDaysAccomplished,
      })
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ habits: [] }));
  } finally {
    waitUntil(
      new Promise((resolve) => {
        if (!client) return resolve(null);
        return client.end();
      })
    );
  }
}
