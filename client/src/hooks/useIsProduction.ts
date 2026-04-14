export function useAppEnv() {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";

  if (hostname === "demo.eeseemetrics.com") {
    return "demo";
  }
  if (hostname === "app.eeseemetrics.com") {
    return "prod";
  }

  return null;
}
