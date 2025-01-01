import { NextRequest } from "next/server";
import { defineAuthenticatedRoute } from "../lib";
import { loadHabitsWithDaysAccomplished } from "@/app/backend/services/habit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = defineAuthenticatedRoute(async (_request: NextRequest) => {
  const habitsWithDaysAccomplished = await loadHabitsWithDaysAccomplished();
  if (habitsWithDaysAccomplished) {
    return new Response(JSON.stringify(habitsWithDaysAccomplished));
  }

  return new Response("Failed to load habits", { status: 500 });
});
