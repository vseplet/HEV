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

interface ManagedProcess {
  info: ProcessInfo;
  handle: Deno.ChildProcess;
  autoRestart: boolean;
}

const processes = new Map<string, ManagedProcess>();
let idCounter = 0;
let monitorInterval: number | null = null;

function generateId(): string {
  return String(idCounter++);
}

async function isProcessAlive(pid: number): Promise<boolean> {
  try {
    const command = new Deno.Command("ps", {
      args: ["-p", String(pid)],
      stdout: "null",
      stderr: "null",
    });
    const { success } = await command.output();
    return success;
  } catch {
    return false;
  }
}

function spawnProcess(script: string, cwd: string): Deno.ChildProcess {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-all", script],
    cwd,
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  });
  return command.spawn();
}

async function checkAndRestartProcesses(): Promise<void> {
  for (const [id, proc] of processes.entries()) {
    if (proc.info.status !== "running") continue;

    const alive = await isProcessAlive(proc.info.pid);

    if (!alive) {
      if (proc.autoRestart) {
        // Auto-restart
        proc.info.restarts++;
        const newHandle = spawnProcess(proc.info.script, proc.info.cwd);
        proc.handle = newHandle;
        proc.info.pid = newHandle.pid;
        proc.info.status = "running";
        console.log(`[hev] Restarted process ${id} (${proc.info.name})`);
      } else {
        proc.info.status = "stopped";
      }
    }
  }
}

export function startMonitor(): void {
  if (monitorInterval) return;
  monitorInterval = setInterval(checkAndRestartProcesses, 2000);
}

export function stopMonitor(): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
}

export function startProcess(
  script: string,
  name?: string,
  cwd?: string,
  autoRestart = true,
): ProcessInfo {
  const id = generateId();
  const processName = name || `app-${id}`;
  const workingDir = cwd || Deno.cwd();

  const handle = spawnProcess(script, workingDir);

  const info: ProcessInfo = {
    id,
    name: processName,
    script,
    pid: handle.pid,
    status: "running",
    startedAt: Date.now(),
    restarts: 0,
    cwd: workingDir,
  };

  const managed: ManagedProcess = { info, handle, autoRestart };
  processes.set(id, managed);

  // Start monitor if not running
  startMonitor();

  return info;
}

export async function getProcess(id: string): Promise<ProcessInfo | undefined> {
  const proc = processes.get(id);
  if (!proc) return undefined;

  if (proc.info.status === "running") {
    const alive = await isProcessAlive(proc.info.pid);
    if (!alive && !proc.autoRestart) {
      proc.info.status = "stopped";
    }
  }

  return proc.info;
}

export async function getAllProcesses(): Promise<ProcessInfo[]> {
  // Refresh statuses
  for (const proc of processes.values()) {
    if (proc.info.status === "running") {
      const alive = await isProcessAlive(proc.info.pid);
      if (!alive && !proc.autoRestart) {
        proc.info.status = "stopped";
      }
    }
  }
  return Array.from(processes.values()).map((p) => p.info);
}

export function stopProcess(id: string): boolean {
  const proc = processes.get(id);
  if (!proc) return false;

  proc.autoRestart = false;

  try {
    proc.handle.kill("SIGTERM");
    proc.info.status = "stopped";
    return true;
  } catch {
    return false;
  }
}

export function removeProcess(id: string): boolean {
  const proc = processes.get(id);
  if (!proc) return false;

  if (proc.info.status === "running") {
    stopProcess(id);
  }

  processes.delete(id);
  return true;
}

export function restartProcess(id: string): ProcessInfo | null {
  const proc = processes.get(id);
  if (!proc) return null;

  // Kill current process
  try {
    proc.handle.kill("SIGTERM");
  } catch {
    // Ignore
  }

  // Start new process
  const newHandle = spawnProcess(proc.info.script, proc.info.cwd);
  proc.handle = newHandle;
  proc.info.pid = newHandle.pid;
  proc.info.status = "running";
  proc.info.restarts++;
  proc.autoRestart = true;

  return proc.info;
}
