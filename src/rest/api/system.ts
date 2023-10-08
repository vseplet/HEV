import { Router } from "../../../deps.ts";

export const systemRouter = new Router().get("/", (context) => {
  context.response.body = {
    systemMemoryInfo: Deno.systemMemoryInfo(),
    hardwareConcurrency: navigator.hardwareConcurrency,
    arch: Deno.build.arch,
    hostname: Deno.hostname(),
    os: Deno.build.os,
    timestamp: new Date().getTime(),
  };
});
