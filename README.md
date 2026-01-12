# HEV

Simple process manager for Deno applications, inspired by pm2.

## Features

- CLI for daemon management
- HTTP API for communication
- Auto-start daemon when needed
- Works on macOS and Linux

## Installation

```bash
curl -fsSL https://raw.githubusercontent.com/vseplet/HEV/main/install.sh | bash
```

Or install manually with Deno:

```bash
deno install --allow-all --global --name hev https://raw.githubusercontent.com/vseplet/HEV/main/src/cli.ts
```

## Usage

### Start daemon

```bash
hev up
```

### Stop daemon

```bash
hev down
```

### Show help

```bash
hev --help
```

## Development

```bash
# Clone repository
git clone https://github.com/vseplet/HEV.git
cd HEV

# Run CLI
deno task cli

# Run daemon directly
deno task daemon

# Check code
deno task fmt:check
deno task lint
deno task check
```

## API

When daemon is running on `http://127.0.0.1:9876`:

| Endpoint    | Method | Description          |
| ----------- | ------ | -------------------- |
| `/health`   | GET    | Check daemon status  |
| `/shutdown` | POST   | Shutdown daemon      |

## Roadmap

See [PLAN.md](PLAN.md) for development roadmap.

## License

GNU General Public License v3.0
