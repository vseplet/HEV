import { Hono } from "hono";
import {
  getAllProcesses,
  getProcess,
  getProcessLogs,
  removeProcess,
  restartProcess,
  startProcess,
  stopProcess,
} from "@/daemon/processes.ts";

export function createApp(shutdown: () => void): Hono {
  const app = new Hono();

  app.get("/health", (c) => {
    return c.json({ status: "ok" });
  });

  app.post("/shutdown", (c) => {
    setTimeout(() => shutdown(), 100);
    return c.json({ status: "shutting down" });
  });

  // Process management
  app.get("/processes", async (c) => {
    return c.json(await getAllProcesses());
  });

  app.get("/processes/:id", async (c) => {
    const proc = await getProcess(c.req.param("id"));
    if (!proc) {
      return c.json({ error: "Process not found" }, 404);
    }
    return c.json(proc);
  });

  app.post("/processes", async (c) => {
    const body = await c.req.json();
    const { script, name, cwd } = body;

    if (!script) {
      return c.json({ error: "script is required" }, 400);
    }

    const proc = startProcess(script, name, cwd);
    return c.json(proc, 201);
  });

  app.post("/processes/:id/stop", (c) => {
    const id = c.req.param("id");
    const success = stopProcess(id);

    if (!success) {
      return c.json({ error: "Process not found or already stopped" }, 404);
    }

    return c.json({ status: "stopped" });
  });

  app.post("/processes/:id/restart", (c) => {
    const id = c.req.param("id");
    const proc = restartProcess(id);

    if (!proc) {
      return c.json({ error: "Process not found" }, 404);
    }

    return c.json(proc);
  });

  app.delete("/processes/:id", (c) => {
    const id = c.req.param("id");
    const success = removeProcess(id);

    if (!success) {
      return c.json({ error: "Process not found" }, 404);
    }

    return c.json({ status: "removed" });
  });

  app.get("/processes/:id/logs", (c) => {
    const id = c.req.param("id");
    const limit = parseInt(c.req.query("limit") || "100");
    const logs = getProcessLogs(id, limit);
    return c.json(logs);
  });

  return app;
}
