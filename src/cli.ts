import meow from "meow";
import { z } from "zod";
import { deploy, moduleInput as deployModuleInput } from "./modules/deploy";

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
    importMeta: import.meta,
  },
);

const AllowedInputs = z.union([deployModuleInput]);

const parsedInput = AllowedInputs.safeParse(cli.input[0]);

if (parsedInput.error) {
  console.error("Invalid command. Please provide a valid command.");
  cli.showHelp();
}

switch (parsedInput.data) {
  case "deploy": {
    await deploy();
    break;
  }
  default: {
    cli.showHelp();
  }
}
