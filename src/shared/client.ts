import { DAEMON_HOST, DAEMON_URL } from "@/shared/config.ts";

export interface ProcessInfo {
  id: string;
  name: string;
  script: string;
  pid: number;
  status: "running" | "stopped" | "errored";
  startedAt: number;
  restarts: number;
  cwd: string;
}

export async function isDaemonRunning(port?: number): Promise<boolean> {
  try {
    const url = port
      ? `http://${DAEMON_HOST}:${port}/health`
      : `${DAEMON_URL}/health`;
    const response = await fetch(url, {
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

export async function startProcessRequest(
  script: string,
  name?: string,
  cwd?: string,
): Promise<ProcessInfo | null> {
  try {
    const response = await fetch(`${DAEMON_URL}/processes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script, name, cwd }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function stopProcessRequest(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${DAEMON_URL}/processes/${id}/stop`, {
      method: "POST",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function restartProcessRequest(
  id: string,
): Promise<ProcessInfo | null> {
  try {
    const response = await fetch(`${DAEMON_URL}/processes/${id}/restart`, {
      method: "POST",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function listProcesses(): Promise<ProcessInfo[]> {
  try {
    const response = await fetch(`${DAEMON_URL}/processes`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function deleteProcessRequest(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${DAEMON_URL}/processes/${id}`, {
      method: "DELETE",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export interface LogEntry {
  timestamp: number;
  type: "stdout" | "stderr";
  text: string;
}

export async function getProcessLogs(
  id: string,
  limit = 100,
): Promise<LogEntry[]> {
  try {
    const response = await fetch(
      `${DAEMON_URL}/processes/${id}/logs?limit=${limit}`,
      {
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}
