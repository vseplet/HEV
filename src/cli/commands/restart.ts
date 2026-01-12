import { Command } from "@cliffy/command";
import { isDaemonRunning, restartProcessRequest } from "@/shared/client.ts";

export const restartCommand = new Command()
  .name("restart")
  .description("Restart a process")
  .arguments("<id:string>")
  .action(async (_options, id) => {
    if (!(await isDaemonRunning())) {
      console.error("Daemon is not running. Run 'hev up' first.");
      Deno.exit(1);
    }

    const proc = await restartProcessRequest(id);

    if (!proc) {
      console.error(`Failed to restart process ${id}`);
      Deno.exit(1);
    }

    console.log(
      `Restarted process [${proc.id}] ${proc.name} (pid: ${proc.pid})`,
    );
  });
