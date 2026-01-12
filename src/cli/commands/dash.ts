import { Command } from "@cliffy/command";
import {
  basic,
  component,
  html,
  meta,
  Morph,
  type MorphCSS,
  type MorphTemplate,
  rpc,
  styled,
} from "@vseplet/morph";
import {
  deleteProcessRequest,
  getProcessLogs,
  isDaemonRunning,
  listProcesses,
  type LogEntry,
  type ProcessInfo,
  restartProcessRequest,
  startProcessRequest,
  stopProcessRequest,
} from "@/shared/client.ts";
import { DAEMON_HOST, DAEMON_PORT } from "@/shared/config.ts";

// Styles
const containerStyles = styled`
  background: #0d1117;
  color: #c9d1d9;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  padding: 24px;
  margin: 0;
`;

const headerStyles = styled`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #30363d;
`;

const titleStyles = styled`
  color: #58a6ff;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const badgeStyles = styled`
  background: #238636;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
`;

const badgeErrorStyles = styled`
  background: #f85149;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
`;

const cardStyles = styled`
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
`;

const tableStyles = styled`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const thStyles = styled`
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #30363d;
  color: #8b949e;
  font-weight: 500;
`;

const tdStyles = styled`
  padding: 12px;
  border-bottom: 1px solid #21262d;
  color: #c9d1d9;
`;

const statusRunning = styled`
  color: #7ee787;
  font-weight: 500;
`;

const statusStopped = styled`
  color: #8b949e;
  font-weight: 500;
`;

const statusErrored = styled`
  color: #f85149;
  font-weight: 500;
`;

const btnStyles = styled`
  background: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 4px;
  &:hover { background: #30363d; }
`;

const btnDangerStyles = styled`
  background: #21262d;
  color: #f85149;
  border: 1px solid #f85149;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 4px;
  &:hover { background: #f8514922; }
`;

const btnSuccessStyles = styled`
  background: #238636;
  color: #fff;
  border: 1px solid #238636;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  &:hover { background: #2ea043; }
`;

const inputStyles = styled`
  background: #0d1117;
  color: #c9d1d9;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #58a6ff;
  }
`;

const formGroupStyles = styled`
  margin-bottom: 16px;
`;

const labelStyles = styled`
  color: #8b949e;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 4px;
  display: block;
`;

const emptyStateStyles = styled`
  text-align: center;
  padding: 48px;
  color: #8b949e;
`;

const errorStyles = styled`
  background: #f8514922;
  border: 1px solid #f85149;
  color: #f85149;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
`;

const successStyles = styled`
  background: #23863622;
  border: 1px solid #238636;
  color: #7ee787;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
`;

const sectionTitleStyles = styled`
  color: #c9d1d9;
  font-size: 18px;
  margin: 24px 0 16px 0;
`;

const monoStyles = styled`
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
`;

const inlineFormStyles = styled`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const flexGrowStyles = styled`
  flex-grow: 1;
`;

const logsContainerStyles = styled`
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
`;

const logLineStyles = styled`
  padding: 2px 0;
  white-space: pre-wrap;
  word-break: break-all;
`;

const logStdoutStyles = styled`
  color: #c9d1d9;
`;

const logStderrStyles = styled`
  color: #f85149;
`;

const logTimestampStyles = styled`
  color: #6e7681;
  margin-right: 8px;
`;

const expandBtnStyles = styled`
  background: transparent;
  color: #58a6ff;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  &:hover { text-decoration: underline; }
`;

const processRowStyles = styled`
  border-bottom: 1px solid #21262d;
