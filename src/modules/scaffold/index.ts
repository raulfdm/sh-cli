import meow from "meow";
import { z } from "zod";
import { dockerScaffold } from "./docker";

export const moduleInput = z.literal("scaffold");

const AllowedInputs = z.union([z.literal("docker")]);

export async function scaffold() {
  const cli = meow(``, {
    importMeta: import.meta,
  });

  const input = AllowedInputs.safeParse(cli.input[1]);

  if (input.error) {
    console.log(z.prettifyError(input.error));
    cli.showHelp();
    process.exit(1);
  }

  switch (input.data) {
    case "docker":
      return dockerScaffold();
  }
}
