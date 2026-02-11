import meow from "meow";
import z from "zod";

const configSchema = z.object({
  applicationId: z.string(),
  serverURL: z.url(),
  apiKey: z.string(),
});

const envVarsSchema = z.object({
  DOKPLOY_SERVER_DOMAIN: z.string().optional(),
  DOKPLOY_API_KEY: z.string().optional(),
  DOKPLOY_APP_ID: z.string().optional(),
});

export async function triggerDeploy() {
  const envs = envVarsSchema.parse(process.env);

  const cliTriggerDeploy = meow(
    `
    Trigger a deployment for a Dokploy application

    Usage:
      $ homelab --trigger-deploy [options]

    Options:
      --app-id <id>          Application ID to deploy (required if DOKPLOY_APP_ID not set)
      --server-domain <url>  Dokploy server URL (optional, defaults to DOKPLOY_SERVER_DOMAIN)
      --api-key <key>        Dokploy API key (optional, defaults to DOKPLOY_API_KEY)

    Environment Variables (used as defaults):
      DOKPLOY_SERVER_DOMAIN  Dokploy server URL
      DOKPLOY_API_KEY        Dokploy API key  
      DOKPLOY_APP_ID         Application ID to deploy

    Examples:
      # Using environment variables:
      $ DOKPLOY_SERVER_DOMAIN=https://my-server.com DOKPLOY_API_KEY=your-key DOKPLOY_APP_ID=abc123 homelab --trigger-deploy
      
      # Using CLI flags (overrides env vars):
      $ homelab --trigger-deploy --app-id abc123 --server-domain https://my-server.com --api-key your-key
      
      # Mixed approach:
      $ DOKPLOY_API_KEY=your-key homelab --trigger-deploy --app-id abc123 --server-domain https://my-server.com
  `,
    {
      importMeta: import.meta,
      flags: {
        appId: {
          type: "string",
          isRequired: false,
        },
        serverDomain: {
          type: "string",
          isRequired: false,
        },
        apiKey: {
          type: "string",
          isRequired: false,
        },
      },
    },
  );

  // Resolve configuration from CLI flags and environment variables
  // CLI flags take precedence over environment variables
  const applicationId = cliTriggerDeploy.flags.appId || envs.DOKPLOY_APP_ID;
  const serverDomain = cliTriggerDeploy.flags.serverDomain || envs.DOKPLOY_SERVER_DOMAIN;
  const apiKey = cliTriggerDeploy.flags.apiKey || envs.DOKPLOY_API_KEY;

  // Validate that all required values are provided
  if (!applicationId) {
    console.error(
      "Application ID is required. Provide it via --app-id flag or DOKPLOY_APP_ID environment variable.",
    );
    cliTriggerDeploy.showHelp();
    process.exit(1);
  }

  if (!serverDomain) {
    console.error(
      "Server URL is required. Provide it via --server-domain flag or DOKPLOY_SERVER_DOMAIN environment variable.",
    );
    cliTriggerDeploy.showHelp();
    process.exit(1);
  }

  if (!apiKey) {
    console.error(
      "API key is required. Provide it via --api-key flag or DOKPLOY_API_KEY environment variable.",
    );
    cliTriggerDeploy.showHelp();
    process.exit(1);
  }

  const config = configSchema.parse({
    applicationId,
    serverURL: new URL(`/api/application.deploy`, serverDomain).href,
    apiKey,
  });

  const response = await fetch(config.serverURL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "x-api-key": config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      applicationId: config.applicationId,
    }),
  });

  if (response.ok !== true) {
    console.error("Failed to trigger deployment", {
      applicationId: config.applicationId,
      json: await response.json(),
      status: response.status,
      statusText: response.statusText,
    });

    throw new Error(`Failed to trigger deployment`);
  }

  console.log("Deployment triggered successfully");
}
