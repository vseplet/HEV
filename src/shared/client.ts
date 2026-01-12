import { DAEMON_URL } from "./config.ts";

export async function isDaemonRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${DAEMON_URL}/health`, {
      signal: AbortSignal.timeout(1000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function shutdownDaemon(): Promise<boolean> {
  try {
    const response = await fetch(`${DAEMON_URL}/shutdown`, {
      method: "POST",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
