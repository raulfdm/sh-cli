import meow from "meow";
import { triggerDeploy } from "./modules/trigger-deploy";

const cli = meow(
  `
	Usage
	  $ foo <input>

	Options
	  --rainbow, -r  Include a rainbow

	Examples
	  $ foo unicorns --rainbow
	  🌈 unicorns 🌈
`,
  {
    importMeta: import.meta, // This is required
    flags: {
      rainbow: {
        type: "boolean",
        shortFlag: "r",
      },
      triggerDeploy: {
        type: "boolean",
        default: false,
      },
    },
  },
);

/*
{
	input: ['unicorns'],
	flags: {rainbow: true},
	...
}
*/

if (cli.flags.triggerDeploy) {
  await triggerDeploy();
}

console.log(cli.input.at(0), cli.flags);
