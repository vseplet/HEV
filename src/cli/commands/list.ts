import { Command } from "@cliffy/command";
import { isDaemonRunning, listProcesses } from "@/shared/client.ts";

export const listCommand = new Command()
  .name("list")
  .alias("ls")
  .description("List all processes")
  .action(async () => {
    if (!(await isDaemonRunning())) {
      console.error("Daemon is not running. Run 'hev up' first.");
      Deno.exit(1);
    }

    const processes = await listProcesses();

    if (processes.length === 0) {
      console.log("No processes running");
      return;
    }

    console.log(
      "ID\tNAME\t\tSTATUS\t\tPID\tRESTARTS",
    );
    console.log("-".repeat(60));

    for (const p of processes) {
      console.log(
        `${p.id}\t${p.name}\t\t${p.status}\t\t${p.pid}\t${p.restarts}`,
      );
    }
  });
