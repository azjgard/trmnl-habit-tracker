import { NextRequest } from "next/server";
import { defineAuthenticatedRoute } from "../lib";
import { loadHabitsWithDaysAccomplished } from "@/app/backend/services/habit";
import { getDayMarkup } from "@/app/shared/services/habit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

export const GET = defineAuthenticatedRoute(async (_request: NextRequest) => {
  const data = await loadHabitsWithDaysAccomplished();
  if (data) {
    const ReactDOMServer = (await import("react-dom/server")).default;
    return Response.json({
      ...data,
      // at this point we may be introducing 3 different timezones (trmnl server, browser client,
      // vercel server), but don't care enough to reconcile them at the moment
      weekString: `Week of ${getMonday().toLocaleDateString()}`,
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
