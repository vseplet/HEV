import { Command } from "@cliffy/command";
import { isDaemonRunning, startProcessRequest } from "@/shared/client.ts";
import { resolve } from "@std/path";

export const startCommand = new Command()
  .name("start")
  .description("Start a process")
  .arguments("<script:string>")
  .option("-n, --name <name:string>", "Process name")
  .action(async (options, script) => {
    if (!(await isDaemonRunning())) {
      console.error("Daemon is not running. Run 'hev up' first.");
      Deno.exit(1);
    }

    const absoluteScript = resolve(Deno.cwd(), script);
    const cwd = Deno.cwd();

    const proc = await startProcessRequest(absoluteScript, options.name, cwd);

    if (!proc) {
      console.error("Failed to start process");
      Deno.exit(1);
    }

    console.log(`Started process [${proc.id}] ${proc.name} (pid: ${proc.pid})`);
  });