`;

// Helper functions
function formatUptime(startedAt: number): string {
  const seconds = Math.floor((Date.now() - startedAt) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

function formatLogTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-US", { hour12: false });
}

function renderLogs(logs: LogEntry[]): MorphTemplate {
  if (logs.length === 0) {
    return html`<div style="color: #6e7681;">No logs yet</div>`;
  }

  return html`
    ${logs.map(
      (log) => html`
        <div class="${logLineStyles} ${log.type === "stderr" ? logStderrStyles : logStdoutStyles}">
          <span class="${logTimestampStyles}">${formatLogTime(log.timestamp)}</span>${log.text}
        </div>
      `,
    )}
  `;
}

function getStatusStyle(status: string): MorphCSS {
  switch (status) {
    case "running":
      return statusRunning;
    case "stopped":
      return statusStopped;
    case "errored":
      return statusErrored;
    default:
      return statusStopped;
  }
}

// RPC handlers
const logsApi = rpc({
  get: async (_req, args: { id: string }): Promise<MorphTemplate> => {
    const logs = await getProcessLogs(args.id, 200);
    return html`
      <div class="${logsContainerStyles}" id="logs-content-${args.id}">
        ${renderLogs(logs)}
      </div>
    `;
  },
});

const processApi = rpc({
  list: async (): Promise<MorphTemplate> => {
    const processes = await listProcesses();
    return renderProcessTable(processes);
  },
  start: async (
    _req,
    args: { script: string; name?: string },
  ): Promise<MorphTemplate> => {
    const result = await startProcessRequest(
      args.script,
      args.name || undefined,
    );
    if (!result) {
      const processes = await listProcesses();
      return html`
        <div class="${errorStyles}">Failed to start process. Is daemon running?</div>
        ${renderProcessTable(processes)}
      `;
    }
    const processes = await listProcesses();
    return html`
      <div class="${successStyles}">Process "${result.name}" started (PID: ${result.pid})</div>
      ${renderProcessTable(processes)}
    `;
  },
  stop: async (_req, args: { id: string }): Promise<MorphTemplate> => {
    const success = await stopProcessRequest(args.id);
    const processes = await listProcesses();
    if (!success) {
      return html`
        <div class="${errorStyles}">Failed to stop process</div>
        ${renderProcessTable(processes)}
      `;
    }
    return html`
      <div class="${successStyles}">Process stopped</div>
      ${renderProcessTable(processes)}
    `;
  },
  restart: async (_req, args: { id: string }): Promise<MorphTemplate> => {
    const result = await restartProcessRequest(args.id);
    const processes = await listProcesses();
    if (!result) {
      return html`
        <div class="${errorStyles}">Failed to restart process</div>
        ${renderProcessTable(processes)}
      `;
    }
    return html`
      <div class="${successStyles}">Process restarted (PID: ${result.pid})</div>
      ${renderProcessTable(processes)}
    `;
  },
  delete: async (_req, args: { id: string }): Promise<MorphTemplate> => {
    const success = await deleteProcessRequest(args.id);
    const processes = await listProcesses();
    if (!success) {
      return html`
        <div class="${errorStyles}">Failed to delete process</div>
        ${renderProcessTable(processes)}
      `;
    }
    return html`
      <div class="${successStyles}">Process deleted</div>
      ${renderProcessTable(processes)}
    `;
  },
});

function renderProcessTable(processes: ProcessInfo[]): MorphTemplate {
  if (processes.length === 0) {
    return html`
      <div class="${emptyStateStyles}">
        <p>No processes running</p>
        <p>Start a new process using the form above</p>
      </div>
    `;
  }

  const rows = processes.map(
    (p) => html`
      <tr class="${processRowStyles}">
        <td class="${tdStyles} ${monoStyles}">${p.id.slice(0, 8)}</td>
        <td class="${tdStyles}">${p.name}</td>
        <td class="${tdStyles} ${monoStyles}">${p.script}</td>
        <td class="${tdStyles}">${p.pid}</td>
        <td class="${tdStyles}">
          <span class="${getStatusStyle(p.status)}">${p.status}</span>
        </td>
        <td class="${tdStyles}">${formatUptime(p.startedAt)}</td>
        <td class="${tdStyles}">${p.restarts}</td>
        <td class="${tdStyles}">
          ${
            p.status === "running"
              ? html`
              <button
                class="${btnStyles}"
                ${processApi.rpc.stop()}
                hx-vals='{"id": "${p.id}"}'
                hx-target="#processes-container"
                hx-swap="innerHTML"
              >Stop</button>
            `
              : html`
              <button
                class="${btnStyles}"
                ${processApi.rpc.restart()}
                hx-vals='{"id": "${p.id}"}'
                hx-target="#processes-container"
                hx-swap="innerHTML"
              >Start</button>
            `
          }
          <button
            class="${btnStyles}"
            ${processApi.rpc.restart()}
            hx-vals='{"id": "${p.id}"}'
            hx-target="#processes-container"
            hx-swap="innerHTML"
          >Restart</button>
          <button
            class="${btnDangerStyles}"
            ${processApi.rpc.delete()}
            hx-vals='{"id": "${p.id}"}'
            hx-target="#processes-container"
            hx-swap="innerHTML"
            hx-confirm="Delete process '${p.name}'?"
          >Delete</button>
          <button
            class="${expandBtnStyles}"
            onclick="document.getElementById('logs-${p.id}').classList.toggle('hidden')"
            ${logsApi.rpc.get()}
            hx-vals='{"id": "${p.id}"}'
            hx-target="#logs-${p.id}"
            hx-swap="innerHTML"
            hx-trigger="click once"
          >Logs</button>
        </td>
      </tr>
      <tr id="logs-${p.id}" class="hidden">
        <td colspan="8" style="padding: 0 12px 12px 12px;">
          <div style="color: #6e7681; padding: 12px;">Click to load logs...</div>
        </td>
      </tr>
    `,
  );

  return html`
    <style>
      .hidden { display: none; }
    </style>
    <table class="${tableStyles}">
      <thead>
        <tr>
          <th class="${thStyles}">ID</th>
          <th class="${thStyles}">Name</th>
          <th class="${thStyles}">Script</th>
          <th class="${thStyles}">PID</th>
          <th class="${thStyles}">Status</th>
          <th class="${thStyles}">Uptime</th>
          <th class="${thStyles}">Restarts</th>
          <th class="${thStyles}">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// Components
