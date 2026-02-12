import meow from "meow";
import { z } from "zod";
import { triggerDeployment } from "./trigger";

export const moduleInput = z.literal("deploy");

const deployInputs = z.union([z.literal("trigger")]);

export async function deploy() {
  const deployCli = meow(
    `
    Deploy 
  `,
    {
      importMeta: import.meta,
    },
  );

  // First input is `deploy`, second input is the action to perform
  const parsedInput = deployInputs.safeParse(deployCli.input[1]);

  if (parsedInput.error) {
    console.error("Invalid command. Please provide a valid command.");
    deployCli.showHelp();
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
