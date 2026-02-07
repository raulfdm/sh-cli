import meow from "meow";

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

console.log(cli.input.at(0), cli.flags);
