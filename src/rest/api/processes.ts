import { Router } from "../../../deps.ts";
import { processes } from "../../global.ts";

export const processesRouter = new Router()
  .get("/", (context) => {
    context.response.body = processes;
  })
  .get("/:id", (context) => {
    context.response.body = processes[context.params.id];
  })
  .get("/:id/stdout", (context) => {
    context.response.body = processes[context.params.id];
  })
  .get("/:id/stderr", (context) => {
    context.response.body = processes[context.params.id];
  })
  .post("/:id/kill", (context) => {
    processes[context.params.id].process.kill();
    delete processes[context.params.id];
    context.response.body = {
      ok: true,
    };
  })
  .post("/:id/sleep", async (context) => {
    context.response.body = "ok";
  })
  .post("/:id/restart", async (context) => {
    context.response.body = "ok";
  })
  .post("/:id/wake", async (context) => {
    context.response.body = "ok";
  });
