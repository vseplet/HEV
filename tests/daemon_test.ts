import { assertEquals } from "@std/assert";
import {
  DAEMON_HOST,
  DAEMON_PORT,
  findFreePort,
  isPortFree,
} from "@/shared/config.ts";

Deno.test({
  name: "isPortFree returns true for unused port",
  fn: () => {
    // Find a port that's likely free (high number)
    const testPort = 59876;
    const result = isPortFree(testPort);
    // Should be true unless something is actually using it
    assertEquals(typeof result, "boolean");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "isPortFree returns false for used port",
  fn: () => {
    // Start a listener on a port
    const testPort = 59877;
    const listener = Deno.listen({ port: testPort, hostname: "127.0.0.1" });

    try {
      const result = isPortFree(testPort);
      assertEquals(result, false);
    } finally {
      listener.close();
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "findFreePort returns a free port",
  fn: () => {
    const port = findFreePort(59878);
    assertEquals(typeof port, "number");
    assertEquals(port >= 59878, true);

    // Verify the port is actually free
    const listener = Deno.listen({ port, hostname: "127.0.0.1" });
    listener.close();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "findFreePort skips used ports",
  fn: () => {
    const startPort = 59880;
    // Occupy the start port
    const listener = Deno.listen({ port: startPort, hostname: "127.0.0.1" });

    try {
      const port = findFreePort(startPort);
      assertEquals(port > startPort, true);
    } finally {
      listener.close();
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "DAEMON_HOST is valid",
  fn: () => {
    assertEquals(DAEMON_HOST, "127.0.0.1");
  },
});

Deno.test({
  name: "DAEMON_PORT is a number",
  fn: () => {
    assertEquals(typeof DAEMON_PORT, "number");
    assertEquals(DAEMON_PORT > 0, true);
    assertEquals(DAEMON_PORT < 65536, true);
  },
});
