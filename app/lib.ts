export function getInstancePasswordHeaders(): Record<string, string> {
  if (!window) {
    throw new Error("This function can only be called in the browser");
  }

  if (!window.location.search.includes("ip=")) {
    return {};
  }

  const instancePassword =
    window.location.search.split("ip=")[1]?.split("&")[0] ?? null;
  if (!instancePassword) {
    return {};
  }

  return {
    "x-instance-password": instancePassword,
  };
}
