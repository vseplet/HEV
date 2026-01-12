import { Command } from "@cliffy/command";
import { upCommand } from "@/cli/commands/up.ts";
import { downCommand } from "@/cli/commands/down.ts";

export const cli = new Command()
  .name("hev")
  .version("0.2.0")
  .description("Simple process manager")
  .action(function () {
    this.showHelp();
  })
  .command("up", upCommand)
  .command("down", downCommand);
