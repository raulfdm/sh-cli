import meow from "meow";
import { triggerDeploy } from "./modules/trigger-deploy";

const cli = meow(
  `
	Self-Hosting CLI - Development utilities and deployment tools

	Usage
	  $ sh-cli [options]

	Options
	  --trigger-deploy     Trigger a deployment for a Dokploy application

	Examples
	  # Trigger a deployment using environment variables
	  $ DOKPLOY_SERVER_DOMAIN=https://my-server.com DOKPLOY_API_KEY=your-key DOKPLOY_APP_ID=abc123 sh-cli --trigger-deploy

	  # Trigger a deployment using CLI flags  
	  $ sh-cli --trigger-deploy --app-id abc123 --server-url https://my-server.com --api-key your-key

	  # Get help for specific commands
	  $ sh-cli --trigger-deploy --help

	For more information about specific commands, run them with --help
`,
  {
    importMeta: import.meta, // This is required
    flags: {
      triggerDeploy: {
        type: "boolean",
        default: false,
      },
    },
  },
);

if (cli.flags.triggerDeploy) {
  await triggerDeploy();
} else {
  // Show help if no flags are provided
  cli.showHelp();
}
