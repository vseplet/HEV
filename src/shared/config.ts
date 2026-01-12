export const DAEMON_HOST = "127.0.0.1";
export const DAEMON_PORT = parseInt(Deno.env.get("HEV_PORT") || "9876");
export const DAEMON_URL = `http://${DAEMON_HOST}:${DAEMON_PORT}`;

export function isPortFree(port: number): boolean {
  try {
    const listener = Deno.listen({ port, hostname: DAEMON_HOST });
    listener.close();
    return true;
  } catch {
    return false;
  }
}

export function findFreePort(startPort: number = DAEMON_PORT): number {
  for (let port = startPort; port < startPort + 100; port++) {
    if (isPortFree(port)) {
      return port;
    }
  }
  throw new Error("No free port found");
}