const processList = component(async (): Promise<MorphTemplate> => {
  const processes = await listProcesses();
  return renderProcessTable(processes);
});

const startProcessForm = component((): MorphTemplate => {
  return html`
    <div class="${cardStyles}">
      <form id="start-form" class="${inlineFormStyles}">
        <div class="${formGroupStyles} ${flexGrowStyles}">
          <label class="${labelStyles}">Script Path</label>
          <input
            type="text"
            name="script"
            placeholder="/path/to/script.ts"
            class="${inputStyles}"
            required
          />
        </div>
        <div class="${formGroupStyles}">
          <label class="${labelStyles}">Name (optional)</label>
          <input
            type="text"
            name="name"
            placeholder="my-app"
            class="${inputStyles}"
          />
        </div>
        <div class="${formGroupStyles}">
          <button
            type="submit"
            class="${btnSuccessStyles}"
            ${processApi.rpc.start()}
            hx-target="#processes-container"
            hx-swap="innerHTML"
            hx-include="#start-form"
            hx-on::after-request="if(event.detail.successful) document.getElementById('start-form').reset()"
          >
            Start Process
          </button>
        </div>
      </form>
    </div>
  `;
});

const daemonStatus = component(async (): Promise<MorphTemplate> => {
  const running = await isDaemonRunning();
  return html`
    <span class="${running ? badgeStyles : badgeErrorStyles}">
      ${running ? "Daemon Online" : "Daemon Offline"}
    </span>
  `;
});

// Main page
const homePage = component((): MorphTemplate => {
  return html`
    ${meta({ title: "HEV Dashboard" })}
    <div class="${containerStyles}">
      <header class="${headerStyles}">
        <h1 class="${titleStyles}">
          HEV Dashboard
          ${daemonStatus({})}
        </h1>
        <div class="${monoStyles}" style="color: #8b949e;">
          ${DAEMON_HOST}:${DAEMON_PORT}
        </div>
      </header>

      <h2 class="${sectionTitleStyles}">Start New Process</h2>
      ${startProcessForm({})}

      <h2 class="${sectionTitleStyles}">Processes</h2>
      <div class="${cardStyles}">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
          <button
            class="${btnStyles}"
            ${processApi.rpc.list()}
            hx-target="#processes-container"
            hx-swap="innerHTML"
          >
            Refresh
          </button>
        </div>
        <div id="processes-container" hx-trigger="every 5s" ${processApi.rpc.list()} hx-swap="innerHTML">
          ${processList({})}
        </div>
      </div>
    </div>
  `;
});

function createApp() {
  const morphApp = new Morph({
    layout: basic({ htmx: true, jsonEnc: true }),
  })
    .rpc(processApi)
    .rpc(logsApi)
    .page("/", homePage);

  return morphApp.build();
}

export const dashCommand = new Command()
  .name("dash")
  .description("Start web dashboard for managing processes")
  .option("-p, --port <port:number>", "Port to run the dashboard on", {
    default: 3000,
  })
  .action(async (options) => {
    // Check if daemon is running
    if (!(await isDaemonRunning())) {
      console.error("Daemon is not running. Start it with: hev up");
      Deno.exit(1);
    }

    const port = options.port;
    const app = createApp();

    console.log("Starting HEV Dashboard...");
    console.log(`Open http://localhost:${port} in your browser`);
    console.log("Press Ctrl+C to stop");

    Deno.serve({ port }, app.fetch);
  });
