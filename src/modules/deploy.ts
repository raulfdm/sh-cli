import meow from "meow";
import { z } from "zod";

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

const configSchema = z.object({
  appId: z
    .string()
    .min(
      1,
      "Application ID is required. Provide it via --app-id flag or DOKPLOY_APP_ID environment variable.",
    ),
  serverDomain: z
    .string()
    .trim()
    .min(
      1,
      "Server domain is required. Provide it via --server-domain flag or DOKPLOY_SERVER_DOMAIN environment variable.",
    )
    .pipe(z.url()),
  apiKey: z
    .string()
    .min(
      1,
      "API key is required. Provide it via --api-key flag or DOKPLOY_API_KEY environment variable.",
    ),
});

async function triggerDeployment() {
  const triggerDeploymentCli = meow(``, {
    importMeta: import.meta,
    flags: {
      appId: {
        type: "string",
        isRequired: false,
        default: process.env.DOKPLOY_APP_ID || "",
      },
      serverDomain: {
        type: "string",
        isRequired: false,
        default: process.env.DOKPLOY_SERVER_DOMAIN || "",
      },
      apiKey: {
        type: "string",
        isRequired: false,
        default: process.env.DOKPLOY_API_KEY || "",
      },
    },
  });

  const flags = configSchema.safeParse(triggerDeploymentCli.flags);

  if (flags.error) {
    console.log(z.prettifyError(flags.error));
    triggerDeploymentCli.showHelp();
    process.exit(1);
  }

  const config = flags.data;

  const response = await fetch(
    new URL(`/api/application.deploy`, config.serverDomain),
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "x-api-key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        applicationId: config.appId,
      }),
    },
  );

  if (response.ok !== true) {
    console.error("Failed to trigger deployment", {
      applicationId: config.appId,
      json: await response.json(),
      status: response.status,
      statusText: response.statusText,
    });

    throw new Error(`Failed to trigger deployment`);
  }

  console.log("Deployment triggered successfully");
}
