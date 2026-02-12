import meow from "meow";
import { z } from "zod";
import { triggerDeployment } from "./trigger";

export const moduleInput = z.literal("deploy");

const deployInputs = z.union([z.literal("trigger")]);

export async function deploy() {
  const deployCli = meow(
    `
	Deploy - Deployment management commands

	Usage
	  $ homelab deploy <command> [options]

	Commands
	  trigger              Trigger a deployment for a Dokploy application

	Examples
	  # Trigger a deployment using environment variables
	  $ DOKPLOY_SERVER_DOMAIN=https://my-server.com DOKPLOY_API_KEY=your-key DOKPLOY_APP_ID=abc123 homelab deploy trigger

	  # Trigger a deployment using CLI flags  
	  $ homelab deploy trigger --app-id abc123 --server-domain https://my-server.com --api-key your-key

	  # Show trigger command help
	  $ homelab deploy trigger --help
`,
    {
      importMeta: import.meta,
    },
  );

  // First input is `deploy`, second input is the action to perform
  const parsedInput = deployInputs.safeParse(deployCli.input[1]);

  if (parsedInput.error) {
    // If no subcommand provided or invalid subcommand, show help
    deployCli.showHelp();
    return;
  }

  switch (parsedInput.data) {
    case "trigger": {
      await triggerDeployment();
      break;
    }
    default: {
      console.error("Unknown action.");
      deployCli.showHelp();
      break;
    }
  }
}
