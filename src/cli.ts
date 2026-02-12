import meow from "meow";
import { z } from "zod";
import { deploy, moduleInput as deployModuleInput } from "./modules/deploy";

const cli = meow(
  `
	Homelab CLI - Development utilities and deployment tools

	Usage
	  $ homelab <command> [options]

	Commands
	  deploy               Deployment management commands

	Use "homelab <command> --help" for more information about a specific command.
`,
  {
    importMeta: import.meta,
  },
);

const AllowedInputs = z.union([deployModuleInput]);

const parsedInput = AllowedInputs.safeParse(cli.input[0]);

if (parsedInput.error) {
  cli.showHelp();
  process.exit(0);
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
