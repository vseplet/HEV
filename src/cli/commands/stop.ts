import { Command } from "@cliffy/command";
import { isDaemonRunning, stopProcessRequest } from "@/shared/client.ts";

export const stopCommand = new Command()
  .name("stop")
  .description("Stop a process")
  .arguments("<id:string>")
  .action(async (_options, id) => {
    if (!(await isDaemonRunning())) {
      console.error("Daemon is not running. Run 'hev up' first.");
      Deno.exit(1);
    }

    const success = await stopProcessRequest(id);

    if (!success) {
      console.error(`Failed to stop process ${id}`);
      Deno.exit(1);
    }

    console.log(`Stopped process ${id}`);
  });
