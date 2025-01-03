import { waitUntil } from "@vercel/functions";
import { createClient, VercelClient } from "@vercel/postgres";
import { NextRequest } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { defineAuthenticatedRoute } from "../lib";
import {
  Habit,
  queryHabitLogsThisWeek,
  queryHabitsWithDaysAccomplished,
  queryToday,
} from "@/app/backend/services/habit";

export const GET = defineAuthenticatedRoute(async (_request: NextRequest) => {
  let client: VercelClient | undefined;

  try {
    client = createClient();
    await client.connect();

    const { rows: habits } = await client.sql`SELECT * from habits`;

    return new Response(JSON.stringify(habits));
  } catch (e) {
    console.error(e);
    return new Response();
  } finally {
    waitUntil(
      new Promise((resolve) => {
        if (!client) return resolve(null);
        return client.end();
      })
    );
  }
});

type UpdateBody = Partial<{
  id: number;
  name: string;
  image: string;
  weekly_goal: number;
  days: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
}>;

export const PUT = defineAuthenticatedRoute(async (request: NextRequest) => {
  let client: VercelClient | undefined;

  try {
    client = createClient();
    await client.connect();

    const body: UpdateBody = await request.json();

    if (body.id) {
      const {
        rows: [existingHabit],
      } = (await client.sql`SELECT * from habits WHERE id = ${body.id}`) as {
        rows: Omit<Habit, "days">[];
      };

      const name = body.name ?? existingHabit.name;
      const image = body.image !== undefined ? body.image : existingHabit.image;
      const weekly_goal = body.weekly_goal ?? existingHabit.weekly_goal;

      await client.sql`
        UPDATE habits
        SET name = ${name},
            image = ${image},
            weekly_goal = ${weekly_goal}
        WHERE id = ${body.id}
      `;

      if (body.days?.length !== 7) {
        throw new Error("Malformed `days` array on habit update request");
      }

      // could do most of this at db level but bruting in memory is fine
      // since dataset is so small
      if (body.days) {
        const existingHabitLogsThisWeekByDayIndex = new Set(
          (await queryHabitLogsThisWeek(client))
            .filter((log) => log.habit_id === body.id)
            .map((log) => log.day_int)
        );

        const todayIndex = await queryToday(client);

        const dayIndicesToAdd = body.days
          .map((day, dayIndex) =>
            day === true && !existingHabitLogsThisWeekByDayIndex.has(dayIndex)
              ? dayIndex
              : null
          )
          .filter((i): i is number => i !== null);

        if (dayIndicesToAdd.length) {
          // note: want to use .query() here to get more flexibility with building the query itself
          // while still parameterizing the values
          const preparedQuery = `
          INSERT INTO 
            habit_logs (habit_id, timestamp)
          VALUES 
            ${dayIndicesToAdd.map((dayIndex) => {
              const difference = dayIndex - todayIndex;
              return `(${body.id}, date_trunc('day', now()) + INTERVAL '${difference} days')`;
            })};`;

          // sql injection should be fine ;)
          await client.query(preparedQuery, []);
        }

        const dayIndicesToDelete = body.days
          .map((day, dayIndex) =>
            day === false && existingHabitLogsThisWeekByDayIndex.has(dayIndex)
              ? dayIndex
              : null
          )
          .filter((i): i is number => i !== null);

        if (dayIndicesToDelete.length) {
          const preparedQuery = `
          DELETE FROM 
            habit_logs 
          WHERE 
            habit_id = ${body.id} AND 
            date_trunc('day', timestamp) IN (
            ${dayIndicesToDelete
              .map((dayIndex, i, arr) => {
                const difference = dayIndex - todayIndex;
                return `date_trunc('day', now()) + INTERVAL '${difference} days'${
                  i === arr.length - 1 ? "" : ","
                }`;
              })
              .join("")}
            );
        `;
          await client.query(preparedQuery, []);
        }
      }

      // there will never be more than a handful of habits so we can just
      // reload all of them
      const habits = await queryHabitsWithDaysAccomplished();

      return new Response(JSON.stringify(habits));
    }

    await client.sql`
      INSERT INTO habits (name, image, weekly_goal)
      VALUES (${body.name}, ${body.image}, ${body.weekly_goal})
    `;

    // there will never be more than a handful of habits so we can just
    // reload all of them
    const habits = await queryHabitsWithDaysAccomplished();

    return new Response(JSON.stringify(habits));
  } catch (e) {
    console.error(e);
    return new Response();
  } finally {
    waitUntil(
      new Promise((resolve) => {
        if (!client) return resolve(null);
        return client.end();
      })
    );
  }
});

type DeleteBody = { id: number };

export const DELETE = defineAuthenticatedRoute(async (request: NextRequest) => {
  let client: VercelClient | undefined;

  try {
    client = createClient();
    await client.connect();

    const body: DeleteBody = await request.json();

    await client.sql`DELETE from habits WHERE id = ${body.id}`;

    return new Response();
  } catch (e) {
    console.error(e);
    return new Response();
  } finally {
    waitUntil(
      new Promise((resolve) => {
        if (!client) return resolve(null);
        return client.end();
      })
    );
  }
});
