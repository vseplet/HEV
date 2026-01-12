import { Hono } from "hono";

export function createApp(shutdown: () => void): Hono {
  const app = new Hono();

  app.get("/health", (c) => {
    return c.json({ status: "ok" });
  });

  app.post("/shutdown", (c) => {
    setTimeout(() => shutdown(), 100);
    return c.json({ status: "shutting down" });
  });

  return app;
}
