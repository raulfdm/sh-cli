import meow from "meow";
import { triggerDeploy } from "./modules/trigger-deploy";

const cli = meow(
  `
	Homelab CLI - Development utilities and deployment tools

	Usage
	  $ homelab [options]

	Options
	  --trigger-deploy     Trigger a deployment for a Dokploy application

	Examples
	  # Trigger a deployment using environment variables
	  $ DOKPLOY_SERVER_DOMAIN=https://my-server.com DOKPLOY_API_KEY=your-key DOKPLOY_APP_ID=abc123 homelab --trigger-deploy

	  # Trigger a deployment using CLI flags  
	  $ homelab --trigger-deploy --app-id abc123 --server-domain https://my-server.com --api-key your-key

	  # Get help for specific commands
	  $ homelab --trigger-deploy --help

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
