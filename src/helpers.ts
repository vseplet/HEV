import { sh } from "../deps.ts";

export const deno_run = (args: Array<string>) => {
  const command = new Deno.Command(Deno.execPath(), {
    args,
  });

  return command.spawn();
};

export const get_process_port = async (pid: number) => {
  try {
    const res = await sh(`lsof -i -P -n | grep LISTEN | grep ${pid}`);
    console.log(res.stdout);
    const portRegex = /TCP \S+:(\d+) \(LISTEN\)/;
    const match = res.stdout.match(portRegex);

    if (match) {
      const portNumber = parseInt(match[1]);
      console.log("Port Number:", portNumber);
      return portNumber;
    } else {
      console.log("Port Number not found");
      return -1;
    }
  } catch (e) {
    console.error(e);
    return -1;
  }
};
