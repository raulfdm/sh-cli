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
  const triggerDeploymentCli = meow(
    `
	Trigger Deployment - Trigger a deployment for a Dokploy application

	Usage
	  $ homelab deploy trigger [options]

	Options
	  --app-id <id>          Application ID to deploy (required if DOKPLOY_APP_ID not set)
	  --server-domain <url>  Dokploy server URL (required if DOKPLOY_SERVER_DOMAIN not set)  
	  --api-key <key>        Dokploy API key (required if DOKPLOY_API_KEY not set)

	Environment Variables (used as defaults):
	  DOKPLOY_SERVER_DOMAIN  Dokploy server URL
	  DOKPLOY_API_KEY        Dokploy API key
	  DOKPLOY_APP_ID         Application ID to deploy

	Examples
	  # Using environment variables
	  $ DOKPLOY_SERVER_DOMAIN=https://my-server.com DOKPLOY_API_KEY=your-key DOKPLOY_APP_ID=abc123 homelab deploy trigger

	  # Using CLI flags (overrides env vars)
	  $ homelab deploy trigger --app-id abc123 --server-domain https://my-server.com --api-key your-key

	  # Mixed approach (CLI flags override env vars)
	  $ DOKPLOY_API_KEY=your-key homelab deploy trigger --app-id abc123 --server-domain https://my-server.com
`,
    {
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
    },
  );

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
