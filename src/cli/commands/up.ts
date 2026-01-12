import { Command } from "@cliffy/command";
import { isDaemonRunning } from "@/shared/client.ts";
import {
  DAEMON_HOST,
  DAEMON_PORT,
  findFreePort,
  isPortFree,
} from "@/shared/config.ts";

async function spawnDaemon(
  port: number,
): Promise<{ success: boolean; error?: string }> {
  const daemonUrl = new URL("../../daemon.ts", import.meta.url).href;
  const importMapUrl = new URL("../../../deno.json", import.meta.url).href;

  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-all", `--import-map=${importMapUrl}`, daemonUrl],
    env: { HEV_PORT: String(port) },
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  });

  const process = command.spawn();

  let stderrOutput = "";
  (async () => {
    const reader = process.stderr.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        stderrOutput += new TextDecoder().decode(value);
      }
    } catch {
      // ignore
    }
  })();

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 150));

    if (await isDaemonRunning()) {
      process.unref();
      return { success: true };
    }

    const status = await Promise.race([
      process.status.then((s) => s),
      new Promise<null>((r) => setTimeout(() => r(null), 50)),
    ]);

    if (status !== null && !status.success) {
      return {
        success: false,
        error: stderrOutput || `Exit code: ${status.code}`,
      };
    }
  }

  process.unref();
  return { success: false, error: stderrOutput || "Timeout waiting for daemon" };
}

export const upCommand = new Command()
  .name("up")
  .description("Start the daemon")
  .action(async () => {
    if (await isDaemonRunning()) {
      console.log(`Daemon is already running on ${DAEMON_HOST}:${DAEMON_PORT}`);
      return;
    }

    // Check if port is free, find alternative if not
    let port = DAEMON_PORT;
    if (!isPortFree(port)) {
      console.log(`Port ${port} is busy, finding free port...`);
      try {
        port = findFreePort(port + 1);
        console.log(`Using port ${port}`);
      } catch {
        console.error(`Port ${DAEMON_PORT} is busy and no free port found`);
        Deno.exit(1);
      }
    }

    console.log("Starting daemon...");
    const result = await spawnDaemon(port);

    if (result.success) {
      console.log(`Daemon started on ${DAEMON_HOST}:${port}`);
    } else {
      console.error("Failed to start daemon");
      if (result.error) {
        console.error(result.error);
      }
      Deno.exit(1);
    }
  });
