import { NextRequest } from "next/server";

export function validateInstancePassword(
  instancePassword: string | null | undefined
) {
  const instancePasswordFromEnv = process.env.INSTANCE_PASSWORD;
  if (!instancePasswordFromEnv) {
    return;
  }

  console.log({ instancePassword });

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
    validateInstancePassword(request.headers.get("x-instance-password"));
    return handler(request);
  };
}
