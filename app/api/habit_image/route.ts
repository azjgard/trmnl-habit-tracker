import { NextRequest } from "next/server";
import { v4 } from "uuid";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { put } from "@vercel/blob";

export async function PUT(request: NextRequest) {
  const body = await request.formData();
  const image = body.get("image");
  if (!image) {
    return new Response("No image provided", { status: 400 });
  }

  const { url } = await put(`habit_images/${v4()}`, image, {
    access: "public",
  });

  return new Response(url);
}
