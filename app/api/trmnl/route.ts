import { NextRequest } from "next/server";
import { defineAuthenticatedRoute } from "../lib";
import { loadHabitsWithDaysAccomplished } from "@/app/backend/services/habit";
import { getDayMarkup } from "@/app/shared/services/habit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = defineAuthenticatedRoute(async (_request: NextRequest) => {
  const data = await loadHabitsWithDaysAccomplished();
  if (data) {
    const ReactDOMServer = (await import("react-dom/server")).default;
    return Response.json({
      ...data,
      habits: data.habits.map((habit) => {
        return {
          ...habit,
          days: habit.days.map((accomplished, day) => {
            return ReactDOMServer.renderToStaticMarkup(
              getDayMarkup(
                day,
                accomplished,
                day < data.today,
                day === data.today
              )
            );
          }),
        };
      }),
    });
  }

  return new Response("Failed to load habits", { status: 500 });
});
