import meow from "meow";
import { z } from "zod";

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

export async function triggerDeployment() {
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

  const response = await fetch(new URL(`/api/application.deploy`, config.serverDomain), {
    method: "POST",
    headers: {
      accept: "application/json",
      "x-api-key": config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      applicationId: config.appId,
    }),
  });

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
