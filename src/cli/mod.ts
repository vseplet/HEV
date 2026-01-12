import { Command } from "@cliffy/command";
import { upCommand } from "@/cli/commands/up.ts";
import { downCommand } from "@/cli/commands/down.ts";
import { startCommand } from "@/cli/commands/start.ts";
import { stopCommand } from "@/cli/commands/stop.ts";
import { listCommand } from "@/cli/commands/list.ts";
import { restartCommand } from "@/cli/commands/restart.ts";

export const cli = new Command()
  .name("hev")
  .version("0.3.0")
  .description("Simple process manager")
  .action(function () {
    this.showHelp();
  })
  .command("up", upCommand)
  .command("down", downCommand)
  .command("start", startCommand)
  .command("stop", stopCommand)
  .command("restart", restartCommand)
  .command("list", listCommand);
