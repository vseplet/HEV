import { Command } from "@cliffy/command";
import { isDaemonRunning } from "@/shared/client.ts";
import { DAEMON_HOST, DAEMON_PORT } from "@/shared/config.ts";

function spawnDaemon(): void {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["task", "daemon"],
    cwd: Deno.cwd(),
    stdin: "null",
    stdout: "null",
    stderr: "null",
  });

  const process = command.spawn();
  process.unref();
}

export const upCommand = new Command()
  .name("up")
  .description("Start the daemon")
  .action(async () => {
    if (await isDaemonRunning()) {
      console.log(`Daemon is already running on ${DAEMON_HOST}:${DAEMON_PORT}`);
      return;
    }

    console.log("Starting daemon...");
    spawnDaemon();

    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 200));
      if (await isDaemonRunning()) {
        console.log(`Daemon started on ${DAEMON_HOST}:${DAEMON_PORT}`);
        return;
      }
    }

    console.error("Failed to start daemon");
    Deno.exit(1);
  });
