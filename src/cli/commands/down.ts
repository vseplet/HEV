import { Command } from "@cliffy/command";
import { isDaemonRunning, shutdownDaemon } from "@/shared/client.ts";

export const downCommand = new Command()
  .name("down")
  .description("Stop the daemon")
  .action(async () => {
    if (!(await isDaemonRunning())) {
      console.log("Daemon is not running");
      return;
    }

    console.log("Stopping daemon...");
    const success = await shutdownDaemon();

    if (success) {
      console.log("Daemon stopped");
    } else {
      console.error("Failed to stop daemon");
      Deno.exit(1);
    }
  });
