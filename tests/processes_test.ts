import { assertEquals, assertExists } from "@std/assert";
import {
  getAllProcesses,
  getProcess,
  removeProcess,
  restartProcess,
  startProcess,
  stopMonitor,
  stopProcess,
} from "@/daemon/processes.ts";

const TEST_SCRIPT = `
  console.log("Test process started");
  setInterval(() => {}, 1000);
`;

async function createTestScript(): Promise<string> {
  const path = await Deno.makeTempFile({ suffix: ".ts" });
  await Deno.writeTextFile(path, TEST_SCRIPT);
  return path;
}

Deno.test({
  name: "startProcess creates a new process",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const script = await createTestScript();

    const proc = startProcess(script, "test-proc");

    assertExists(proc.id);
    assertEquals(proc.name, "test-proc");
    assertEquals(proc.status, "running");
    assertExists(proc.pid);

    stopProcess(proc.id);
    removeProcess(proc.id);
    stopMonitor();
    await Deno.remove(script);
  },
});

Deno.test({
  name: "getProcess returns process info",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const script = await createTestScript();

    const proc = startProcess(script, "test-get");
    const fetched = await getProcess(proc.id);

    assertExists(fetched);
    assertEquals(fetched?.id, proc.id);
    assertEquals(fetched?.name, "test-get");

    stopProcess(proc.id);
    removeProcess(proc.id);
    stopMonitor();
    await Deno.remove(script);
  },
});

Deno.test({
  name: "getAllProcesses returns all processes",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const script = await createTestScript();

    const proc1 = startProcess(script, "test-all-1");
    const proc2 = startProcess(script, "test-all-2");

    const all = await getAllProcesses();

    assertEquals(all.length >= 2, true);

    stopProcess(proc1.id);
    stopProcess(proc2.id);
    removeProcess(proc1.id);
    removeProcess(proc2.id);
    stopMonitor();
    await Deno.remove(script);
  },
});

Deno.test({
  name: "stopProcess stops a running process",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const script = await createTestScript();

    const proc = startProcess(script, "test-stop");
    assertEquals(proc.status, "running");

    const success = stopProcess(proc.id);
    assertEquals(success, true);

    await new Promise((r) => setTimeout(r, 100));

    const fetched = await getProcess(proc.id);
    assertEquals(fetched?.status, "stopped");

    removeProcess(proc.id);
    stopMonitor();
    await Deno.remove(script);
  },
});

Deno.test({
  name: "restartProcess restarts a process",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const script = await createTestScript();

    const proc = startProcess(script, "test-restart");
    const originalPid = proc.pid;

    const restarted = restartProcess(proc.id);

    assertExists(restarted);
    assertEquals(restarted?.restarts, 1);
    assertEquals(restarted?.pid !== originalPid, true);

    stopProcess(proc.id);
    removeProcess(proc.id);
    stopMonitor();
    await Deno.remove(script);
  },
});

Deno.test({
  name: "removeProcess removes a process",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const script = await createTestScript();

    const proc = startProcess(script, "test-remove");
    const success = removeProcess(proc.id);

    assertEquals(success, true);

    const fetched = await getProcess(proc.id);
    assertEquals(fetched, undefined);

    stopMonitor();
    await Deno.remove(script);
  },
});
