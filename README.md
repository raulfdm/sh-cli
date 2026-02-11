# homelab-cli

A command-line tool for self-hosting utilities and deployment automation. Currently supports triggering deployments for [Dokploy](https://dokploy.com) applications.

## Installation

Install globally via npm:

```bash
npm install -g @raulfdm/homelab-cli
```

Or use with npx (no installation required):

```bash
npx @raulfdm/homelab-cli --help
```

## Usage

### Trigger Dokploy Deployment

The primary feature is triggering deployments for Dokploy applications. You can provide configuration through environment variables, CLI flags, or a combination of both.

#### Using Environment Variables

```bash
# Set environment variables
export DOKPLOY_SERVER_DOMAIN="https://your-dokploy-server.com"
export DOKPLOY_API_KEY="your-api-key"
export DOKPLOY_APP_ID="your-application-id"

# Trigger deployment
homelab --trigger-deploy
```

#### Using CLI Flags

```bash
homelab --trigger-deploy \
  --app-id "your-application-id" \
  --server-domain "https://your-dokploy-server.com" \
  --api-key "your-api-key"
```

#### Mixed Approach (CLI flags override environment variables)

```bash
# Use env vars for sensitive data, flags for app-specific values
export DOKPLOY_API_KEY="your-api-key"
homelab --trigger-deploy \
  --app-id "your-application-id" \
  --server-domain "https://your-dokploy-server.com"
```

### Available Commands

- `--trigger-deploy`: Trigger a deployment for a Dokploy application
- `--help`: Show help information

### Configuration Options

| CLI Flag          | Environment Variable    | Description              | Required |
| ----------------- | ----------------------- | ------------------------ | -------- |
| `--app-id`        | `DOKPLOY_APP_ID`        | Application ID to deploy | ✅       |
| `--server-domain` | `DOKPLOY_SERVER_DOMAIN` | Dokploy server URL       | ✅       |
| `--api-key`       | `DOKPLOY_API_KEY`       | Dokploy API key          | ✅       |

## Development

### Prerequisites

- [Bun](https://bun.com) v1.3.6 or higher
- Node.js (for runtime compatibility)

### Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd sh-cli
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

### Development Workflow

#### Running locally during development

```bash
# Run the CLI directly with Bun
bun run src/cli.ts --help

# Example: Test trigger-deploy command
bun run src/cli.ts --trigger-deploy --help
```

#### Building the project

```bash
# Build for distribution
bun run build
```

This will compile the TypeScript source to the `dist/` directory.

#### Code formatting

```bash
# Format code
bun run fmt

# Check formatting without modifying files
bun run fmt:check
```

#### Testing your changes

1. Build the project: `bun run build`
2. Test the built version: `node bin/run.js --help`
3. Or install globally for testing: `npm install -g .`

### Project Structure

```
sh-cli/
├── bin/
│   └── run.js          # Entry point for the published CLI
├── src/
│   ├── cli.ts          # Main CLI interface
│   └── modules/
│       └── trigger-deploy.ts  # Dokploy deployment functionality
├── dist/               # Built JavaScript files (generated)
├── package.json        # Package configuration
└── README.md          # This file
```

### Adding New Commands

1. Create a new module in `src/modules/`
2. Import and integrate it in `src/cli.ts`
3. Update the CLI help text and flags as needed
4. Add tests and documentation

### Publishing

This project uses [Changesets](https://github.com/changesets/changesets) for version management:

```bash
# Add a changeset (describes your changes)
npx changeset

# Version packages (updates version and changelog)
npx changeset version

# Publish to npm
npm publish
```

The build process runs automatically before publishing via the `prepublish` script.
