/// <reference lib="deno.unstable" />
import { Application, Router } from "../../deps.ts";
import { isolatesRouter } from "./api/isolates.ts";
import { processesRouter } from "./api/processes.ts";
import { systemRouter } from "./api/system.ts";
import { forwardRouter } from "./forward.ts";

const router = new Router()
  .use(
    "/api",
    new Router()
      .use(
        "/isolates",
        isolatesRouter.routes(),
      )
      .use(
        "/processes",
        processesRouter
          .routes(),
      )
      .use(
        "/system",
        systemRouter.routes(),
      )
      .routes(),
  )
  .use(
    "/fw",
    forwardRouter.routes(),
  );

export const rest = async () => {
  const app = new Application();
  app.use(router.routes());

  await app.listen({ port: 8000 });
};
