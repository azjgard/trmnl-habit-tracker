import { NextRequest } from "next/server";

export function validateInstancePassword(
  instancePassword: string | null | undefined
) {
  const instancePasswordFromEnv = process.env.INSTANCE_PASSWORD;
  if (!instancePasswordFromEnv) {
    return;
  }

  if (
    !(instancePassword && instancePassword === process.env.INSTANCE_PASSWORD)
  ) {
    throw new Error("Instance password required");
  }
}

export function defineAuthenticatedRoute(
  handler: (request: NextRequest) => Promise<Response> | Response
) {
  return (request: NextRequest) => {
    const instancePassword = request.headers.get("x-instance-password");
    try {
      validateInstancePassword(instancePassword);
      return handler(request);
    } catch (e) {
      const msg = `Invalid instance password '${instancePassword}' in authenticated route`;
      console.error(msg, e);
      return new Response("Instance password required", { status: 400 });
    }
  };
}
