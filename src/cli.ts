import meow from "meow";
import { z } from "zod";
import { deploy, moduleInput as deployModuleInput } from "./modules/deploy";
import { scaffold, moduleInput as scaffoldModuleInput } from "./modules/scaffold";

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

const AllowedInputs = z.union([deployModuleInput, scaffoldModuleInput]);
type AllowedInputs = z.infer<typeof AllowedInputs>;

const parsedInput = AllowedInputs.safeParse(cli.input[0]);

if (parsedInput.error) {
  showHelpAndExit();
}

const inputMapper: Record<AllowedInputs, () => Promise<void>> = {
  deploy,
  scaffold,
};

const moduleFn = inputMapper[parsedInput.data];

if (moduleFn) {
  await moduleFn();
} else {
  showHelpAndExit();
}

function showHelpAndExit(): never {
  cli.showHelp();
  process.exit(0);
}
