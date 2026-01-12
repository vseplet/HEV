# HEV

Simple process manager for Deno applications, inspired by pm2.

## Features

- Start/stop/restart processes
- Auto-restart on crash
- Process monitoring via `ps`
- HTTP API for daemon communication
- Works on macOS and Linux

## Installation

```bash
curl -fsSL https://raw.githubusercontent.com/vseplet/HEV/main/install.sh | bash
```

## Usage

```bash
# Start daemon
hev up

# Start a process
hev start app.ts
hev start app.ts -n myapp

# List processes
hev list

# Stop/restart process
hev stop 0
hev restart 0

# Stop daemon
hev down
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `hev up` | Start daemon |
| `hev down` | Stop daemon |
| `hev start <script>` | Start a process |
| `hev stop <id>` | Stop a process |
| `hev restart <id>` | Restart a process |
| `hev list` | List all processes |

## Development

```bash
git clone https://github.com/vseplet/HEV.git
cd HEV

deno task cli        # Run CLI
deno task daemon     # Run daemon
deno task test       # Run tests
deno task check      # Type check
```

## API

Daemon runs on `http://127.0.0.1:9876`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Daemon status |
| `/shutdown` | POST | Stop daemon |
| `/processes` | GET | List processes |
| `/processes` | POST | Start process |
| `/processes/:id/stop` | POST | Stop process |
| `/processes/:id/restart` | POST | Restart process |

## License

GNU General Public License v3.0
