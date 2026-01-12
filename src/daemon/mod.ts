import { DAEMON_HOST, DAEMON_PORT } from "@/shared/config.ts";
import { createApp } from "@/daemon/api.ts";

export async function startDaemon(): Promise<void> {
  const controller = new AbortController();

  const app = createApp(() => {
    controller.abort();
  });

  console.log(`Daemon starting on ${DAEMON_HOST}:${DAEMON_PORT}`);

  await Deno.serve({
    hostname: DAEMON_HOST,
    port: DAEMON_PORT,
    signal: controller.signal,
    onListen: () => {},
  }, app.fetch).finished;

  console.log("Daemon stopped");
}
