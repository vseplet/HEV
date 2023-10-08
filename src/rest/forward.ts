import { Router } from "../../deps.ts";
import { kv, processes } from "../global.ts";
import { deno_run, get_process_port } from "../helpers.ts";
import { IsolateEntity } from "../interfaces.ts";

export const forwardRouter = new Router()
  .all("/:id/:path*", async (context) => {
    const uuid = context.params.id;
    const path = context.params.path;
    const isolate =
      (await kv.get<IsolateEntity>(["isolates", context.params.id])).value;
    if (!isolate) {
      context.response.status = 404;
      context.response.body = {
        ok: false,
        message: "isolate not found",
      };
      return;
    }
    if (!(uuid in processes)) {
      const process = await deno_run([
        "run",
        "--allow-all",
        isolate.url,
      ]);

      processes[uuid] = {
        last_request_timestamp: -1,
        port: await get_process_port(process.pid),
        process,
      };
    }

    const url = `http://localhost:${processes[uuid].port}/${path}`;

    const response = await fetch(url, {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.hasBody
        ? await context.request.body().value
        : undefined,
    });

    context.response.status = response.status;
    context.response.headers = new Headers(response.headers);

    const body = new Uint8Array(await response.arrayBuffer());
    context.response.body = body;

    processes[uuid].last_request_timestamp = new Date().getTime();
  });
