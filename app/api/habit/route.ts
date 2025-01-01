import { waitUntil } from "@vercel/functions";
import { createClient, VercelClient } from "@vercel/postgres";
import { NextRequest } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { defineAuthenticatedRoute } from "../lib";
import { loadHabitsWithDaysAccomplished } from "@/app/backend/services/habit";

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
      }),
    );
  }
});

type UpdateBody = Partial<{
  id: number;
  name: string;
  image: string;
  weekly_goal: number;
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
      } = await client.sql`SELECT * from habits WHERE id = ${body.id}`;

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

      // there will never be more than a handful of habits so we can just
      // reload all of them
      const habits = await loadHabitsWithDaysAccomplished();

      return new Response(JSON.stringify(habits));
    }

    // there will never be more than a handful of habits so we can just
    // reload all of them
    const habits = await loadHabitsWithDaysAccomplished();

    return new Response(JSON.stringify(habits));
  } catch (e) {
    console.error(e);
    return new Response();
  } finally {
    waitUntil(
      new Promise((resolve) => {
        if (!client) return resolve(null);
        return client.end();
      }),
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
      }),
    );
  }
});
