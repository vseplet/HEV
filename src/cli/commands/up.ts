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

  const denoPath = Deno.execPath();
  const shellCmd =
    `HEV_PORT=${port} nohup "${denoPath}" run --allow-all --import-map="${importMapUrl}" "${daemonUrl}" > /dev/null 2>&1 &`;

  const command = new Deno.Command("sh", {
    args: ["-c", shellCmd],
    stdin: "null",
    stdout: "null",
    stderr: "null",
  });

  const { code } = await command.output();
  if (code !== 0) {
    return { success: false, error: "Failed to spawn daemon process" };
  }

  // Wait for daemon to become responsive
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));

    if (await isDaemonRunning(port)) {
      return { success: true };
    }
  }

  return { success: false, error: "Timeout waiting for daemon to start" };
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
