import { NextRequest } from "next/server";
import { defineAuthenticatedRoute } from "../lib";
import { loadHabitsWithDaysAccomplished } from "@/app/backend/services/habit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = defineAuthenticatedRoute(async (_request: NextRequest) => {
  const habitsWithDaysAccomplished = await loadHabitsWithDaysAccomplished();
  if (habitsWithDaysAccomplished) {
    return Response.json({
      ...habitsWithDaysAccomplished,
      testHtml: '<h1 style="color:red; font-size:50px;">Test</h1>',
    });
  }

  return new Response("Failed to load habits", { status: 500 });
});
